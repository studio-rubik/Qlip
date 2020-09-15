from boto3.exceptions import Boto3Error
from botocore.client import ClientError

from .app import app
from .deps import s3


def store_file(file, key: str, bucket_name: str):
    try:
        s3.meta.client.head_bucket(Bucket=bucket_name)
    except ClientError:
        bucket = s3.create_bucket(Bucket=bucket_name)
    else:
        bucket = s3.Bucket(bucket_name)

    try:
        bucket.upload_fileobj(file, key)
    except Boto3Error:
        raise


def build_public_link(key: str, bucket_name: str):
    return f"{app.config['AWS_S3_PUBLIC_URL']}/{bucket_name}/{key}"
