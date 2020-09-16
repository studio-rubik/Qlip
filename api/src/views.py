import typing
import itertools
from flask import request, abort, g
from boto3.exceptions import Boto3Error
from botocore.client import ClientError

from .app import app
from .auth import require_auth
from .utils import make_response
from . import models


class Entity:
    def __init__(self, data: typing.List[typing.Dict]):
        self._raw = {"by_id": {}, "all_ids": []}
        for dic in data:
            id = str(dic["id"])
            self._raw["by_id"][id] = dic
            self._raw["all_ids"].append(id)

    def to_dict(self):
        return self._raw


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


@app.route("/components", methods=["GET"])
def components_get():
    user_id = request.headers.get("DomClipper-User-ID")
    tag = request.args.get("tag")

    components = (
        models.Component.select()
        .where((models.Component.user_id == user_id))
        .order_by(models.Component.created_at.desc())
    )
    if tag is not None:
        components = [c for c in components if tag in c.tag_ids]
    files = [comp.file.first() for comp in components]
    sites = [comp.website for comp in components]

    return make_response(
        data={
            "components": Entity([comp.to_dict() for comp in components]).to_dict(),
            "component_files": Entity([f.to_dict() for f in files]).to_dict(),
            "websites": Entity([s.to_dict() for s in sites]).to_dict(),
        },
        status=200,
    )


@app.route("/tags", methods=["POST"])
def tags_post():
    req = request.get_json()
    models.Tag.create(name=req.get("name"))
    return {}, 200


@app.route("/tags", methods=["GET"])
def tags_get():
    user_id = request.headers.get("DomClipper-User-ID")
    tags = models.Tag.select().where(
        (models.Tag.is_common == True) | (models.Tag.user_id == user_id)
    )
    return make_response({"tags": Entity([t.to_dict() for t in tags]).to_dict()})


# tag_ids are comma separated ids.
@app.route("/components/<component_id>/tags/<tag_ids>", methods=["POST"])
def component_tags_post(component_id: str, tag_ids: str):
    comp = models.Component.get_or_none(models.Component.id == component_id)
    tags = models.Tag.select().where(models.Tag.id.in_(tag_ids.split(",")))
    if comp is None:
        abort(400)
    comp.tags.clear()
    comp.tags.add(list(tags))

    return {}, 200
