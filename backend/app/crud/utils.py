
import uuid
import os
from core.config import settings
from fastapi import UploadFile 
from lib.boto3 import upload_to_space, delete_from_space
import math
import shutil
from schemas.utils import absolute_media_url
from urllib.parse import urlparse
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from core.config import settings
os.makedirs(settings.MEDIA_PATH, exist_ok=True)

async def upload_file(file: UploadFile, folder: str) -> str:
    filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_location = os.path.join(settings.MEDIA_PATH, folder, filename)
    folder_path = os.path.join(settings.MEDIA_PATH, folder)
    os.makedirs(folder_path, exist_ok=True)
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    file_path = os.path.join(folder, filename)
    return absolute_media_url(file_path)
async def delete_file(file_url: str):
    print(file_url,'-------------')
    parsed_url = urlparse(file_url)
    file_path = parsed_url.path
    print(file_path,'==================')
    if not file_path or not file_path.startswith("/media/"):
        return False
    filename = file_path.replace("/media/", "", 1)
    full_path = os.path.join(settings.MEDIA_DIR, filename)
    # Delete the file if it exists
    if os.path.exists(full_path):
        os.remove(full_path)
        return True
    else:
        return False
    if file_url:
        return delete_from_space(file_url)
    return True

def to_pagination_response(
    query,
    schema,
    page: int,
    page_size: int,
):
    skip = (page - 1) * page_size
    total_count = query.count()
    items = query.offset(skip).limit(page_size).all()
    total_pages = math.ceil(total_count / page_size) if page_size else 0
    return {
        "has_prev":page > 1,
        "has_next":(page * page_size) < total_count,
        "total":total_count,
        "items":[dict(schema.from_orm(item)) for item in items],
        "total_pages":total_pages,
        "limit":page_size
    }


def send_reset_email(to_email: str, reset_link: str):
    from_email = settings.GMAIL_FROM_MAIL
    app_password = settings.GMAIL_APP_PASSWORD  # Use App Password (not your Gmail password)

    # Create the email
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Password Reset"
    msg["From"] = from_email
    msg["To"] = to_email

    html_content = f"""
    <h3>Password Reset</h3>
    <p>Click the button below to reset your password:</p>
    <a href="{reset_link}" style="
        padding: 10px 20px;
        background: #007bff;
        color: white;
        text-decoration: none;
        display: inline-block;
        border-radius: 4px;
    ">Reset Password</a>
    <p>If you did not request this, please ignore this email.</p>
    """

    msg.attach(MIMEText(html_content, "html"))

    # Send email using Gmail SMTP
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(from_email, app_password)
            server.sendmail(from_email, to_email, msg.as_string())
        print("Email sent successfully!")
    except Exception as e:
        print("Error sending email:", e)


def get_frontend_url():
    if settings.PRODUCTION == 'true':
        return settings.FRONTEND_URL
    return 'http://localhost:8080'