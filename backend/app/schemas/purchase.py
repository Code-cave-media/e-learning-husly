from pydantic import BaseModel, root_validator, ValidationError,EmailStr
from datetime import datetime
from schemas.user import UserResponse
from models.user import User
class PaymentRequest(BaseModel):
  user_id : str | None = None
  item_id : int
  item_type : str
  affiliate_user_id : int|str | None = None
  name : str | None = None
  phone : str | None = None
  email : str | None = None
  password : str | None = None
  discount : int | None = 0
  coupon : str | None = None

  @root_validator
  def check_user_info(cls, values):
        user_id = values.get('user_id')
        name = values.get('name')
        email = values.get('email')
        password = values.get('password')
        phone = values.get('phone')

        if user_id is None:
            if not all([name, email, password, phone]):
                raise ValueError(
                    "If 'user_id' is not provided, then 'name', 'email', 'password', and 'phone' must all be provided."
                )
        return values

class AffiliateUser(BaseModel):
  id: int
  name : str
  user_id: str
  class Config:
    orm_mode = True

class CheckoutResponse(BaseModel):
  id: str
  title: str
  price: int
  thumbnail :str
  class Config:
    orm_mode = True

class PurchaseVerifyRequest(BaseModel):
  transaction_id: str


class TransactionResponse (BaseModel):
    transaction_id: str
    status: str
    provider: str
    utr_id: str | None = None
    method: str
    vpa: str | None = None
    email: EmailStr | None = None
    contact: str | None = None
    currency: str
    amount: int | None = None
    base_amount: int | None = None
    fee: int | None = None
    tax: int | None = None
    error_code: str | None = None
    error_description: str | None = None
    created_at : datetime
    item_id: int | None = None
    item_type: str | None = None
    class Config:
      orm_mode = True
  
class ListTransactionResponse(BaseModel):
    transaction_id: str | None = 'dummy'
    status: str | None = 'dummy'
    method: str | None = 'dummy'
    class Config:
        orm_mode = True

class PurchaseCreateRequest(BaseModel):
  item_id: int
  item_type: str
  user_id: int | str | None = None
  affiliate_user_id: int | str | None = None
  amount: float | None = None

class PurchaseResponse(BaseModel):
  id: int | None = None
  item_id: int | None = None
  item_type: str | None = None
  created_at: datetime | None = None
  user: UserResponse | None = None
  affiliate_user: UserResponse | None = None
  transaction: ListTransactionResponse | None = None
  amount : float  | None = None
  discount : float | None = None
  coupon_code : str | None = None
  coupon_type : str | None = None
  class Config:
    orm_mode = True
