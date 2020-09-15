import boto3
import sib_api_v3_sdk

from .app import app
from .models import db

s3 = boto3.resource("s3", endpoint_url=app.config["AWS_S3_ENDPOINT_URL"])
configuration = sib_api_v3_sdk.Configuration()
smtp = sib_api_v3_sdk.SMTPApi(sib_api_v3_sdk.ApiClient(configuration))


@app.before_request
def before_request():
    db.connect()


@app.after_request
def after_request(response):
    db.close()
    return response
