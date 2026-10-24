import os
import uuid
import bcrypt
import enum
from datetime import datetime, timedelta, timezone
from typing import Optional, List

from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError

from sqlalchemy import (
    Column, String, Numeric, Integer, Boolean, DateTime, ForeignKey, func,
    create_engine, FetchedValue, Enum as SQLEnum
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import (
    sessionmaker, declarative_base, relationship, joinedload, selectinload, Session
)

from schemas import (
    UserCreate, ProductCreate, ProductOut, ModifierOptionCreate, ModifierOptionOut,
    ModifierGroupCreate, ModifierGroupOut, OrderCreate, OrderOut
)


# =========================================================
# 1. KONFIGURASI & KONEKSI DATABASE
# =========================================================
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgresql+psycopg://"):
    try:
        import psycopg  # noqa: F401
    except ModuleNotFoundError:
        DATABASE_URL = DATABASE_URL.replace(
            "postgresql+psycopg://", "postgresql+psycopg2://", 1
        )
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "123")
JWT_SECRET = os.getenv("JWT_SECRET", "ganti-ini-di-env")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8  # 8 jam

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dipanggil otomatis oleh FastAPI di tiap endpoint yang butuh akses database."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================================================
# 2. MODELS (mapping ke tabel di Supabase)
# =========================================================
class UserRole(str, enum.Enum):
    admin = "admin"
    cashier = "cashier"
    kitchen = "kitchen"


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)  # password yang sudah di-hash
    role = Column(SQLEnum(UserRole), default=UserRole.cashier)


class RevokedToken(Base):
    """Blacklist token yang sudah di-logout.

    JWT bersifat stateless: server tidak menyimpan sesi, jadi token yang sudah
    keluar tetap valid sampai kedaluwarsa. Tabel ini menyimpan `jti` (ID unik
    tiap token) agar token tersebut bisa ditolak sebelum masa berlakunya habis.
    """

    __tablename__ = "revoked_tokens"

    jti = Column(String, primary_key=True, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked_at = Column(DateTime(timezone=True), server_default=func.now())


class Product(Base):
    __tablename__ = "products"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    description = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ModifierGroup(Base):
    __tablename__ = "modifier_groups"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    options = relationship("ModifierOption", back_populates="group")


class ModifierOption(Base):
    __tablename__ = "modifier_options"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    group_id = Column(UUID(as_uuid=True), ForeignKey("modifier_groups.id", ondelete="CASCADE"))
    label = Column(String, nullable=False)
    price_add = Column(Numeric(10, 2), default=0)
    group = relationship("ModifierGroup", back_populates="options")


class Order(Base):
    __tablename__ = "orders"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # ticket_number adalah identity column (GENERATED ALWAYS) di database,
    # jadi SQLAlchemy tidak boleh mengirim nilainya. FetchedValue = "database yang isi".
    ticket_number = Column(Integer, server_default=FetchedValue(), nullable=False)
    customer_name = Column(String, nullable=True)
    status = Column(String, default="PENDING")
    subtotal = Column(Numeric(10, 2), default=0)
    tax = Column(Numeric(10, 2), default=0)
    total = Column(Numeric(10, 2), default=0)
    estimated_duration_sec = Column(Integer, nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    ready_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    items = relationship("OrderItem", back_populates="order", cascade="all, delete")


class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"))
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"))
    qty = Column(Integer, nullable=False)
    note = Column(String, nullable=True)
    order = relationship("Order", back_populates="items")
    modifiers = relationship("OrderItemModifier", back_populates="order_item", cascade="all, delete")
    product = relationship("Product")


class OrderItemModifier(Base):
    __tablename__ = "order_item_modifiers"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_item_id = Column(UUID(as_uuid=True), ForeignKey("order_items.id", ondelete="CASCADE"))
    modifier_option_id = Column(UUID(as_uuid=True), ForeignKey("modifier_options.id"))
    order_item = relationship("OrderItem", back_populates="modifiers")
    modifier_option = relationship("ModifierOption")


# Membuat tabel yang belum ada (tabel yang sudah ada tidak diubah)
Base.metadata.create_all(bind=engine)


# =========================================================
# 3. HELPER QUERY
# =========================================================
def order_query(db: Session):
    """Query Order lengkap dengan items, product, dan modifiers."""
    return db.query(Order).options(
        selectinload(Order.items).selectinload(OrderItem.product),
        selectinload(Order.items)
        .selectinload(OrderItem.modifiers)
        .selectinload(OrderItemModifier.modifier_option),
    )


# =========================================================
# 4. AUTH
# =========================================================
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )


def get_password_hash(password):
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def create_access_token(username: str, role: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": username,
        "role": role,
        # jti = ID unik token, dipakai untuk mencabut token ini saat logout
        "jti": str(uuid.uuid4()),
        "exp": expire,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token tidak valid atau kedaluwarsa",
    )
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Tolak token yang sudah di-logout (ada di blacklist), walau belum kedaluwarsa
    jti = payload.get("jti")
    if jti and db.query(RevokedToken).filter(RevokedToken.jti == jti).first():
        raise credentials_exception

    user = db.query(Profile).filter(Profile.username == username).first()
    if user is None:
        raise credentials_exception

    return user


def require_roles(*allowed_roles: UserRole):
    """Factory dependency: hanya user dengan role tertentu yang boleh lewat."""
    def role_checker(current_user: Profile = Depends(get_current_user)) -> Profile:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Anda tidak memiliki izin untuk mengakses resource ini",
            )
        return current_user
    return role_checker


