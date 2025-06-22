from fastapi import Depends,APIRouter,HTTPException,status,UploadFile
from sqlalchemy.orm import Session
from crud import coupon_code as crud_coupon 
from schemas.coupon_code import *
from db.session import get_db
from schemas.common import Pagination,PaginationResponse
from models.user import User
from core.deps import is_admin_user
from fastapi import Query
router = APIRouter()

@router.get('/all',response_model=PaginationResponse)
def get_coupons_code(db:Session=Depends(get_db),
                    current_user:User=Depends(is_admin_user),
                    page:int=Query(1,ge=1),
                    limit:int=Query(10,ge=1,le=100),
                    search:str=Query(''),
                    filter:str=Query('all',regex='^(all|flat|percentage)$')
                    ):
  
  return crud_coupon.get_all_coupons(db,page,limit,search,filter)

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
  if db_coupon.code != data.code and crud_coupon.get_coupon_by_code(db,data.code):
    raise HTTPException(status_code=400,detail="Code already exist")
  return crud_coupon.update_coupon_code(db,db_coupon,data)

@router.delete('/delete/{coupon_id}')
def create_coupon(coupon_id:str,db:Session=Depends(get_db)):
  db_coupon = crud_coupon.get_coupon_by_id(db,coupon_id)
  if not db_coupon:
    raise HTTPException(status_code=400,detail="Coupon not found")
  return crud_coupon.delete_coupon_code(db,db_coupon.id)

@router.post('/apply')
def apply_coupon_code(data:CouponCodeApply,db:Session=Depends(get_db)):
    db_coupon = crud_coupon.get_coupon_by_code(db,data.code)
    if not db_coupon:
        raise HTTPException(status_code=400,detail="Coupon code not found")
    if db_coupon.no_of_access <= 0:
        raise HTTPException(status_code=400,detail="Coupon code has no uses left")
    if  db_coupon.type=='flat' and db_coupon.min_purchase and data.amount < db_coupon.min_purchase:
        raise HTTPException(status_code=400,detail="Minimum purchase amount not met")
    discount = 0
    if db_coupon.type == 'percentage':
        discount = (data.amount * db_coupon.discount) / 100
    elif db_coupon.type == 'flat':
        discount = db_coupon.discount

    return {
        "discount": discount,
        "coupon": db_coupon.code,
    }


