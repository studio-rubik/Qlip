from flask import request, abort
from boto3.exceptions import Boto3Error
from botocore.client import ClientError

from .app import app
from .auth import require_auth
from .deps import s3
from . import models


@app.route("/", methods=["GET"])
@require_auth
def test_auth():
    return {}, 200


@app.route("/users", methods=["POST"])
def users():
    req = request.get_json()
    user = models.User.create(name=req.get("name"))
    return {"id": user.id, "name": user.name}, 200


@app.route("/files", methods=["POST"])
def files():
    bucket_name = "files"
    try:
        s3.meta.client.head_bucket(Bucket=bucket_name)
    except ClientError:
        bucket = s3.create_bucket(Bucket=bucket_name)
    else:
        bucket = s3.Bucket(bucket_name)

    for name, file in request.files.items():
        try:
            bucket.upload_fileobj(file, file.filename)
        except Boto3Error:
            abort(500)

    return {}, 200
