from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
  email :EmailStr
  password : str

class UserResponse(BaseModel):
  id: int
  email: EmailStr
  user_id:str
  class Config:
      from_attributes = True

class LoginRequest(BaseModel):
  email :EmailStr
  password : str

class Token(BaseModel):
  access_token: str
  token_type: str = "bearer"
  user_id : str

