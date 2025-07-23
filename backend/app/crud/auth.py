from sqlalchemy.orm import Session
from models.user import User,TempUser
from schemas.user import UserCreate
from passlib.context import CryptContext
import uuid
import base64
from models.affiliate import AffiliateAccount
from sqlalchemy import or_
from crud.utils import to_pagination_response
from schemas.user import UserResponse
from models.purchase import Purchase
from sqlalchemy import cast, String
from .utils import send_reset_email
pwd_context = CryptContext(schemes=['bcrypt'],deprecated='auto')


def get_user_by_email(db:Session,email:str):
  return db.query(User).filter(User.email==email).first()

def create_user(db:Session,user:UserCreate,is_hashed_pw=False):
  if not is_hashed_pw:
    hashed_pw = pwd_context.hash(user.password)
  else:
    hashed_pw = user.password
  user_id = create_user_id(db)
  db_user = User(email=user.email,password=hashed_pw,user_id=user_id,name=user.name,phone=user.phone)
  db.add(db_user)
  db.commit()
  db.refresh(db_user)
  return db_user

def update_user_password(db:Session,user:User,password:str):
  hashed_pw = pwd_context.hash(password)
  setattr(user,'password',hashed_pw)
  db.commit()
  db.refresh(user)
  return user

def get_temp_user_by_email(db:Session,email:str):
  return db.query(TempUser).filter(TempUser.email==email).first()

def get_temp_user_by_id(db:Session,id:str):
  return db.query(TempUser).filter(TempUser.id==id).first()

def create_temp_user(db:Session,data):
  hashed_pw = pwd_context.hash(data.get('password'))
  db_user = TempUser(email=data.get('email'),password=hashed_pw,name=data.get('name'),phone=data.get('phone'))
  db.add(db_user)
  db.commit()
  db.refresh(db_user)
  return db_user

def update_temp_user(db:Session,temp_user:TempUser,data):
  hashed_pw = pwd_context.hash(data.get('password'))
  setattr(temp_user,'password',hashed_pw)
  setattr(temp_user,'email',data.get('email'))
  setattr(temp_user,'name',data.get('name'))
  setattr(temp_user,'phone',data.get('phone'))
  db.commit()
  db.refresh(temp_user)
  return temp_user

def verify_password(plain_password, hashed_password):
  return pwd_context.verify(plain_password, hashed_password)

def get_user_by_id(db:Session,id:str):
  return db.query(User).filter(User.id == id).first()


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
  db_account =  AffiliateAccount(balance=0,user_id=user_id)
  db.add(db_account)
  db.commit()
  db.refresh(db_account)
  return db_account


def get_all_users(db:Session,page:int=1,limit:int=10,search:str=''):
  query = db.query(User)
  if search:
    
    query = query.filter(
        or_(
            User.name.ilike(f'%{search}%'),
            User.email.ilike(f'%{search}%'),
            User.user_id.ilike(f'%{search}%'),
            cast(User.id, String).ilike(f'%{search}%')  # cast id to string
        )
    )
  data =  to_pagination_response(query,UserResponse,page,limit)
  items = data.get('items')
  for i,user in enumerate(items):
    db_purchase = db.query(Purchase).filter(Purchase.purchased_user_id==None,Purchase.affiliate_user_id == user.get('id')).first()
    if db_purchase:
      items[i]['has_dummy_purchase'] = True
    else:
      items[i]['has_dummy_purchase'] = False
  data['items'] = items
  return data

def sent_reset_mail_to_user(db:Session,email:str):
  ref_id = ''
  pass