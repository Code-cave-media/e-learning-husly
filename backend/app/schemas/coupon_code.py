from pydantic import BaseModel
from typing import Optional


class CouponCodeCreate(BaseModel):
  discount : float
  type : str
  min_purchase:Optional[float]=None
  code:str
  no_of_access:int

class CouponCodeUpdate(BaseModel):
    type: Optional[str] = None
    discount: Optional[float] = None
    min_purchase: Optional[float] = None
    code: Optional[str] = None  # only if you're allowing to change it
    no_of_access: Optional[int] = None

class CouponCodeResponse(BaseModel):
    id : int
    type: str 
    discount:float 
    min_purchase: float | None  = None  # ← Make this optional
    code: str 
    no_of_access: int
    used: int
    class Config:
      orm_mode = True

class CouponCodeApply(BaseModel):
    code: str
    amount: float

    class Config:
      orm_mode = True