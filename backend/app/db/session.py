from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from core.config import settings
from sqlalchemy.orm import Session
from uuid import uuid4
from crud.auth import update_user_password,create_user
from schemas.user import UserCreate
engine = create_engine(settings.DATABASE_URL,pool_size=10,
    max_overflow=20,      
    pool_timeout=30       )
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield  db
    finally:
        db.close()



def create_admin_user(db:Session):
    from models.user import User
    emails = settings.ADMIN_EMAILS.split(",")
    passwords = settings.ADMIN_PASSWORDS.split(",")
    for email, password in zip(emails, passwords):
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user_data = UserCreate(email=email, password=password, name=email.split("@")[0], phone="0000000000")
            user = create_user(db,user_data,False)

        else:
            user = update_user_password(db,user,password)
        user.is_admin = True
        db.commit() 
        db.refresh(user)
    print("Admin users created or updated successfully.")

create_admin_user(next(get_db()))
