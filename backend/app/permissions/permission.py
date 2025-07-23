# permissions.py
from fastapi import Depends, HTTPException,Path
from sqlalchemy.orm import Session
from models.user import User
from core.deps import get_db, get_current_user
import crud.course as crud_course 
from models.purchase import Purchase
import crud.ebook as crud_ebook
async def has_purchased_course(
    course_id: str = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_course = crud_course.get_course_by_id(db, course_id)
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    if current_user.is_admin:
        return db_course
    print("Hi")
    purchase = db.query(Purchase).filter(Purchase.purchased_user_id == current_user.id,Purchase.item_type=='course',Purchase.item_id==course_id).first()
    print(purchase)

    if not purchase:
        raise HTTPException(status_code=403, detail="Access denied: Course not purchased")

    return db_course

async def has_purchased_ebook(
    ebook_id: str = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_ebook = crud_ebook.get_ebook_by_id(db, ebook_id)
    if not db_ebook:
        raise HTTPException(status_code=404, detail="Ebook not found")
    if current_user.is_admin:
        return db_ebook
    purchase = db.query(Purchase).filter(Purchase.purchased_user_id == current_user.id,Purchase.item_type=='ebook',Purchase.item_id==ebook_id).first()
    if not purchase:
        raise HTTPException(status_code=403, detail="Access denied: Course not purchased")

    return db_ebook