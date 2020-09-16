import datetime
import uuid
import dsnparse

from peewee import (
    MySQLDatabase,
    Model,
    CharField,
    UUIDField,
    DateTimeField,
    BooleanField,
    ForeignKeyField,
    ManyToManyField,
)
from playhouse.shortcuts import model_to_dict

from .app import app

CASCADE = "CASCADE"
ISOFORMAT = "%Y-%m-%dT%H:%M:%S.%f"
dsn = dsnparse.parse(app.config["DSN"])
db = MySQLDatabase(
    "app", user=dsn.user, password=dsn.password, host=dsn.host, port=dsn.port
)


class BaseModel(Model):
    class Meta:
        database = db

    id = UUIDField(primary_key=True, default=uuid.uuid4)
    created_at = DateTimeField(formats=[ISOFORMAT], default=datetime.datetime.utcnow)
    updated_at = DateTimeField(formats=[ISOFORMAT], default=datetime.datetime.utcnow)

    def to_dict(self):
        return model_to_dict(self, recurse=False)


class File(BaseModel):
    key = CharField()

    bucket = "files"

    def to_dict(self):
        return model_to_dict(self, recurse=False, extra_attrs=["url"])

    @property
    def url(self):
        from . import storage

        return storage.build_public_link(str(self.key), self.bucket)

    def store_file(self, file):
        from . import storage

        storage.store_file(file, str(self.key), self.bucket)


class User(BaseModel):
    name = CharField()


class Tag(BaseModel):
    name = CharField()
    is_common = BooleanField(default=False)
    user_id = CharField()


class Website(BaseModel):
    name = CharField()
    domain = CharField(unique=True)


class Component(BaseModel):
    name = CharField()
    website = ForeignKeyField(Website)
    user_id = CharField()
    tags = ManyToManyField(Tag, backref="components")

    def to_dict(self):
        return model_to_dict(self, recurse=False, extra_attrs=["tags"])


ComponentTag = Component.tags.get_through_model()


class ComponentFile(File):
    bucket = "components"

    component = ForeignKeyField(Component, backref="file", on_delete=CASCADE)


def create_tables():
    with db:
        db.create_tables([User, Tag, Website, Component, ComponentTag, ComponentFile])


def populate_common_tags():
    with db:
        Tag.create(name="Button", is_common=True, user_id="")
        Tag.create(name="Header", is_common=True, user_id="")