# Shortcut supaya endpoint tetap rapi
admin_only       = require_roles(UserRole.admin)
cashier_or_admin = require_roles(UserRole.admin, UserRole.cashier)
kitchen_or_admin = require_roles(UserRole.admin, UserRole.kitchen)
any_staff        = require_roles(UserRole.admin, UserRole.cashier, UserRole.kitchen)

# =========================================================
# 5. APP & MIDDLEWARE
# =========================================================
app = FastAPI(title="BrewOps POS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "BrewOps API is running"}


# =========================================================
# 6. AUTH ENDPOINTS
# =========================================================
@app.post("/api/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(Profile).filter(Profile.username == form_data.username).first()

    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Username atau password salah")

    token = create_access_token(user.username, user.role.value)
    return {"access_token": token, "token_type": "bearer"}


@app.post("/api/auth/logout")
def logout(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Mencabut token yang sedang dipakai dengan memasukkannya ke blacklist."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
    except JWTError:
        # Token sudah rusak/kedaluwarsa: tidak ada yang perlu dicabut
        return {"message": "Token sudah tidak berlaku"}

    jti = payload.get("jti")
    if not jti:
        # Token lama (dibuat sebelum ada klaim jti) tidak bisa dicabut per token
        return {"message": "Token tidak memiliki jti, silakan hapus token di frontend"}

    already_revoked = db.query(RevokedToken).filter(RevokedToken.jti == jti).first()
    if not already_revoked:
        expires_at = (
            datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
            if payload.get("exp")
            else datetime.now(timezone.utc)
            + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        db.add(RevokedToken(jti=jti, expires_at=expires_at))

        # Housekeeping: buang entri yang tokennya sudah kedaluwarsa sendiri
        db.query(RevokedToken).filter(RevokedToken.expires_at < func.now()).delete(
            synchronize_session=False
        )
        db.commit()

    return {"message": "Logout berhasil. Token telah dicabut."}


# =========================================================
# 7. PRODUCTS ENDPOINTS
# =========================================================
@app.get("/api/products", response_model=List[ProductOut])
def list_products(db: Session = Depends(get_db)):
    return db.query(Product).order_by(Product.created_at.asc(), Product.id).all()

@app.get("/api/products/{product_id}", response_model=ProductOut)
def get_product(product_id: uuid.UUID, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan")
    return product

@app.post("/api/products", response_model=ProductOut)
def create_product(data: ProductCreate, db: Session = Depends(get_db), current_user: Profile = Depends(admin_only)):
    product = Product(name=data.name, price=data.price)
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@app.patch("/api/products/{product_id}", response_model=ProductOut)
def update_product(product_id: uuid.UUID, data: ProductCreate, db: Session = Depends(get_db), current_user: Profile = Depends(admin_only)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan")
    product.name = data.name
    product.price = data.price
    db.commit()
    db.refresh(product)
    return product

@app.delete("/api/products/{product_id}")
def delete_product(product_id: uuid.UUID, db: Session = Depends(get_db), current_user: Profile = Depends(admin_only)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan")
    db.delete(product)
    db.commit()
    return {"message": "Produk berhasil dihapus"}


# =========================================================
# 8. MODIFIERS ENDPOINTS
# =========================================================
@app.get("/api/modifier-groups", response_model=List[ModifierGroupOut])
def list_modifier_groups(db: Session = Depends(get_db)):
    return db.query(ModifierGroup).options(joinedload(ModifierGroup.options)).all()

@app.post("/api/modifier-groups", response_model=ModifierGroupOut)
def create_modifier_group(data: ModifierGroupCreate, db: Session = Depends(get_db), current_user: Profile = Depends(admin_only)):
    group = ModifierGroup(name=data.name)
    db.add(group)
    db.commit()
    db.refresh(group)
    return group

@app.post("/api/modifier-groups/{group_id}/options", response_model=ModifierOptionOut)
def add_modifier_option(group_id: uuid.UUID, data: ModifierOptionCreate, db: Session = Depends(get_db), current_user: Profile = Depends(admin_only)):
    group = db.query(ModifierGroup).filter(ModifierGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Grup modifier tidak ditemukan")
    option = ModifierOption(group_id=group_id, label=data.label, price_add=data.price_add)
    db.add(option)
    db.commit()
    db.refresh(option)
    return option

@app.patch("/api/modifier-options/{option_id}", response_model=ModifierOptionOut)
def update_modifier_option(option_id: uuid.UUID, data: ModifierOptionCreate, db: Session = Depends(get_db), current_user: Profile = Depends(admin_only)):
    option = db.query(ModifierOption).filter(ModifierOption.id == option_id).first()
    if not option:
        raise HTTPException(status_code=404, detail="Opsi modifier tidak ditemukan")
    option.label = data.label
    option.price_add = data.price_add
    db.commit()
    db.refresh(option)
    return option

@app.delete("/api/modifier-options/{option_id}")
def delete_modifier_option(option_id: uuid.UUID, db: Session = Depends(get_db), current_user: Profile = Depends(admin_only)):
    option = db.query(ModifierOption).filter(ModifierOption.id == option_id).first()
    if not option:
        raise HTTPException(status_code=404, detail="Opsi modifier tidak ditemukan")
    db.delete(option)
    db.commit()
    return {"message": "Opsi modifier berhasil dihapus"}


# =========================================================
# 9. USER ENDPOINTS
# =========================================================

# @app.post("/api/setup-user")
# def setup_user(user: UserCreate, db: Session = Depends(get_db)):
#     existing_user = db.query(Profile).filter(Profile.username == user.username).first()
#     if existing_user:
#         raise HTTPException(status_code=400, detail="Username sudah digunakan")

#     new_user = Profile(
#         username=user.username,
#         password=get_password_hash(user.password),
#         role=user.role,
#     )
#     db.add(new_user)
#     db.commit()
#     db.refresh(new_user)

#     return {"message": f"User {new_user.username} dengan role {new_user.role} berhasil dibuat"}


@app.get("/api/me")
def get_my_profile(current_user: Profile = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "role": current_user.role.value,
    }


# =========================================================
# 10. ORDERS ENDPOINTS: Cashier & Kitchen
# =========================================================
VALID_STATUSES = {"PENDING", "PREPARING", "READY", "SERVED"}


@app.post("/api/orders", response_model=OrderOut)
def create_order(data: OrderCreate, db: Session = Depends(get_db), current_user: Profile = Depends(cashier_or_admin)):
    # ticket_number TIDAK diisi di sini, database yang menghasilkannya (identity column)
    order = Order(
        customer_name=data.customer_name,
        subtotal=data.subtotal,
        tax=data.tax,
        total=data.total,
        status="PENDING",
    )
    db.add(order)
    db.flush()  # supaya order.id sudah terisi

    for item_in in data.items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item_in.product_id,
            qty=item_in.qty,
            note=item_in.note,
        )
        db.add(order_item)
        db.flush()

        for mod_in in item_in.modifiers:
            db.add(OrderItemModifier(
                order_item_id=order_item.id,
                modifier_option_id=mod_in.modifier_option_id,
            ))

    db.commit()

    # Ambil ulang lengkap dengan items/product/modifiers untuk response
    return order_query(db).filter(Order.id == order.id).first()


@app.get("/api/orders", response_model=List[OrderOut])
def list_orders(
    status_filter: Optional[str] = Query(None, alias="status", description="Contoh: PENDING,PREPARING"),
    db: Session = Depends(get_db),
    current_user: Profile = Depends(any_staff),
):
    query = order_query(db)
    if status_filter:
        status_list = [s.strip().upper() for s in status_filter.split(",")]
        invalid = [s for s in status_list if s not in VALID_STATUSES]
        if invalid:
            raise HTTPException(status_code=400, detail=f"Status tidak valid: {invalid}")
        query = query.filter(Order.status.in_(status_list))
    return query.order_by(Order.created_at.asc()).all()


@app.get("/api/orders/{order_id}", response_model=OrderOut)
def get_order(order_id: uuid.UUID, db: Session = Depends(get_db), current_user: Profile = Depends(any_staff)):
    order = order_query(db).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order tidak ditemukan")
    return order


@app.delete("/api/orders/{order_id}")
def cancel_order(order_id: uuid.UUID, db: Session = Depends(get_db), current_user: Profile = Depends(cashier_or_admin)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order tidak ditemukan")
    db.delete(order)
    db.commit()
    return {"message": "Order berhasil dibatalkan"}


@app.patch("/api/orders/{order_id}/start", response_model=OrderOut)
def start_order(order_id: uuid.UUID, estimated_duration_sec: int, db: Session = Depends(get_db),current_user: Profile = Depends(kitchen_or_admin)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order tidak ditemukan")
    order.status = "PREPARING"
    order.started_at = datetime.utcnow()
    order.estimated_duration_sec = estimated_duration_sec
    db.commit()
    return order_query(db).filter(Order.id == order_id).first()


@app.patch("/api/orders/{order_id}/ready", response_model=OrderOut)
def ready_order(order_id: uuid.UUID, db: Session = Depends(get_db) ,current_user: Profile = Depends(kitchen_or_admin)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order tidak ditemukan")
    order.status = "READY"
    order.ready_at = datetime.utcnow()
    db.commit()
    return order_query(db).filter(Order.id == order_id).first()


@app.patch("/api/orders/{order_id}/serve", response_model=OrderOut)
def serve_order(order_id: uuid.UUID, db: Session = Depends(get_db), current_user: Profile = Depends(cashier_or_admin)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order tidak ditemukan")
    order.status = "SERVED"
    db.commit()
    return order_query(db).filter(Order.id == order_id).first()