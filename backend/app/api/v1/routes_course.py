from fastapi import APIRouter, UploadFile, File, Depends,HTTPException,Form
from sqlalchemy.orm import Session
from crud import course as crud_course 
from schemas.course import *
from db.session import get_db
from schemas.common import Pagination,PaginationResponse
from core.deps import is_admin_user,get_current_user,get_optional_current_user
from crud.purchase import get_purchase_by_user_id_and_item_id_and_type
from models.user import User
from permissions.permission import has_purchased_course
from models.course import Course
router = APIRouter()
@router.get('/get/watch/{course_id}')
async def create_course(
  db:Session=Depends(get_db),
  db_course:Course = Depends(has_purchased_course),
  current_user:User = Depends(get_current_user)
):
  db_course_progress = crud_course.get_or_create_course_progress(db,current_user.id,db_course.id)

  res = CourseWatchResponse.from_orm(db_course).dict()
  for i,chapter in enumerate(db_course.chapters):
    db_course_completion_chapter = crud_course.get_course_completion_chapter_by_course_progress_id(db,db_course_progress.id,chapter.id)
    if db_course_completion_chapter:
      res['chapters'][i]['completed'] = True
    else:
      res['chapters'][i]['completed'] = False
  if len(db_course_progress.chapters) == len(db_course.chapters):
    res['completed'] = True
  else:
    res['completed'] = False
  res['course_progress'] = CourseProgressResponse.from_orm(db_course_progress).dict()
  return res



@router.get('/get/landing/{course_id}',response_model=CourseLandingResponse)
async def get_course_landing_page(  
  course_id:str,
  db:Session=Depends(get_db) ,
  current_user:User |None= Depends(get_optional_current_user)  
):  
  db_course = crud_course.get_course_by_id(db,course_id)
  if not db_course:
    raise HTTPException(status_code=404,detail="Course not found")
  if current_user and get_purchase_by_user_id_and_item_id_and_type(db,current_user.id,db_course.id,'ebook'):
    db_course.is_purchased = True
  return db_course

@router.get('/list')
async def list_courses(
  db: Session = Depends(get_db),
  data: Pagination = Depends()): 
  return crud_course.get_list_of_courses(db,data.page,data.size,data.search)

@router.post('/create',response_model=CourseResponse)
async def create_course(
  db: Session = Depends(get_db),
  current_user:User = Depends(is_admin_user),
  thumbnail: UploadFile | None = File(...),
  title: str = Form(...),
  description: str = Form(...),
  price: float = Form(...),
  commission: float = Form(...),
  visible: bool = Form(...),
  intro_video: UploadFile  = File(...),
  is_featured: bool = Form(False),
  is_new: bool = Form(False),
):
  thumbnail_url = await crud_course.upload_thumbnail(thumbnail)
  intro_video_url = await crud_course.upload_intro_video(intro_video)
  data = {
    "title": title,
    "description": description,
    "price": price,
    "commission": commission,
    "visible": visible,
    "thumbnail":thumbnail_url,
    "intro_video": intro_video_url,
    "is_featured": is_featured,
    "is_new": is_new,
  }
  course = crud_course.create_course(db=db,data=data)
  db_landing = crud_course.create_landing_page(db,course.id)
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
  visible: bool | None = Form(None),
  intro_video: UploadFile | None = File(None),
  main_heading: str | None = Form(None),
  top_heading: str | None = Form(None),
  sub_heading: str | None = Form(None),
  action_button:str | None = Form(None),
  highlight_words: str | None = Form(None),
  landing_thumbnail: UploadFile | None = File(None),
  is_featured: bool = Form(False),
  is_new: bool = Form(False),

  current_user: User = Depends(is_admin_user)
  
):
  db_course = crud_course.get_course_by_id(db,course_id,is_admin=True)
  if not db_course:
    raise HTTPException(status_code=404,detail="Course not found")
  if thumbnail:
    thumbnail_url = await crud_course.update_thumbnail_file(thumbnail,db_course)
  if intro_video:
    intro_video_url = await crud_course.update_into_video_file(intro_video,db_course)
  
  
  update_data = {
    "title": title if title is not None else db_course.title,
    "description": description if description is not None else db_course.description,
    "price": price if price is not None else db_course.price,
    "commission": commission if commission is not None else db_course.commission,
    "visible": visible if visible is not None else db_course.visible,
    "thumbnail": thumbnail_url if thumbnail else db_course.thumbnail,
    "intro_video": intro_video_url if intro_video else db_course.intro_video,
    "is_featured": is_featured if is_featured is not None else db_course.is_featured,
    "is_new": is_new if is_new is not None else db_course.is_new,
  }
  course = crud_course.update_course(db,db_course,update_data)
  # update course landing page
  db_landing_page =  crud_course.get_landing_page_by_course_id(db,course.id)
  if not db_landing_page:
    db_landing_page = crud_course.create_landing_page(db,course.id)
  if landing_thumbnail and db_landing_page:
    landing_thumbnail_url = await crud_course.update_landing_thumbnail_file(landing_thumbnail,db_landing_page)
  update_data = {
    "main_heading": main_heading if main_heading is not None  else db_landing_page.main_heading ,
    "sub_heading": sub_heading if sub_heading is not None  else db_landing_page.sub_heading ,
    "top_heading": top_heading if top_heading is not None  else db_landing_page.top_heading ,
    "highlight_words": highlight_words if highlight_words is not None else db_landing_page.highlight_words ,
    "thumbnail": landing_thumbnail_url if landing_thumbnail is not None else db_landing_page.thumbnail,
    "action_button":action_button if action_button is not None  else db_landing_page.action_button
  }
  crud_course.update_landing_page(db,db_landing_page,update_data)
  return course

