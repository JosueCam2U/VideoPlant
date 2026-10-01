import boto3
import uuid
from botocore.config import Config

from app.config import settings


s3_client = boto3.client(
    "s3",
    region_name=settings.AWS_REGION,
    config=Config(signature_version="s3v4"),
)


def generate_presigned_upload(
    bucket: str,
    key_prefix: str,
    content_type: str,
    expires_in: int = 600,
) -> dict:
    """
    Devuelve {upload_url, file_url, key} para subir directo a S3.
    """
    ext = content_type.split("/")[-1].replace("jpeg", "jpg")
    key = f"{key_prefix}/{uuid.uuid4().hex}.{ext}"

    upload_url = s3_client.generate_presigned_url(
        ClientMethod="put_object",
        Params={
            "Bucket": bucket,
            "Key": key,
            "ContentType": content_type,
        },
        ExpiresIn=expires_in,
    )

    file_url = f"https://{bucket}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"
    return {"upload_url": upload_url, "file_url": file_url, "key": key}