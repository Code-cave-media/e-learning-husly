

from pydantic import BaseModel,validator
from datetime import datetime

class AffiliateLinkCreate(BaseModel):
    item_id:int
    item_type: str 

class AffiliateLinkResponse(BaseModel):
    id: int
    item_id: int
    item_type: str
    user_id: int

    class Config:
        orm_mode = True

class AddAffiliateLinkClicks(BaseModel):
    affiliate_user_id: str | int
    item_id: str | int 
    item_type: str


class WithdrawResponse(BaseModel):
    id: int
    amount: float
    created_at: datetime  # Make this a string for the frontend
    status: str
    explanation: None | str
    account_details: str | None

    @validator("created_at", pre=False)
    def format_created_at(cls, v: datetime) -> str:
        return v.strftime('%Y-%m-%d') 

    class Config:
        orm_mode = True

class WithdrawCreate(BaseModel):
    amount : float
    upi_id:str | None
    bank_name : str | None
    account_number : str | None
    ifsc_code : str | None
    account_name : str | None

class UPIDetailsResponse(BaseModel):
    upiId:str | None
    class Config:
        orm_mode = True

class BankAccountResponse(BaseModel):
    bank_name : str | None
    account_number : str | None
    ifsc_code : str | None
    account_name : str | None
    class Config:
        orm_mode = True

class WithdrawUpdateStatus(BaseModel):
    status: str
    explanation: str | None

class WithdrawResponse(BaseModel):
    id: int
    user_id: int
    amount: float
    created_at: datetime  # Make this a string for the frontend
    status: str
    explanation: None | str
    account_details: str | None

    class Config:
        orm_mode = True