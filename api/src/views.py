import typing
from flask import request, abort, g

from .app import app
from .auth import require_auth
from .utils import make_response
from . import models, exceptions


class Entity:
    def __init__(self, data: typing.List[typing.Dict]):
        self._raw = {"by_id": {}, "all_ids": []}
        for dic in data:
            id = str(dic["id"])
            self._raw["by_id"][id] = dic
            self._raw["all_ids"].append(id)

    def to_dict(self):
        return self._raw


@app.errorhandler(exceptions.AuthError)
def handle_unauthorized_request(e):
    return {}, 401


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
@require_auth
def components_post():
    file = request.files.get("file")
    name = request.form.get("name")
    domain = request.form.get("domain")
    width = request.form.get("originalWidth")
    height = request.form.get("originalHeight")

    site, created = models.Website.get_or_create(domain=domain, name="")
    comp = models.Component.create(
        user_id=g.user.id, name=name, width=width, height=height, website=site
    )
    comp_file = models.ComponentFile.create(key=comp.id, component=comp)
    comp_file.store_file(file)

    return {}, 200


@app.route("/components", methods=["GET"])
@require_auth
def components_get():
    limit = int(request.args.get("limit") or 10)
    offset = int(request.args.get("offset") or 0)
    tag = request.args.get("tag")
    site = request.args.get("website")

    components = (
        models.Component.select()
        .where((models.Component.user_id == g.user.id))
        .order_by(models.Component.created_at.desc())
    )

    if tag is not None:
        components = components.join(models.ComponentTag).where(
            models.ComponentTag.tag == tag
        )
    if site is not None:
        components = components.join(models.Website).where(models.Website.id == site)

    total = components.count()
    has_more = total >= offset + limit + 1

    components = components.limit(limit).offset(offset)

    files = [comp.file.first() for comp in components]

    return make_response(
        data={
            "components": Entity([comp.to_dict() for comp in components]).to_dict(),
            "component_files": Entity([f.to_dict() for f in files]).to_dict(),
        },
        has_more=has_more,
        status=200,
    )


@app.route("/components/<id>", methods=["DELETE"])
@require_auth
def components_delete(id: str):
    component = models.Component.get_or_none(models.Component.id == id)
    if component.user_id != g.user.id:
        abort(403)
    models.ComponentTag.delete().where(models.ComponentTag.component == id).execute()
    component.file.first().delete_file()
    component.delete_by_id(id)
    return {}, 200


@app.route("/tags", methods=["POST"])
@require_auth
def tags_post():
    req = request.get_json()
    tag = models.Tag.create(name=req.get("name"), user_id=g.user.id)
    return make_response({"tag": tag.to_dict()})


@app.route("/tags", methods=["GET"])
@require_auth
def tags_get():
    tags = models.Tag.select().where(
        (models.Tag.is_common == True) | (models.Tag.user_id == g.user.id)
    )
    return make_response({"tags": Entity([t.to_dict() for t in tags]).to_dict()})


@app.route("/tags/<id>", methods=["DELETE"])
@require_auth
def tags_delete(id: str):
    tag = models.Tag.get_or_none(models.Tag.id == id)
    if tag.user_id != g.user.id:
        abort(403)
    models.ComponentTag.delete().where(models.ComponentTag.tag == id).execute()
    models.Tag.delete_by_id(id)
    return {}, 200


@app.route("/websites", methods=["GET"])
@require_auth
def websites_get():
    sites = (
        models.Website.select(models.Website)
        .join(models.Component)
        .where(models.Component.user_id == g.user.id)
        .group_by(models.Website.id)
        .order_by(models.Website.domain)
    )

    return make_response({"websites": Entity([w.to_dict() for w in sites]).to_dict()})


# tag_ids are comma separated ids.
@app.route("/components/<component_id>/tags/<tag_ids>", methods=["POST"])
@require_auth
def component_tags_post(component_id: str, tag_ids: str):
    comp = models.Component.get_or_none(models.Component.id == component_id)

    if comp is None:
        abort(400)
    if tag_ids is None:
        comp.tags.clear()
        return {}, 200

    tags = models.Tag.select().where(models.Tag.id.in_(tag_ids.split(",")))
    comp.tags.clear()
    comp.tags.add(list(tags))

    return {}, 200


@app.route("/components/<component_id>/tags/", methods=["POST"])
@require_auth
def component_tags_empty_post(component_id: str):
    return component_tags_post(component_id, None)
