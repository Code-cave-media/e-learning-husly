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