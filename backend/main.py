
import os
import uuid
from datetime import datetime, timedelta
from typing import Optional, List

from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError
from pydantic import BaseModel
from sqlalchemy import (
    Column, String, Numeric, Integer, Boolean, DateTime, ForeignKey, func, create_engine
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import sessionmaker, declarative_base, relationship, joinedload, Session


# =========================================================
# 1. KONFIGURASI & KONEKSI DATABASE
# =========================================================
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
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
# 2. MODELS (mapping ke tabel yang sudah ada di Supabase)
# =========================================================
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
    ticket_number = Column(Integer, nullable=False)
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


# =========================================================
# 3. SCHEMAS (bentuk data request & response)
# =========================================================
class ProductCreate(BaseModel):
    name: str
    price: float
    description: Optional[str] = None
    image_url: Optional[str] = None


class ProductOut(BaseModel):
    id: uuid.UUID
    name: str
    price: float
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_available: bool

    class Config:
        from_attributes = True


class ModifierOptionOut(BaseModel):
    id: uuid.UUID
    label: str
    price_add: float

    class Config:
        from_attributes = True


class ModifierGroupOut(BaseModel):
    id: uuid.UUID
    name: str
    options: List[ModifierOptionOut] = []

    class Config:
        from_attributes = True


class ModifierGroupCreate(BaseModel):
    name: str


class ModifierOptionCreate(BaseModel):
    label: str
    price_add: float = 0


class OrderItemModifierIn(BaseModel):
    modifier_option_id: uuid.UUID


class OrderItemIn(BaseModel):
    product_id: uuid.UUID
    qty: int
    note: Optional[str] = None
    modifiers: List[OrderItemModifierIn] = []


class OrderCreate(BaseModel):
    ticket_number: str
    items: List[OrderItemIn]
    subtotal: float
    tax: float
    total: float
    customer_name: Optional[str] = None


class OrderOut(BaseModel):
    id: uuid.UUID
    ticket_number: int
    status: str
    subtotal: float
    tax: float
    total: float
    started_at: Optional[datetime] = None
    ready_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# =========================================================
# 4. AUTH — login pakai 1 akun hardcoded dari .env
# =========================================================
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")


def create_access_token(username: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": username, "exp": expire}
    return jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token tidak valid atau kedaluwarsa",
    )
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
        return username
    except JWTError:
        raise credentials_exception


# =========================================================
# 5. APP & MIDDLEWARE
# =========================================================
app = FastAPI(title="BrewOps POS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # ganti sesuai domain Next.js kamu nanti
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
@app.post("/api/auth/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    if form_data.username != ADMIN_USERNAME or form_data.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Username atau password salah")
    token = create_access_token(form_data.username)
    return {"access_token": token, "token_type": "bearer"}


@app.post("/api/auth/logout")
def logout():
    # JWT bersifat stateless, jadi "logout" sebenarnya cukup dilakukan
    # di sisi frontend (hapus token dari localStorage/cookie).
    # Endpoint ini disediakan agar frontend punya sesuatu untuk dipanggil.
    return {"message": "Logout berhasil"}


# =========================================================
# 7. PRODUCTS ENDPOINTS
# =========================================================
@app.get("/api/products", response_model=List[ProductOut])
def list_products(db: Session = Depends(get_db)):
    return db.query(Product).all()


@app.get("/api/products/{product_id}", response_model=ProductOut)
def get_product(product_id: uuid.UUID, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan")
    return product


@app.post("/api/products", response_model=ProductOut)
def create_product(data: ProductCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    product = Product(name=data.name, price=data.price)
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@app.patch("/api/products/{product_id}", response_model=ProductOut)
def update_product(product_id: uuid.UUID, data: ProductCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan")
    product.name = data.name
    product.price = data.price
    db.commit()
    db.refresh(product)
    return product


@app.delete("/api/products/{product_id}")
def delete_product(product_id: uuid.UUID, db: Session = Depends(get_db), _=Depends(get_current_user)):
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
def create_modifier_group(data: ModifierGroupCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    group = ModifierGroup(name=data.name)
    db.add(group)
    db.commit()
    db.refresh(group)
    return group


@app.post("/api/modifier-groups/{group_id}/options", response_model=ModifierOptionOut)
def add_modifier_option(group_id: uuid.UUID, data: ModifierOptionCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    group = db.query(ModifierGroup).filter(ModifierGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Grup modifier tidak ditemukan")
    option = ModifierOption(group_id=group_id, label=data.label, price_add=data.price_add)
    db.add(option)
    db.commit()
    db.refresh(option)
    return option


@app.patch("/api/modifier-options/{option_id}", response_model=ModifierOptionOut)
def update_modifier_option(option_id: uuid.UUID, data: ModifierOptionCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    option = db.query(ModifierOption).filter(ModifierOption.id == option_id).first()
    if not option:
        raise HTTPException(status_code=404, detail="Opsi modifier tidak ditemukan")
    option.label = data.label
    option.price_add = data.price_add
    db.commit()
    db.refresh(option)
    return option


@app.delete("/api/modifier-options/{option_id}")
def delete_modifier_option(option_id: uuid.UUID, db: Session = Depends(get_db), _=Depends(get_current_user)):
    option = db.query(ModifierOption).filter(ModifierOption.id == option_id).first()
    if not option:
        raise HTTPException(status_code=404, detail="Opsi modifier tidak ditemukan")
    db.delete(option)
    db.commit()
    return {"message": "Opsi modifier berhasil dihapus"}


# =========================================================
# 9. ORDERS ENDPOINTS — Cashier & Kitchen
# =========================================================
VALID_STATUSES = {"PENDING", "PREPARING", "READY", "SERVED"}


@app.post("/api/orders", response_model=OrderOut)
def create_order(data: OrderCreate, db: Session = Depends(get_db)):
    order = Order(
        customer_name = data.customer_name,
        subtotal=data.subtotal,
        tax=data.tax,
        total=data.total,
        status="PENDING",
    )
    db.add(order)
    db.flush()  # supaya order.id sudah terisi sebelum dipakai order_items

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
    db.refresh(order)
    return order


@app.get("/api/orders", response_model=List[OrderOut])
def list_orders(
    status_filter: Optional[str] = Query(None, alias="status", description="Contoh: PENDING,PREPARING"),
    db: Session = Depends(get_db),
):
    query = db.query(Order)
    if status_filter:
        status_list = [s.strip().upper() for s in status_filter.split(",")]
        invalid = [s for s in status_list if s not in VALID_STATUSES]
        if invalid:
            raise HTTPException(status_code=400, detail=f"Status tidak valid: {invalid}")
        query = query.filter(Order.status.in_(status_list))
    return query.order_by(Order.created_at.asc()).all()


@app.get("/api/orders/{order_id}", response_model=OrderOut)
def get_order(order_id: uuid.UUID, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order tidak ditemukan")
    return order


@app.delete("/api/orders/{order_id}")
def cancel_order(order_id: uuid.UUID, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order tidak ditemukan")
    db.delete(order)
    db.commit()
    return {"message": "Order berhasil dibatalkan"}


@app.patch("/api/orders/{order_id}/start", response_model=OrderOut)
def start_order(order_id: uuid.UUID, estimated_duration_sec: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order tidak ditemukan")
    order.status = "PREPARING"
    order.started_at = datetime.utcnow()
    order.estimated_duration_sec = estimated_duration_sec
    db.commit()
    db.refresh(order)
    return order


@app.patch("/api/orders/{order_id}/ready", response_model=OrderOut)
def ready_order(order_id: uuid.UUID, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order tidak ditemukan")
    order.status = "READY"
    order.ready_at = datetime.utcnow()
    db.commit()
    db.refresh(order)
    return order


@app.patch("/api/orders/{order_id}/serve", response_model=OrderOut)
def serve_order(order_id: uuid.UUID, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order tidak ditemukan")
    order.status = "SERVED"
    db.commit()
    db.refresh(order)
    return order