import os
from flask import Flask
from flask_cors import CORS
from flask.json import JSONEncoder
from datetime import date


app = Flask(__name__)

app.config["AWS_S3_ENDPOINT_URL"] = os.getenv("AWS_S3_ENDPOINT_URL", None)
app.config["AWS_S3_PUBLIC_URL"] = os.getenv("AWS_S3_PUBLIC_URL", None)
if not app.config["AWS_S3_PUBLIC_URL"]:
    raise RuntimeError("AWS_S3_PUBLIC_URL is not set")

app.config["GOOGLE_WEB_CLIENT_ID"] = os.getenv("GOOGLE_WEB_CLIENT_ID")
app.config["GOOGLE_CHROME_CLIENT_ID"] = os.getenv("GOOGLE_CHROME_CLIENT_ID")
if not app.config["GOOGLE_WEB_CLIENT_ID"] or not app.config["GOOGLE_CHROME_CLIENT_ID"]:
    raise RuntimeError("GOOGLE_WEB_CLIENT_ID or GOOGLE_CHROME_CLIENT_ID is not set")


DSN = os.getenv("DSN")
if not DSN:
    raise RuntimeError("DSN is not set")
app.config["DSN"] = DSN


app.config["ALLOWED_ORIGINS"] = os.getenv("ALLOWED_ORIGINS")
if app.debug:
    origins = "*"
else:
    allowed_origins = app.config["ALLOWED_ORIGINS"]
    if not allowed_origins:
        raise RuntimeError("ALLOWED_ORIGINS is required when debug == false")
    origins = allowed_origins.split(" ")

CORS(app, headers=["Authorization"], origins=origins)


class CustomJSONEncoder(JSONEncoder):
    def default(self, obj):
        try:
            if isinstance(obj, date):
                return obj.isoformat()
            iterable = iter(obj)
        except TypeError:
            pass
        else:
            return list(iterable)
        return JSONEncoder.default(self, obj)


app.json_encoder = CustomJSONEncoder
