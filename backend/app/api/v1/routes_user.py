from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from schemas.user import *
from crud import auth as crud_auth
from core.security import create_access_token
from core.deps import get_current_user,is_admin_user
from models.user import User
from db.session import get_db
from crud.utils import send_reset_email,get_frontend_url
from core.security import  create_password_reset_token,verify_password_reset_token
router = APIRouter()

@router.post('/register',response_model=UserResponse)
def register(user_in:UserCreate,db:Session=Depends(get_db)):
  existing_user = crud_auth.get_user_by_email(db,user_in.email)
  if existing_user:
    raise HTTPException(status_code=400,detail="Email Already Exist")
  db_user = crud_auth.create_user(db,user_in)
  crud_auth.create_affiliate_account(db,db_user.id)
  return db_user

@router.post('/login',response_model=LoginResponse)
def login(request:LoginRequest,db:Session=Depends(get_db)):
  user = crud_auth.get_user_by_email(db,request.email)
  if not user or not crud_auth.verify_password(request.password,user.password):
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

@router.get('/all')
def get_all_user(db:Session=Depends(get_db),current_user:User=Depends(is_admin_user),
    page:int=1,limit:int=10,search:str=''):
  return crud_auth.get_all_users(db,page,limit,search)

@router.put('/update/password/{user_id}',response_model=UserResponse)
def update_password(user_id:str,data:UpdatePassword,db:Session=Depends(get_db),current_user:User=Depends(is_admin_user)):
  db_user = crud_auth.get_user_by_id(db,user_id)
  if not db_user:
    raise HTTPException(status_code=404,detail="User not found")
  return crud_auth.update_user_password(db,db_user,data.password)

@router.post('/forgot-password')
def forgot_password(data:ForgotPassword,db:Session=Depends(get_db)):
  db_user = crud_auth.get_user_by_email(db,data.email)
  if not db_user:
    raise HTTPException(status_code=404,detail="User not found")
  
  token = create_password_reset_token(db_user.email)
  reset_link = f"{get_frontend_url()}/reset-password?token={token}"
  send_reset_email(db_user.email, reset_link)
  return {"detail": "Reset email sent"}

@router.post("/reset-password")
def reset_password(data:ResetPassword,db:Session=Depends(get_db)):
  email = verify_password_reset_token(data.token)
  db_user = crud_auth.get_user_by_email(db,email)
  if not db_user:
    raise HTTPException(status_code=404,detail="User not found")
  return crud_auth.update_user_password(db,db_user,data.password)