@router.delete('/delete/{course_id}')
async def update_course(course_id:str,db: Session = Depends(get_db)):
  db_course = crud_course.get_course_by_id(db,course_id,is_admin=True)
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
):
  db_course = crud_course.get_course_by_id(db,course_id,is_admin=True)
  if not db_course:
    raise HTTPException(status_code=404,detail="Course not found")
  video_url = await crud_course.upload_video(video)
  data = {
    "title": title,
    "description": description,
    "duration": duration,
    "course_id": course_id,
    "video":video_url
  }
  course_chapter = crud_course.create_course_chapter(db=db,data=data)
  return course_chapter

@router.put('/chapter/update/{course_chapter_id}',response_model=CourseChapterResponse)
async def update_course_chapter(
  course_chapter_id:str,
  db: Session = Depends(get_db),
  video: UploadFile | None = File(None),
  pdf: UploadFile | None = File(None),
  description: str | None= Form(None),
  title: str | None= Form(None),
  duration: str | None= Form(None),

):
  db_course_chapter = crud_course.get_course_chapter_by_id(db,course_chapter_id)
  if not db_course_chapter:
    raise HTTPException(status_code=404,detail="Course chapter not found")
  print(video,pdf)  
  video_url = await crud_course.update_video_file(video,db_course_chapter)
  pdf_url = await crud_course.update_pdf_file(pdf,db_course_chapter)
  update_data = {
    "title": title if title is not None else db_course_chapter.title,
    "description": description if description is not None else db_course_chapter.description,
    "duration": duration if duration is not None else db_course_chapter.duration,
    "video": video_url if video_url is not None else db_course_chapter.video,
    "pdf": pdf_url if pdf_url is not None else db_course_chapter.pdf,
  }
  return crud_course.update_course_chapter(db,db_course_chapter,update_data)

@router.delete('/chapter/delete/{course_chapter_id}')
async def update_course(course_chapter_id:str,db: Session = Depends(get_db)):
  db_course_chapter = crud_course.get_course_chapter_by_id(db,course_chapter_id)
  if not db_course_chapter:
    raise HTTPException(status_code=404,detail="Course chapter not found")

  await crud_course.delete_file(db_course_chapter.video)
  await crud_course.delete_file(db_course_chapter.pdf)
  return crud_course.delete_course_chapter(db,db_course_chapter)

@router.post('/chapter/complete/{course_chapter_id}')
async def complete_chapter(
  course_chapter_id:int,  
  db:Session=Depends(get_db),
  current_user:User = Depends(get_current_user)
):
  db_course_chapter = crud_course.get_course_chapter_by_id(db,course_chapter_id)
  if not db_course_chapter:
    raise HTTPException(status_code=404,detail="Course chapter not found")
  db_course_progress = crud_course.get_or_create_course_progress(db,current_user.id,db_course_chapter.course_id)
  db_course_completion_chapter = crud_course.get_course_completion_chapter_by_course_progress_id(db,db_course_progress.id,db_course_chapter.id)
  if db_course_completion_chapter:
    raise HTTPException(status_code=400,detail="Chapter already completed")
  db_course_completion_chapter = crud_course.create_course_completion_chapter(db,data={'course_progress_id':db_course_progress.id,'chapter_id':db_course_chapter.id})
  db_course = crud_course.get_course_by_id(db,db_course_chapter.course_id)
  if len(db_course_progress.chapters) == len(db_course.chapters):
    db_course_progress.completed = True
    db.commit()
  return {"course_completed":db_course_progress.completed,
          "course_chapter_completion":CourseCompletionChapterResponse.from_orm(db_course_completion_chapter).dict()
          }
