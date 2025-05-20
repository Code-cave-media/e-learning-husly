from pydantic import BaseModel
class PaymentRequest(BaseModel):
  user_id : int | None = None
  item_id : int
  item_type : str
  affiliate_user_id : int|str | None = None
  email : str | None = None
  password : str | None = None

