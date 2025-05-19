
from sqlalchemy.orm import Session
from models.ebook import EBook
from fastapi import UploadFile
from .utils import delete_file,upload_file
async def upload_thumbnail(thumbnail:UploadFile):
    folder ='ebook/thumbnail'
    return await upload_file(thumbnail,folder)

async def upload_pdf_file(file:UploadFile):
    folder ='ebook/pdf'
    return await upload_file(file,folder)

async def update_thumbnail_file(thumbnail,db_ebook:EBook):
    if thumbnail:
        await delete_file(db_ebook.thumbnail)
        file_url = await upload_thumbnail(thumbnail)
        return file_url
    print('No new file')
    return db_ebook.thumbnail

async def update_pdf_file(pdf,db_ebook:EBook):
    if pdf:
        await delete_file(db_ebook.pdf)
        file_url = await upload_pdf_file(pdf)
        return file_url
    print('No new file')
    return db_ebook.pdf

async def delete_ebook_files(db_ebook:EBook):
    await delete_file(db_ebook.pdf)
    await delete_file(db_ebook.thumbnail)


def get_ebook_by_id(db:Session,ebook_id:int):
    return db.query(EBook).filter(EBook.id == ebook_id).first()

def create_ebook(db:Session,data:dict):
    db_ebook = EBook(**data)
    db.add(db_ebook)
    db.commit()
    db.refresh(db_ebook)
    return db_ebook

def update_ebook(db:Session,db_ebook:EBook,update_data:dict):
    for key, value in update_data.items():
        setattr(db_ebook, key, value)
    db.commit()
    db.refresh(db_ebook)
    return db_ebook

def delete_ebook(db:Session,db_ebook:EBook):
    db.delete(db_ebook)
    db.commit()
    return {'detail':"EBook deleted successfully"}



