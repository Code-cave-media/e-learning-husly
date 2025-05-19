from sqlalchemy import Column, Integer, String, ForeignKey,Float,Boolean
from db.base import Base
from sqlalchemy.orm import relationship
from .utils import TimestampMixin

class Course(TimestampMixin,Base):
    __tablename__ = "course"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    price = Column(Float)
    commission = Column(Float)
    visible = Column(Boolean,default=True)
    thumbnail = Column(String)
    chapters = relationship("CourseChapter", backref="course", cascade="all, delete-orphan")

class CourseChapter(TimestampMixin,Base):
    __tablename__ = "course_chapter"
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("course.id"))
    video = Column(String)
    title = Column(String)
    description = Column(String)
    duration = Column(String)
    visible = Column(Boolean,default=True)

class CouponCode(TimestampMixin,Base):
    __tablename__ = "coupon_code"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String,default='fixed')
    discount = Column(Float)
    min_purchase = Column(Float,nullable=True)
    code = Column(String, unique=True)
    no_of_use = Column(Integer)

