import dsnparse

from peewee import (
    MySQLDatabase,
    Model,
    CharField,
)

from .app import app


dsn = dsnparse.parse(app.config["DSN"])

db = MySQLDatabase(
    "app", user=dsn.user, password=dsn.password, host=dsn.host, port=dsn.port
)


class BaseModel(Model):
    class Meta:
        database = db


class User(BaseModel):
    name = CharField()


def create_tables():
    with db:
        db.create_tables([User])
