from pydantic import BaseModel,root_validator
import os
from .utils import absolute_media_url
from datetime import datetime

class EBookChapterResponse(BaseModel):
    id: int
    ebook_id: int
    title: str
    page_number: int

    class Config:
        orm_mode = True


class LandingPageResponse(BaseModel):
    id: int
    main_heading: str
    sub_heading: str
    top_heading: str
    highlight_words: str
    thumbnail: str
    action_button :str | None
    class Config:
        orm_mode = True

class EBookResponse(BaseModel):
    id: int
    title: str
    description: str
    price: float
    pdf: str
    thumbnail: str
    intro_video: str | None
    visible: bool
    created_at:datetime
    updated_at:datetime
    commission: float 
    chapters: list[EBookChapterResponse] = []
    landing_page: LandingPageResponse
    is_featured: bool
    is_new : bool
    class Config:
        orm_mode = True

class EBookChapterCreate(BaseModel):
    title: str
    page_number: int
    ebook_id: int
    class Config:
        orm_mode = True
class EBookChapterUpdate(BaseModel):
    title: str | None = None
    page_number: int | None = None
    class Config:
        orm_mode = True

class EbookListResponse(BaseModel):
    id: int
    title: str
    description: str
    is_featured: bool
    is_new : bool
    price: float
    thumbnail: str
    class Config:
        orm_mode = True


class EbookLandingResponse(BaseModel):
    id: int
    title : str
    description : str
    price : float
    commission : float
    thumbnail:str
    landing_page: LandingPageResponse
    intro_video: str 
    is_featured: bool
    is_new : bool
    is_purchased: bool = False
    class Config:
        orm_mode = True
