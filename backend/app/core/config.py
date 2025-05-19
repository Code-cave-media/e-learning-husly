from pydantic_settings  import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_DAYS: int = 30
    BASE_URL: str = "http://localhost:8000"
    MEDIA_PATH: str = "media"
    COUPONS_PER_PAGE:int = 10
    class Config:
        env_file = ".env"


settings = Settings()