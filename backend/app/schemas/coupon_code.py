from pydantic import BaseModel
from typing import Optional


class CouponCodeCreate(BaseModel):
  discount : float
  type : str
  min_purchase:Optional[float]=None
  code:str
  no_of_use:int

class CouponCodeUpdate(BaseModel):
    type: Optional[str] = None
    discount: Optional[float] = None
    min_purchase: Optional[float] = None
    code: Optional[str] = None  # only if you're allowing to change it
    no_of_use: Optional[int] = None

class CouponCodeResponse(BaseModel):
    id : int
    type: str 
    discount:float 
    min_purchase: float | None  = None  # ← Make this optional
    code: str 
    no_of_use: int

    class Config:
      from_attributes = True