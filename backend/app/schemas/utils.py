from core.config import settings
import os

def absolute_media_url(path):
  if path:
      relative_path = os.path.join(settings.MEDIA_PATH,path)
      file_url = f"{settings.BASE_URL}/{relative_path.replace(os.sep, '/')}"
      return file_url
  return None
