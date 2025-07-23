
import uuid
import os
from core.config import settings
from fastapi import UploadFile 
from lib.boto3 import upload_to_space, delete_from_space
import math
import shutil
from schemas.utils import absolute_media_url
from urllib.parse import urlparse

os.makedirs(settings.MEDIA_PATH, exist_ok=True)

async def upload_file(file: UploadFile, folder: str) -> str:
    filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_location = os.path.join(settings.MEDIA_PATH, folder, filename)
    folder_path = os.path.join(settings.MEDIA_PATH, folder)
    os.makedirs(folder_path, exist_ok=True)
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    file_path = os.path.join(folder, filename)
    return absolute_media_url(file_path)
    return upload_to_space(folder, filename, await file.read())

async def delete_file(file_url: str):
    print(file_url,'-------------')
    parsed_url = urlparse(file_url)
    file_path = parsed_url.path
    print(file_path,'==================')
    if not file_path or not file_path.startswith("/media/"):
        return False
    filename = file_path.replace("/media/", "", 1)
    full_path = os.path.join(settings.MEDIA_DIR, filename)
    # Delete the file if it exists
    if os.path.exists(full_path):
        os.remove(full_path)
        return True
    else:
        return False
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
