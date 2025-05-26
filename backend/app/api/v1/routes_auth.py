from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from schemas.user import *
from crud import user as crud_user
from core.security import create_access_token
from core.deps import get_current_user,is_admin_user
from models.user import User
from db.session import get_db
router = APIRouter()

@router.post('/register',response_model=UserResponse)
def register(user_in:UserCreate,db:Session=Depends(get_db)):
  existing_user = crud_user.get_user_by_email(db,user_in.email)
  if existing_user:
    raise HTTPException(status_code=400,detail="Email Already Exist")
  db_user = crud_user.create_user(db,user_in)
  crud_user.create_affiliate_account(db,db_user.id)
  return db_user

@router.post('/login',response_model=LoginResponse)
def login(request:LoginRequest,db:Session=Depends(get_db)):
  user = crud_user.get_user_by_email(db,request.email)
  if not user or not crud_user.verify_password(request.password,user.password):
    raise HTTPException(status_code=400,detail="Invalid credentials")
  token = create_access_token(data={'sub':user.email})
  return {'token':token,'user':UserResponse.from_orm(user)} 

@router.get('/me',response_model=UserResponse)
def verify_user(current_user:User=Depends(get_current_user)):
  """For verify the user"""
  return current_user

@router.get('/admin/me',response_model=UserResponse)
def verify_user(current_user:User=Depends(is_admin_user)):
  return current_user

