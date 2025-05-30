from pydantic import BaseModel
class PaymentRequest(BaseModel):
  user_id : int | None = None
  item_id : int
  item_type : str
  affiliate_user_id : int|str | None = None
  email : str | None = None
  password : str | None = None

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
