from src import models

models.User.delete().execute()
models.ComponentFile.delete().execute()
models.ComponentTag.delete().execute()
models.Component.delete().execute()
models.Website.delete().execute()
models.Tag.delete().execute()
