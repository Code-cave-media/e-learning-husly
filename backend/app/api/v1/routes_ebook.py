from fastapi import APIRouter, UploadFile, File, Depends,HTTPException,Form
from sqlalchemy.orm import Session
from crud import ebook as crud_ebook 
from schemas.ebook import *
from db.session import get_db
from models.user import User
from core.deps import is_admin_user
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

@router.post('/create',response_model=EBookResponse)
async def create_ebook(
  db: Session = Depends(get_db),
  current_user: User = Depends(is_admin_user),
  thumbnail: UploadFile = File(...),
  type: str = Form(...),
  title: str = Form(...),
  description: str = Form(...),
  author: str = Form(...),
  price: float = Form(...),
  commission: float = Form(...),
  pdf : UploadFile = File(...),
  visible: bool = Form(...)
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
    "author":author,
    "type":type
  }
  ebook = crud_ebook.create_ebook(db=db,data=data)
  return ebook

@router.put('/update/{ebook_id}',response_model=EBookResponse)
async def update_ebook(
  ebook_id:str,
  db: Session = Depends(get_db),
  thumbnail: UploadFile | None = File(None),
  title: str | None= Form(None),
  description: str | None= Form(None),
  author: str | None= Form(None),
  price: float | None= Form(None),
  commission: float | None= Form(None),
  pdf : UploadFile | None= File(None),
  visible: bool | None= Form(None)
):
  db_ebook = crud_ebook.get_ebook_by_id(db,ebook_id)
  if not db_ebook:
    raise HTTPException(status_code=404,detail="ebook not found")
  thumbnail_url = await crud_ebook.update_thumbnail_file(thumbnail,db_ebook)
  pdf_url = await crud_ebook.update_pdf_file(pdf,db_ebook)
  update_data = {
    "title": title if title is not None else db_ebook.title,
    "description": description if description is not None else db_ebook.description,
    "price": price if price is not None else db_ebook.price,
    "commission": commission if commission is not None else db_ebook.commission,
    "visible": visible if visible is not None else db_ebook.visible,
    "author": author if author is not None else db_ebook.author,
    "thumbnail": thumbnail_url,
    "pdf":pdf_url

  }
  ebook = crud_ebook.update_ebook(db,db_ebook,update_data)
  return ebook

@router.delete('/delete/{ebook_id}')
async def delete_ebook(ebook_id:str,db: Session = Depends(get_db)):
  db_course = crud_ebook.get_ebook_by_id(db,ebook_id)
  if not db_course:
    raise HTTPException(status_code=404,detail="EBook not found")
  await crud_ebook.delete_ebook_files(db_course)
  return crud_ebook.delete_ebook(db,db_course)
