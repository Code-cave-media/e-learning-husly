from fastapi import UploadFile
from core.config import settings
import random
import boto3
from botocore.client import Config
from urllib.parse import urlparse

DO_SPACE_KEY = settings.DO_SPACE_KEY
DO_SPACE_SECRET = settings.DO_SPACE_SECRET
DO_SPACE_REGION = settings.DO_SPACE_REGION
DO_SPACE_ENDPOINT = settings.DO_SPACE_ENDPOINT
DO_SPACE_BUCKET = settings.DO_SPACE_BUCKET

client = boto3.client(
    's3',
    region_name=DO_SPACE_REGION,
    endpoint_url=DO_SPACE_ENDPOINT,
    aws_access_key_id=DO_SPACE_KEY,
    aws_secret_access_key=DO_SPACE_SECRET,
    config=Config(signature_version='s3v4')
)

video_urls = [
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
]

image_urls = [
    "https://cdn.fliki.ai/image/page/660ba680adaa44a37532fd97/6663112070e1cfda27f86585.jpg",
    "https://cdn.textstudio.com/output/studio/template/preview/stamped/7/q/n/e/al6cz1enq7.webp",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgDet3RwNu6bpvIL6KIM-nSA-Xj2j_9QpDwmw0XMba3bRUswwpT_1K8J5P3OebHczP8vQ&usqp=CAU",
    "https://img.freepik.com/premium-psd/youtube-thumbnail-templates_551555-1177.jpg"
]

def get_random_mock_url(file_name: str) -> str:
    print(f"Mock URL requested for file: {file_name}")
    if file_name.lower().endswith(('.mp4', '.mov', '.avi', '.mkv')):
        return random.choice(video_urls)
    elif file_name.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp')):
        return random.choice(image_urls)
    else:
        return random.choice(image_urls + video_urls)

def upload_to_space(folder_name: str, file_name: str, file) -> str:
    if not settings.PRODUCTION:
        return get_random_mock_url(file_name)
    
    object_key = f"{folder_name}/{file_name}"
    client.upload_fileobj(
        Fileobj=file,
        Bucket=DO_SPACE_BUCKET,
        Key=object_key,
        ExtraArgs={'ACL': 'public-read'}
    )
    file_url = f"https://{DO_SPACE_BUCKET}.{DO_SPACE_REGION}.digitaloceanspaces.com/{object_key}"
    return file_url

def delete_from_space(file_url: str):
    parsed_url = urlparse(file_url)
    object_key = parsed_url.path.lstrip('/')
    client.delete_object(Bucket=DO_SPACE_BUCKET, Key=object_key)
    return True
