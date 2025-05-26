from sqlalchemy.orm import Session
from models.course import Course,CourseChapter,CourseLandingPage
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
async def upload_intro_video(file: UploadFile):
    folder = "course/intro"
    return await upload_file(file,folder)

async def upload_video(file: UploadFile):
    folder = "course/chapter"
    return await upload_file(file,folder)


def get_course_by_id(db:Session,course_id:int):
    return db.query(Course).filter(Course.id==course_id).first()

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
    if thumbnail:
        await delete_file(db_course.thumbnail)
        file_url = await upload_thumbnail(thumbnail)
        return file_url
    print('No new file')
    return db_course.thumbnail

async def update_video_file(video,db_course_chapter:CourseChapter):
    if video:
        await delete_file(db_course_chapter.video)
        file_url = await upload_video(video)
        return file_url
    print('No new file')
    return db_course_chapter.video

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

