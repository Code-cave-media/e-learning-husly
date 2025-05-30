from fastapi import Depends,HTTPException,status,Response
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from core.security import decode_token
from db.session import SessionLocal
from crud.auth import get_user_by_email
from models.user import User

oauth2_scheme  = OAuth2PasswordBearer(tokenUrl='/api/v1/auth/login')

def get_db():
  db = SessionLocal()
  try:
    yield db
  finally:
        db.close()

def get_current_user(token:str=Depends(oauth2_scheme),db:Session=Depends(get_db)):
  email = decode_token(token)
  if email is None:
    raise HTTPException(status_code=401,detail="Invalid Token")
  user = get_user_by_email(db,email)
  if not user:
    raise HTTPException(status_code=401,detail="User not found")
  return user

def is_admin_user(current_user:User=Depends(get_current_user)):
  if not current_user.is_admin:
    raise HTTPException(
          status_code=status.HTTP_403_FORBIDDEN,
          detail="You do not have permission to perform this action"
      )
  return current_user