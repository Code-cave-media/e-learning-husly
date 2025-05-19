from fastapi import Depends,APIRouter,HTTPException,status,UploadFile
from sqlalchemy.orm import Session
from crud import coupon_code as crud_coupon 
from schemas.coupon_code import *
from db.session import get_db
from schemas.common import Pagination,PaginationResponse

router = APIRouter()

@router.get('/all',response_model=PaginationResponse)
def get_coupons_code(data:Pagination,db:Session=Depends(get_db)):
  return crud_coupon.get_coupons(db,data.page)

@router.get('/{coupon_id}',response_model=CouponCodeResponse)
def get_coupons_code(coupon_id:str,db:Session=Depends(get_db)):
  db_coupon = crud_coupon.get_coupon_by_id(db,coupon_id)
  if not db_coupon:
    raise HTTPException(status_code=400,detail="Code not found")
  return db_coupon

@router.post('/create',response_model=CouponCodeResponse)
def create_coupon(data:CouponCodeCreate,db:Session=Depends(get_db)):
  if crud_coupon.get_coupon_by_code(db,data.code):
    raise HTTPException(status_code=400,detail="Code already exist")
  return crud_coupon.create_coupon_code(db,data)

@router.put('/update/{coupon_id}',response_model=CouponCodeResponse)
def create_coupon(coupon_id:str,data:CouponCodeUpdate,db:Session=Depends(get_db)):
  db_coupon = crud_coupon.get_coupon_by_id(db,coupon_id)
  if not db_coupon:
    raise HTTPException(status_code=400,detail="Coupon not found")
  if crud_coupon.get_coupon_by_code(db,data.code):
    raise HTTPException(status_code=400,detail="Code already exist")
  return crud_coupon.update_coupon_code(db,db_coupon,data)

@router.delete('/delete/{coupon_id}')
def create_coupon(coupon_id:str,db:Session=Depends(get_db)):
  db_coupon = crud_coupon.get_coupon_by_id(db,coupon_id)
  if not db_coupon:
    raise HTTPException(status_code=400,detail="Coupon not found")
  return crud_coupon.delete_coupon_code(db,db_coupon.id)