from sqlalchemy.orm import Session
from models.coupon import Coupon
from schemas.coupon_code import CouponCodeCreate,CouponCodeUpdate
from fastapi import HTTPException
from core.config import settings
from schemas.coupon_code import CouponCodeResponse
from crud.utils import to_pagination_response
def get_coupon_by_code(db:Session,code:str):
  return db.query(Coupon).filter(Coupon.code == code,Coupon.visible == True).first()

def get_coupon_by_id(db:Session,coupon_id:str):
  return db.query(Coupon).filter(Coupon.id == coupon_id).first()

def create_coupon_code(db:Session,data:CouponCodeCreate):
  db_coupon = Coupon(**data.dict())
  db.add(db_coupon)
  db.commit()
  db.refresh(db_coupon)
  return db_coupon

def update_coupon_code(db:Session,db_coupon:Coupon,data:CouponCodeUpdate):
  
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

def get_all_coupons(db:Session,page: int = 0,limit:int=10,search:str='',filter:str='all'):
  query = db.query(Coupon).order_by(Coupon.created_at.desc())
  if filter and filter != 'all':
    query = query.filter(Coupon.type == filter)
  if search:
    query = query.filter(Coupon.code.ilike(f"%{search}%"))
  return to_pagination_response(query,CouponCodeResponse,page,limit)


