from sqlalchemy.orm import Session
from models.user import User
from schemas.user import UserCreate
from passlib.context import CryptContext
import uuid
import base64
from models.affiliate import AffiliateAccount
pwd_context = CryptContext(schemes=['bcrypt'],deprecated='auto')


def get_user_by_email(db:Session,email:str):
  return db.query(User).filter(User.email==email).first()

def create_user(db:Session,user:UserCreate):
  hashed_pw = pwd_context.hash(user.password)
  user_id = create_user_id(db)
  db_user = User(email=user.email,password=hashed_pw,user_id=user_id)
  db.add(db_user)
  db.commit()
  db.refresh(db_user)
  return db_user

def verify_password(plain_password, hashed_password):
  return pwd_context.verify(plain_password, hashed_password)

def get_user_by_user_id(db:Session,user_id:str):
  return db.query(User).filter(User.user_id == user_id).first()

def create_user_id(db:Session):
  user_id = short_uuid()
  while get_user_by_user_id(db,user_id):
    user_id = short_uuid()
  return user_id

def short_uuid(length=15):
    uid = uuid.uuid4()
    return base64.urlsafe_b64encode(uid.bytes).decode('utf-8').rstrip('=')[:length]

def create_affiliate_account(db:Session,user_id:int):
  db_account =  db.query(AffiliateAccount).filter(balance=0,user_id=user_id)
  db.add(db_account)
  db.commit()
  db.refresh(db_account)
  return db_account
