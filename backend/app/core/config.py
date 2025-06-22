from pydantic  import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_DAYS: int = 30
    BASE_URL: str = "http://localhost:8000"
    MEDIA_PATH: str = "media"
    COUPONS_PER_PAGE:int = 10
    RAZORPAY_KEY_ID:str
    RAZORPAY_SECRET_KEY:str
    PRODUCTION: bool = False
    DO_SPACE_KEY:str
    DO_SPACE_SECRET:str
    DO_SPACE_REGION:str # or your region
    DO_SPACE_ENDPOINT:str
    DO_SPACE_BUCKET :str
    CASHFREE_APP_ID: str
    CASHFREE_SECRET_KEY: str
    CASHFREE_TEST_BASE_URL: str 
    CASHFREE_PROD_BASE_URL: str
    ADMIN_EMAILS:str
    ADMIN_PASSWORDS:str
    class Config:
        env_file = ".env"


settings = Settings()
print(settings.ADMIN_PASSWORDS,settings.ADMIN_EMAILS)