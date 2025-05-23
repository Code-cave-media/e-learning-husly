from fastapi import FastAPI
from db.base import Base
from db.session import engine
from api.v1 import routes_auth,routes_coupon_code,routes_course,routes_ebook,routes_purchase
from fastapi.staticfiles import StaticFiles
from core.config import settings
from fastapi import APIRouter, UploadFile, File
import uuid
import os
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
app.include_router(routes_auth.router , prefix='/api/v1/auth',tags=['auth'])
app.include_router(routes_coupon_code.router , prefix='/api/v1/coupon',tags=['coupon'])
app.include_router(routes_course.router , prefix='/api/v1/course',tags=['course'])
app.include_router(routes_ebook.router , prefix='/api/v1/ebook',tags=['ebook'])
app.include_router(routes_purchase.router , prefix='/api/v1/purchase',tags=['transaction'])
app.mount("/media", StaticFiles(directory=settings.MEDIA_PATH), name="media")
