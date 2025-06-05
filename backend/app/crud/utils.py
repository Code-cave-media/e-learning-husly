
import uuid
import os
from core.config import settings
from fastapi import UploadFile 
from lib.boto3 import upload_to_space, delete_from_space
import math
async def upload_file(file: UploadFile, folder: str) -> str:
    filename = f"{uuid.uuid4().hex}_{file.filename}"
    return upload_to_space(folder,filename, await file.read())

async def delete_file(file_url: str):
    if file_url:
        return delete_from_space(file_url)
    return True

def to_pagination_response(
    query,
    schema,
    page: int,
    page_size: int,
):
    skip = (page - 1) * page_size
    total_count = query.count()
    items = query.offset(skip).limit(page_size).all()
    total_pages = math.ceil(total_count / page_size) if page_size else 0
    
    return {
        "has_prev":page > 1,
        "has_next":(page * page_size) < total_count,
        "total":total_count,
        "items":[dict(schema.from_orm(item)) for item in items],
        "total_pages":total_pages,
        "limit":page_size
    }
