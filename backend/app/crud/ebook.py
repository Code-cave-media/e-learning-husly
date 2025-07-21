
from sqlalchemy import or_
from sqlalchemy.orm import Session
from models.ebook import EBook,EBookLandingPage,EBookTableContent
from schemas.ebook import EBookResponse
from fastapi import UploadFile
from .utils import delete_file,upload_file
from core.config import settings
from crud.utils import to_pagination_response
from models.user import User
async def upload_thumbnail(thumbnail:UploadFile):
    folder ='ebook/thumbnail'
    return await upload_file(thumbnail,folder)
async def upload_intro_video(thumbnail:UploadFile):
    folder ='ebook/intro'
    return await upload_file(thumbnail,folder)
async def upload_landing_thumbnail(thumbnail:UploadFile):
    folder = "ebook/landing-thumbnail"
    return await upload_file(thumbnail,folder)

async def upload_pdf_file(file:UploadFile):
    folder ='ebook/pdf'
    return await upload_file(file,folder)


async def update_thumbnail_file(thumbnail,db_ebook:EBook):
    await delete_file(db_ebook.thumbnail)
    file_url = await upload_thumbnail(thumbnail)
    return file_url
async def update_landing_thumbnail_file(thumbnail,db_landing_page:EBookLandingPage):
    await delete_file(db_landing_page.thumbnail)
    file_url = await upload_landing_thumbnail(thumbnail)
    return file_url

async def update_intro_video_file(intro_video,db_ebook:EBook):
    await delete_file(db_ebook.intro_video)
    file_url = await upload_intro_video(intro_video)
    return file_url

async def update_pdf_file(pdf,db_ebook:EBook):
    await delete_file(db_ebook.pdf)
    file_url = await upload_pdf_file(pdf)
    return file_url


async def delete_ebook_files(db_ebook:EBook):
    await delete_file(db_ebook.pdf)
    await delete_file(db_ebook.thumbnail)




def get_list_of_ebooks(db: Session, page: int = 1, limit: int = 10, search: str = None):
    query = db.query(EBook)

    if search:
        query = query.filter(
            or_(
                EBook.title.ilike(f"%{search}%"),
                EBook.description.ilike(f"%{search}%")
            )
        )

    query = query.order_by(EBook.created_at.desc())

    data = to_pagination_response(query, EBookResponse, page, limit)
    return data

def get_ebook_by_id(db:Session,ebook_id:int,is_admin:bool=False):
    if is_admin:
        return db.query(EBook).filter(EBook.id == ebook_id).first()
    else:
        return db.query(EBook).filter(EBook.id == ebook_id,EBook.visible==True).first()

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


def create_ebook_landing_page(db:Session,ebook_id:int): 
    from models.ebook import EBookLandingPage
    db_landing = EBookLandingPage(main_heading="",sub_heading="",top_heading="",highlight_words="",thumbnail="",ebook_id=ebook_id,action_button="")
    db.add(db_landing)
    db.commit()
    db.refresh(db_landing)
    return db_landing

def get_ebook_landing_page_by_id(db:Session,ebook_id:int):
    from models.ebook import EBookLandingPage
    return db.query(EBookLandingPage).filter(EBookLandingPage.ebook_id == ebook_id).first()

def update_ebook_landing_page(db:Session,db_landing:EBookLandingPage,update_data:dict):
    for key,value in update_data.items():
        setattr(db_landing, key, value)
    db.commit()
    db.refresh(db_landing)  
    return

def create_ebook_chapter(db:Session,ebook_id:int,title:str,page_number:int):
    from models.ebook import EBookTableContent
    db_chapter = EBookTableContent(ebook_id=ebook_id,title=title,page_number=page_number)
    db.add(db_chapter)
    db.commit()
    db.refresh(db_chapter)
    return db_chapter

def get_ebook_chapter_by_id(db:Session,chapter_id:int):
    from models.ebook import EBookTableContent
    return db.query(EBookTableContent).filter(EBookTableContent.id == chapter_id).first()

def update_ebook_chapter(db:Session,db_chapter:EBookTableContent,update_data:dict):
    for key, value in update_data.items():
        setattr(db_chapter, key, value)
    db.commit()
    db.refresh(db_chapter)
    return db_chapter

def delete_ebook_chapter(db:Session,db_chapter:EBookTableContent):
    db.delete(db_chapter)
    db.commit()
    return {'detail':"Chapter deleted successfully"}