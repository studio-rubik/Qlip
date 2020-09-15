from flask import request, abort, g
from boto3.exceptions import Boto3Error
from botocore.client import ClientError

from .app import app
from .auth import require_auth
from . import models


@app.before_request
def before_request():
    models.db.connect()


@app.after_request
def after_request(response):
    models.db.close()
    return response


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
    for _, file in request.files.items():
        file_key = file.filename
        file_model = models.SomeFile.create(key=file_key, name=file_key)
        file_model.store_file(file)


@app.route("/components", methods=["POST"])
def components_post():
    user_id = request.headers.get("DomClipper-User-ID")
    file = request.files.get("file")
    site, created = models.Website.get_or_create(
        domain=request.form.get("domain"), name=""
    )
    comp = models.Component.create(
        user_id=user_id, name=request.form.get("name"), website=site
    )
    comp_file = models.ComponentFile.create(key=comp.id, component=comp)
    comp_file.store_file(file)

    return {}, 200
