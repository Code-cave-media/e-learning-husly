from pydantic import BaseModel,root_validator
import os
from .utils import absolute_media_url
from datetime import datetime

class EBookResponse(BaseModel):
    id: int
    title: str
    author: str
    description: str
    price: float
    pdf: str
    thumbnail: str
    visible: bool
    created_at:datetime
    updated_at:datetime
    @root_validator(pre=True)
    def def_full_thumbnail_url(cls,instance):
      setattr(instance,'thumbnail',absolute_media_url(instance.thumbnail))
      setattr(instance,'pdf',absolute_media_url(instance.pdf))
      return instance

    class Config:
        orm_mode = True