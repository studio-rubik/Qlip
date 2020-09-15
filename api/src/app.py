import os
from flask import Flask
from flask_cors import CORS
from flask.json import JSONEncoder
from datetime import date


app = Flask(__name__)
CORS(app, headers=["Authorization"])

app.config["AWS_S3_ENDPOINT_URL"] = os.getenv("AWS_S3_ENDPOINT_URL", None)
app.config["AWS_S3_PUBLIC_URL"] = os.getenv("AWS_S3_PUBLIC_URL", None)
if not app.config["AWS_S3_PUBLIC_URL"]:
    raise RuntimeError("AWS_S3_PUBLIC_URL is not set")

app.config["AUTH0_DOMAIN"] = os.getenv("AUTH0_DOMAIN")
app.config["AUTH0_CLIENT_ID"] = os.getenv("AUTH0_CLIENT_ID")
app.config["AUTH0_CLIENT_SECRET"] = os.getenv("AUTH0_CLIENT_SECRET")
app.config["AUTH0_API_AUDIENCE"] = os.getenv("AUTH0_API_AUDIENCE")
if (
    not app.config["AUTH0_DOMAIN"]
    or not app.config["AUTH0_CLIENT_ID"]
    or not app.config["AUTH0_CLIENT_SECRET"]
    or not app.config["AUTH0_API_AUDIENCE"]
):
    raise RuntimeError("Some environment variable for Auth0 is not set")


DSN = os.getenv("DSN")
if not DSN:
    raise RuntimeError("DSN is not set")
app.config["DSN"] = DSN


app.config["FRONTEND_URL"] = os.getenv("FRONTEND_URL")
if not app.config["FRONTEND_URL"]:
    raise RuntimeError("FRONTEND_URL is no set")


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
