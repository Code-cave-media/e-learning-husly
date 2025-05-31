

from pydantic import BaseModel

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