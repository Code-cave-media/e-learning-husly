
import uuid
import os
from core.config import settings
from fastapi import UploadFile 

async def upload_file(file:UploadFile,folder):
    filename = f"{uuid.uuid4().hex}_{file.filename}"
    
    save_dir = os.path.join(settings.MEDIA_PATH, folder)
    os.makedirs(save_dir, exist_ok=True)

    file_path = os.path.join(save_dir, filename)

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    relative_path = os.path.join(folder, filename)
    file_path = f"{relative_path.replace(os.sep, '/')}"
    return file_path

async def delete_file(path):
    full_path = os.path.join(settings.MEDIA_PATH, path.strip("/"))
    if os.path.exists(full_path):
        os.remove(full_path)