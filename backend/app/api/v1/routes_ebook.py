from fastapi import APIRouter, UploadFile, File, Depends,HTTPException,Form
from sqlalchemy.orm import Session
from crud import ebook as crud_ebook 
from schemas.ebook import *
from db.session import get_db
from models.user import User
from core.deps import is_admin_user,get_optional_current_user
from schemas.common import Pagination,PaginationResponse
from crud.purchase import get_purchase_by_user_id_and_item_id_and_type
from crud.affiliate import get_affiliate_link_by_all,add_clicks_to_affiliate_link
router = APIRouter()
@router.get('/get/{ebook_id}',response_model=EBookResponse)
async def create_ebook(
  ebook_id:str,
  db:Session=Depends(get_db)
):
  db_ebook = crud_ebook.get_ebook_by_id(db,ebook_id)
  if not db_ebook:
    raise HTTPException(status_code=404,detail="Ebook not found")
  return db_ebook

@router.get('/get/landing/{ebook_id}',response_model=EbookLandingResponse)
async def get_ebook_landing_page(  
  ebook_id:str,
  db:Session=Depends(get_db),
  current_user:User |None= Depends(get_optional_current_user)
): 
  db_ebook = crud_ebook.get_ebook_by_id(db,ebook_id)
  if not db_ebook:
    raise HTTPException(status_code=404,detail="Ebook not found")
  if current_user and get_purchase_by_user_id_and_item_id_and_type(db,current_user.id,ebook_id,'ebook'):
    db_ebook.is_purchased = True
  return db_ebook

@router.get('/list',response_model=PaginationResponse[EBookResponse])
async def list_ebooks(
  db: Session = Depends(get_db),
  data: Pagination = Depends(),
  current_user: User = Depends(is_admin_user)
): 
  return crud_ebook.get_list_of_ebooks(db,data.page,data.page_size)

@router.post('/create',response_model=EBookResponse)
async def create_ebook(
  db: Session = Depends(get_db),
  current_user: User = Depends(is_admin_user),
  thumbnail: UploadFile = File(...),
  title: str = Form(...),
  description: str = Form(...),
  price: float = Form(...),
  commission: float = Form(...),
  pdf : UploadFile = File(...),
  visible: bool = Form(...),
  is_featured: bool = Form(False),
  is_new: bool = Form(False),
):
  thumbnail_url = await crud_ebook.upload_thumbnail(thumbnail)
  pdf_url = await crud_ebook.upload_pdf_file(pdf)
  data = {
    "title": title,
    "description": description,
    "price": price,
    "commission": commission,
    "visible": visible,
    "thumbnail":thumbnail_url,
    "pdf":pdf_url,
    "is_featured": is_featured,
    "is_new": is_new,
  }
  ebook = crud_ebook.create_ebook(db=db,data=data)
  create_ebook_landing_page = crud_ebook.create_ebook_landing_page(db,ebook.id,)
  return ebook

@router.put('/update/{ebook_id}',response_model=EBookResponse)
async def update_ebook(
  ebook_id:str,
  current_user: User = Depends(is_admin_user),
  db: Session = Depends(get_db),
  thumbnail: UploadFile | None = File(None),
  title: str | None = Form(None),
  description: str | None = Form(None),
  price: float | None = Form(None),
  commission: float | None = Form(None),
  visible: bool | None = Form(None),
  intro_video: UploadFile | None = File(None),
  pdf: UploadFile | None = File(None),
  main_heading: str | None = Form(None),
  top_heading: str | None = Form(None),
  sub_heading: str | None = Form(None),
  highlight_words: str | None = Form(None),
  landing_thumbnail: UploadFile | None = File(None),
  is_featured: bool = Form(False),
  is_new: bool = Form(False),
):
  db_ebook = crud_ebook.get_ebook_by_id(db,ebook_id)
  if not db_ebook:
    raise HTTPException(status_code=404,detail="ebook not found")
  if thumbnail :
    thumbnail_url = await crud_ebook.update_thumbnail_file(thumbnail,db_ebook)
  if intro_video:
    intro_video_url = await crud_ebook.update_intro_video_file(intro_video,db_ebook)
  if pdf:
    pdf_url = await crud_ebook.update_pdf_file(pdf,db_ebook)
  update_data = {
    "title": title if title is not None else db_ebook.title,
    "description": description if description is not None else db_ebook.description,
    "price": price if price is not None else db_ebook.price,
    "commission": commission if commission is not None else db_ebook.commission,
    "visible": visible if visible is not None else db_ebook.visible,
    "intro_video": intro_video_url if intro_video else db_ebook.intro_video,
    "thumbnail": thumbnail_url if thumbnail else db_ebook.thumbnail,
    "pdf": pdf_url if pdf else db_ebook.pdf,
    "is_featured": is_featured if is_featured is not None else db_ebook.is_featured,
    "is_new": is_new if is_new is not None else db_ebook.is_new,
  }
  ebook = crud_ebook.update_ebook(db,db_ebook,update_data)

  # update landing page if provided
  db_landing_page  = crud_ebook.get_ebook_landing_page_by_id(db, ebook_id)
  if not db_landing_page:
    db_landing_page = crud_ebook.create_ebook_landing_page(db, ebook_id)
  if landing_thumbnail:
    landing_thumbnail_url = await crud_ebook.update_landing_thumbnail_file(landing_thumbnail,db_landing_page)
  update_data = {
    "main_heading": main_heading if main_heading is not None else db_landing_page.main_heading,
    "sub_heading": sub_heading if sub_heading is not None else db_landing_page.sub_heading,
    "top_heading": top_heading if top_heading is not None else db_landing_page.top_heading,
    "highlight_words": highlight_words if highlight_words is not None else db_landing_page.highlight_words,
    "thumbnail": landing_thumbnail_url if landing_thumbnail is not None else db_landing_page.thumbnail,
  }
  crud_ebook.update_ebook_landing_page(db, db_landing_page, update_data)
  return ebook

@router.delete('/delete/{ebook_id}')
async def delete_ebook(ebook_id:str,db: Session = Depends(get_db)):
  db_course = crud_ebook.get_ebook_by_id(db,ebook_id)
  if not db_course:
    raise HTTPException(status_code=404,detail="EBook not found")
  await crud_ebook.delete_ebook_files(db_course)
  return crud_ebook.delete_ebook(db,db_course)

@router.post('/chapter/create', response_model=EBookChapterResponse)
async def create_ebook_chapter(
    data:EBookChapterCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(is_admin_user)
):
    db_ebook = crud_ebook.get_ebook_by_id(db, ebook_id=data.ebook_id)
    if not db_ebook:
        raise HTTPException(status_code=404, detail="EBook not found")
    chapter = crud_ebook.create_ebook_chapter(db, 
                                              ebook_id=data.ebook_id, 
                                              title=data.title, 
                                              page_number=data.page_number)
    return chapter

@router.put('/chapter/update/{chapter_id}', response_model=EBookChapterResponse)  
async def update_ebook_chapter(
    chapter_id: int,
    data: EBookChapterUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(is_admin_user)
):
    db_chapter = crud_ebook.get_ebook_chapter_by_id(db, chapter_id)
    if not db_chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    
    updated_chapter = crud_ebook.update_ebook_chapter(db, db_chapter, data.dict(exclude_unset=True))
    return updated_chapter

@router.delete('/chapter/delete/{chapter_id}')
async def delete_ebook_chapter( 
    chapter_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(is_admin_user)
):
    db_chapter = crud_ebook.get_ebook_chapter_by_id(db, chapter_id)
    if not db_chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    
    return crud_ebook.delete_ebook_chapter(db, db_chapter)