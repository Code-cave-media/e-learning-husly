from sqlalchemy.orm import Session
from models.course import Course,CourseChapter,CourseLandingPage,CourseProgress,CourseCompletionChapter
from fastapi import UploadFile 
from core.config import settings
import uuid
import os
from core.config import settings
from .utils import *
from schemas.course import CourseResponse
async def upload_thumbnail(file: UploadFile):
    folder = "course/thumbnail"
    return await upload_file(file,folder)
async def upload_landing_thumbnail(file: UploadFile):
    folder = "course/landing-thumbnail"
    return await upload_file(file,folder)
async def upload_intro_video(file: UploadFile):
    folder = "course/intro"
    return await upload_file(file,folder)

async def upload_video(file: UploadFile):
    folder = "course/chapter"
    return await upload_file(file,folder)
async def upload_pdf(file: UploadFile):
    folder = "course/chapter-pdf"
    return await upload_file(file,folder)


def get_course_by_id(db:Session,course_id:int,is_admin:bool=False):
    if is_admin:
        return db.query(Course).filter(Course.id==course_id).first()
    else:
        return db.query(Course).filter(Course.id==course_id,Course.visible==True).first()

def get_course_chapter_by_id(db:Session,course_chapter_id:int):
    return db.query(CourseChapter).filter(CourseChapter.id==course_chapter_id).first()

def get_list_of_courses(db:Session,page:int=1,limit:int=10):
    query = db.query(Course).order_by(Course.created_at.desc())
    return to_pagination_response(query,CourseResponse,page,limit)

def create_course(db:Session,data:dict):
    db_course = Course(**data)
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

def update_course(db: Session, db_course: Course, update_data: dict):
    for key, value in update_data.items():
        setattr(db_course, key, value)
    db.commit()
    db.refresh(db_course)
    return db_course

def delete_course(db:Session,db_course:Course):
    db.delete(db_course)
    db.commit()
    return {'detail':"Course deleted successfully"}

async def delete_course_files(db_course:Course):
    # delete course thumbnail
    await delete_file(db_course.thumbnail)
    for chapter in db_course.chapters:
        await delete_file(chapter.video)

async def update_thumbnail_file(thumbnail,db_course:Course):
    await delete_file(db_course.thumbnail)
    file_url = await upload_thumbnail(thumbnail)
    return file_url
async def update_landing_thumbnail_file(thumbnail,db_landing_page:CourseLandingPage):
    await delete_file(db_landing_page.thumbnail)
    file_url = await upload_landing_thumbnail(thumbnail)
    return file_url

async def update_into_video_file(intro_video,db_course:Course):
    await delete_file(db_course.intro_video)
    file_url = await upload_intro_video(intro_video)
    return file_url


async def update_video_file(video,db_course_chapter:CourseChapter):
    if not video: return
    await delete_file(db_course_chapter.video)
    file_url = await upload_video(video)
    return file_url

async def update_pdf_file(pdf,db_course_chapter:CourseChapter):
    if not pdf : return
    if db_course_chapter.pdf:
        await delete_file(db_course_chapter.pdf)
    file_url = await upload_pdf(pdf)
    return file_url


def create_course_chapter(db:Session,data:dict):
    db_course_chapter = CourseChapter(**data)
    db.add(db_course_chapter)
    db.commit()
    db.refresh(db_course_chapter)
    return db_course_chapter

def update_course_chapter(db:Session,db_course_chapter:CourseChapter,update_data:dict):
    for key, value in update_data.items():
        setattr(db_course_chapter, key, value)
    db.commit()
    db.refresh(db_course_chapter)
    return db_course_chapter

def delete_course_chapter(db:Session,db_course_course:CourseChapter):
    db.delete(db_course_course)
    db.commit()
    return {'detail':"Course Chapter deleted successfully"}

def create_landing_page(db:Session,course_id:int):
    db_landing = CourseLandingPage(main_heading="",sub_heading="",top_heading="",highlight_words="",thumbnail="",course_id=course_id)
    db.add(db_landing)
    db.commit() 
    db.refresh(db_landing)
    return db_landing

def update_landing_page(db:Session,db_landing_page:CourseLandingPage,update_data:dict):
    for key, value in update_data.items():
        print(f"Updating {key} to {value}")
        setattr(db_landing_page, key, value)
    db.commit()
    db.refresh(db_landing_page)
    return db_landing_page

def get_landing_page_by_course_id(db:Session,course_id:int):
    return db.query(CourseLandingPage).filter(CourseLandingPage.course_id==course_id).first()

def create_course_progress(db:Session,data:dict):
    db_course_progress = CourseProgress(**data)
    db.add(db_course_progress)
    db.commit()
    db.refresh(db_course_progress)
    return db_course_progress

def get_or_create_course_progress(db:Session,user_id:int,course_id:int):
    db_course_progress = db.query(CourseProgress).filter(CourseProgress.user_id==user_id,CourseProgress.course_id==course_id).first()
    if not db_course_progress:
        db_course_progress = create_course_progress(db,{
            'user_id':user_id,
            'course_id':course_id
        })
    return db_course_progress

def create_course_completion_chapter(db:Session,data:dict):
    db_course_completion_chapter = CourseCompletionChapter(**data)
    db.add(db_course_completion_chapter)
    db.commit()
    db.refresh(db_course_completion_chapter)
    return db_course_completion_chapter




def get_course_completion_chapter_by_course_progress_id(db:Session,course_progress_id:int,chapter_id:int):
    return db.query(CourseCompletionChapter).filter(CourseCompletionChapter.course_progress_id==course_progress_id,CourseCompletionChapter.chapter_id==chapter_id).first()
