from sqlalchemy import Column, Integer, String, ForeignKey,Float,Boolean
from db.base import Base
from .utils import TimestampMixin
from sqlalchemy.orm import relationship

class EBookLandingPage(TimestampMixin, Base):   
    __tablename__ = "ebook_landing_page"
    id = Column(Integer, primary_key=True, index=True)
    main_heading = Column(String, nullable=False)
    sub_heading = Column(String, nullable=False)
    top_heading = Column(String, nullable=False)
    highlight_words = Column(String, nullable=False)
    thumbnail = Column(String, nullable=False)
    ebook_id = Column(Integer, ForeignKey("e_book.id"), unique=True)

class EBookTableContent(TimestampMixin,Base):
    __tablename__ = "ebook_table_content"
    id = Column(Integer, primary_key=True, index=True)
    ebook_id = Column(Integer, ForeignKey("e_book.id"))
    title = Column(String)
    page_number = Column(Integer)

class EBook(TimestampMixin, Base):
    __tablename__ = "e_book"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    price = Column(Float, nullable=False)
    commission = Column(Float)
    pdf = Column(String, nullable=False)  
    thumbnail = Column(String, nullable=True)
    visible = Column(Boolean, default=True)
    landing_page = relationship("EBookLandingPage", backref="ebook", uselist=False)
    chapters = relationship("EBookTableContent", backref="ebook", cascade="all, delete-orphan")
    intro_video = Column(String)
    is_new = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)




