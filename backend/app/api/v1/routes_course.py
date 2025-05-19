from fastapi import APIRouter, UploadFile, File, Depends,HTTPException,Form
from sqlalchemy.orm import Session
from crud import course as crud_course 
from schemas.course import *
from db.session import get_db
from schemas.common import Pagination,PaginationResponse

router = APIRouter()

@router.get('/get/{course_id}',response_model=CourseResponse)
async def create_course(
  course_id:str,
  db:Session=Depends(get_db)
):
  db_course = crud_course.get_course_by_id(db,course_id)
  if not db_course:
    raise HTTPException(status_code=404,detail="Course not found")
  return db_course

@router.post('/create',response_model=CourseResponse)
async def create_course(
  db: Session = Depends(get_db),
  thumbnail: UploadFile | None = File(...),
  title: str = Form(...),
  description: str = Form(...),
  price: float = Form(...),
  commission: float = Form(...),
  visible: bool = Form(...)
):
  thumbnail_url = await crud_course.upload_thumbnail(thumbnail)
  data = {
    "title": title,
    "description": description,
    "price": price,
    "commission": commission,
    "visible": visible,
    "thumbnail":thumbnail_url
  }
  course = crud_course.create_course(db=db,data=data)
  return course

@router.put('/update/{course_id}',response_model=CourseResponse)
async def update_course(
  course_id:str,
  db: Session = Depends(get_db),
  thumbnail: UploadFile | None = File(None),
  title: str | None = Form(None),
  description: str | None = Form(None),
  price: float | None = Form(None),
  commission: float | None = Form(None),
  visible: bool | None = Form(None)
):
  db_course = crud_course.get_course_by_id(db,course_id)
  if not db_course:
    raise HTTPException(status_code=404,detail="Course not found")
  thumbnail_url = await crud_course.update_thumbnail_file(thumbnail,db_course)
  update_data = {
    "title": title if title is not None else db_course.title,
    "description": description if description is not None else db_course.description,
    "price": price if price is not None else db_course.price,
    "commission": commission if commission is not None else db_course.commission,
    "visible": visible if visible is not None else db_course.visible,
    "thumbnail": thumbnail_url

  }
  course = crud_course.update_course(db,db_course,update_data)
  return course

@router.delete('/delete/{course_id}')
async def update_course(course_id:str,db: Session = Depends(get_db)):
  db_course = crud_course.get_course_by_id(db,course_id)
  if not db_course:
    raise HTTPException(status_code=404,detail="Course not found")
  await crud_course.delete_course_files(db_course)
  return crud_course.delete_course(db,db_course)

@router.post('/chapter/create',response_model=CourseChapterResponse)
async def create_course_chapter(
  db: Session = Depends(get_db),
  video: UploadFile = File(...),
  course_id: int = Form(...),
  description: str = Form(...),
  title: str = Form(...),
  duration: str = Form(...),
  visible: bool = Form(...)
):
  db_course = crud_course.get_course_by_id(db,course_id)
  if not db_course:
    raise HTTPException(status_code=404,detail="Course not found")
  video_url = await crud_course.upload_video(video)
  data = {
    "title": title,
    "description": description,
    "duration": duration,
    "course_id": course_id,
    "visible": visible,
    "video":video_url
  }
  course_chapter = crud_course.create_course_chapter(db=db,data=data)
  return course_chapter

@router.put('/chapter/update/{course_chapter_id}',response_model=CourseChapterResponse)
async def update_course_chapter(
  course_chapter_id:str,
  db: Session = Depends(get_db),
  video: UploadFile | None = File(None),
  description: str | None= Form(None),
  title: str | None= Form(None),
  duration: str | None= Form(None),
  visible: bool | None= Form(None)
):
  db_course_chapter = crud_course.get_course_chapter_by_id(db,course_chapter_id)
  if not db_course_chapter:
    raise HTTPException(status_code=404,detail="Course chapter not found")
  video_url = await crud_course.update_video_file(video,db_course_chapter)
  update_data = {
    "title": title if title is not None else db_course_chapter.title,
    "description": description if description is not None else db_course_chapter.description,
    "duration": duration if duration is not None else db_course_chapter.duration,
    "visible": visible if visible is not None else db_course_chapter.visible,
    "video": video_url

  }
  return crud_course.update_course_chapter(db,db_course_chapter,update_data)

@router.delete('/chapter/delete/{course_chapter_id}')
async def update_course(course_chapter_id:str,db: Session = Depends(get_db)):
  db_course_chapter = crud_course.get_course_chapter_by_id(db,course_chapter_id)
  if not db_course_chapter:
    raise HTTPException(status_code=404,detail="Course chapter not found")

  await crud_course.delete_file(db_course_chapter.video)
  return crud_course.delete_course_chapter(db,db_course_chapter)



