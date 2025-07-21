from sqlalchemy import Column, Integer, String, ForeignKey,Float,Boolean
from db.base import Base
from sqlalchemy.orm import relationship
from .utils import TimestampMixin

class CourseLandingPage(TimestampMixin,Base):
    __tablename__ = "course_landing_page"
    id = Column(Integer, primary_key=True, index=True)
    main_heading = Column(String, nullable=False)
    sub_heading = Column(String, nullable=False)
    top_heading = Column(String, nullable=False)
    highlight_words = Column(String, nullable=False)
    thumbnail = Column(String, nullable=False)
    action_button = Column(String, nullable=False)
    course_id = Column(Integer, ForeignKey("course.id"), unique=True)


class Course(TimestampMixin,Base):
    __tablename__ = "course"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    price = Column(Float)
    commission = Column(Float)
    visible = Column(Boolean,default=True)
    intro_video = Column(String)
    thumbnail = Column(String)
    chapters = relationship("CourseChapter", backref="course", cascade="all, delete-orphan")
    landing_page = relationship("CourseLandingPage", backref="course", uselist=False)
    is_new = Column(Boolean, default=True)  
    is_featured = Column(Boolean, default=False)

class CourseProgress(TimestampMixin, Base):
    __tablename__ = "course_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("course.id"), nullable=False)
    completed = Column(Boolean, default=False)
    chapters = relationship('CourseCompletionChapter',foreign_keys="CourseCompletionChapter.course_progress_id",backref="course_progress")

class CourseCompletionChapter(TimestampMixin, Base):
    __tablename__ = "course_completion_chapter"

    id = Column(Integer, primary_key=True, index=True)
    chapter_id = Column(Integer, ForeignKey("course_chapter.id"), nullable=False)
    course_progress_id = Column(Integer, ForeignKey("course_progress.id"), nullable=False)


class CourseChapter(TimestampMixin,Base):
    __tablename__ = "course_chapter"
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("course.id"))
    video = Column(String)
    title = Column(String)
    description = Column(String)
    duration = Column(String)
    pdf = Column(String, nullable=True)


