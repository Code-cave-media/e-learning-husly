from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
  email :EmailStr
  password : str
  name : str
  phone : str


class UserResponse(BaseModel):
  id: int
  email: EmailStr
  user_id:str
  is_admin:bool
  phone:str
  name:str
  class Config:
      orm_mode = True

class LoginResponse(BaseModel):
  user: UserResponse
  token: str
class LoginRequest(BaseModel):
  email :EmailStr
  password : str

class Token(BaseModel):
  access_token: str
  token_type: str = "bearer"
  user_id : str

class UpdatePassword(BaseModel):
  password: str

