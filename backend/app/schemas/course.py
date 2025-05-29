from pydantic import BaseModel,root_validator
import os
from .utils import absolute_media_url
from typing import List
from datetime import datetime
class CourseChapterResponse(BaseModel):
  id :int
  course_id :int
  video : str
  title :str
  description :str
  duration :str
  created_at:datetime
  updated_at:datetime
  pdf: str | None = None

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
class CourseResponse(BaseModel):
  id: int
  title : str
  description : str
  price : float
  commission : float
  visible : bool
  thumbnail:str
  chapters: List[CourseChapterResponse] = []
  landing_page: LandingPageResponse
  created_at:datetime
  updated_at:datetime
  intro_video: str | None = None
  class Config:
    orm_mode = True


class LandingPageCreate(BaseModel):
  main_heading: str
  sub_heading: str
  top_heading: str
  highlight_words: str
  thumbnail: str
  


class EBookResponse(BaseModel):
    id: int
    title: str
    author: str
    description: str
    price: float
    file: str
    thumbnail: str
    visible: bool
    @root_validator(pre=True)
    def def_full_thumbnail_url(cls,instance):
      setattr(instance,'thumbnail',absolute_media_url(instance.thumbnail))
      setattr(instance,'file',absolute_media_url(instance.file))
      return instance

    class Config:
        orm_mode = True