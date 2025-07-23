from pydantic import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_DAYS: int = 30
    BASE_URL: str = "https://backend.hustly.in"
    MEDIA_PATH: str = "media"
    MEDIA_DIR: str = "media"
    COUPONS_PER_PAGE:int = 10
    RAZORPAY_KEY_ID:str
    RAZORPAY_SECRET_KEY:str
    PRODUCTION: bool
    DO_SPACE_KEY:str
    DO_SPACE_SECRET:str
    DO_SPACE_REGION:str # or your region
    DO_SPACE_ENDPOINT:str
    DO_SPACE_BUCKET :str
    CASHFREE_APP_ID_TEST: str
    CASHFREE_SECRET_KEY_TEST: str
    CASHFREE_APP_ID_PROD: str
    CASHFREE_SECRET_KEY_PROD: str
    CASHFREE_TEST_BASE_URL: str 
    CASHFREE_PROD_BASE_URL: str
    ADMIN_EMAILS:str
    ADMIN_PASSWORDS:str
    class Config:
        env_file = ".env"


settings = Settings()
