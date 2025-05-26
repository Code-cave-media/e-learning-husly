from sqlalchemy.orm import Session
from models.course import Course,CouponCode
from schemas.coupon_code import CouponCodeCreate,CouponCodeUpdate
from fastapi import HTTPException
from core.config import settings
from schemas.coupon_code import CouponCodeResponse
def get_coupon_by_code(db:Session,code:str):
  return db.query(CouponCode).filter(CouponCode.code == code).first()

def get_coupon_by_id(db:Session,coupon_id:str):
  return db.query(CouponCode).filter(CouponCode.id == coupon_id).first()

def create_coupon_code(db:Session,data:CouponCodeCreate):
  db_coupon = CouponCode(**data.dict())
  db.add(db_coupon)
  db.commit()
  db.refresh(db_coupon)
  return db_coupon

def update_coupon_code(db:Session,db_coupon:CouponCode,data:CouponCodeUpdate):
  
  for key,value in data.dict(exclude_unset=True).items():
    setattr(db_coupon,key,value)
  db.commit()
  db.refresh(db_coupon)
  return db_coupon

def delete_coupon_code(db:Session,coupon_id:int):
  db_coupon = get_coupon_by_id(db,coupon_id)
  if not db_coupon:
    raise HTTPException(status_code=404,detail="Coupon not found")
  db.delete(db_coupon)
  db.commit()
  return {"detail": "Coupon deleted successfully"}

def get_coupons(db:Session,page: int = 0):
  skip = (page - 1) * settings.COUPONS_PER_PAGE
  items = coupons = db.query(CouponCode).offset(skip).limit(settings.COUPONS_PER_PAGE).all()
  total_count = db.query(CouponCode).count()
  total_pages = (total_count + settings.COUPONS_PER_PAGE - 1 ) // settings.COUPONS_PER_PAGE
  serialized_coupons = [CouponCodeResponse.from_orm(coupon).model_dump() for coupon in coupons]
  return {
    'has_prev':page > 1,
    "has_next" : page < total_pages,
    "data":serialized_coupons,
    "total":total_count
  }

