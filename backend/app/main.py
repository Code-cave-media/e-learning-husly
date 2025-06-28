from fastapi import FastAPI
from db.base import Base
from db.session import engine
from api.v1 import routes_coupon_code,routes_course,routes_ebook,routes_purchase,routes_affiliate,routes_user,routes_user_dashboard , routes_admin_dashboard
from fastapi.staticfiles import StaticFiles
from core.config import settings

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
app.include_router(routes_user.router , prefix='/api/v1/user',tags=['auth'])
app.include_router(routes_coupon_code.router , prefix='/api/v1/coupon',tags=['coupon'])
app.include_router(routes_course.router , prefix='/api/v1/course',tags=['course'])
app.include_router(routes_ebook.router , prefix='/api/v1/ebook',tags=['ebook'])
app.include_router(routes_purchase.router , prefix='/api/v1/purchase',tags=['purchase'])
app.include_router(routes_user_dashboard.router , prefix='/api/v1/user-dashboard',tags=['user-dashboard'])
app.include_router(routes_affiliate.router , prefix='/api/v1/affiliate',tags=['affiliate'])
app.include_router(routes_admin_dashboard.router , prefix='/api/v1/admin',tags=['admin'])
app.mount("/media", StaticFiles(directory=settings.MEDIA_PATH), name="media")
