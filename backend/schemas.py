from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

import uuid

# =========================================================
#  USER SCHEMAS 
# =========================================================
class UserCreate(BaseModel):
    username: str
    password: str
    role: str


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
