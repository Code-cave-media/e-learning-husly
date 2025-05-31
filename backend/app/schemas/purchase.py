from pydantic import BaseModel, root_validator, ValidationError
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
