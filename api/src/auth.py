from functools import wraps
from flask import request, g
from google.oauth2 import id_token
from google.auth.transport import requests

from .exceptions import AuthError
from .domain import User
from .app import app

ALGORITHMS = ["RS256"]


def get_token_auth_header():
    """Obtains the access token from the Authorization Header
    """
    auth = request.headers.get("Authorization", None)
    if not auth:
        raise AuthError(
            {
                "code": "authorization_header_missing",
                "description": "Authorization header is expected",
            },
            401,
        )

    parts = auth.split()

    if parts[0].lower() != "bearer":
        raise AuthError(
            {
                "code": "invalid_header",
                "description": "Authorization header must start with" " Bearer",
            },
            401,
        )
    elif len(parts) == 1:
        raise AuthError(
            {"code": "invalid_header", "description": "Token not found"}, 401
        )
    elif len(parts) > 2:
        raise AuthError(
            {
                "code": "invalid_header",
                "description": "Authorization header must be" " Bearer token",
            },
            401,
        )

    token = parts[1]
    return token


def require_auth(f):
    """Determines if the access token is valid
    """

    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_auth_header()
        try:
            idinfo = id_token.verify_oauth2_token(token, requests.Request())
            if idinfo["aud"] not in [
                app.config["GOOGLE_WEB_CLIENT_ID"],
                app.config["GOOGLE_CHROME_CLIENT_ID"],
            ]:
                raise ValueError("Could not verify audience.")
            userid = idinfo["sub"]
            g.user = User(id=userid)
        except ValueError as e:
            print(e)
            raise AuthError(error="Invalid token", status_code=401)

        return f(*args, **kwargs)

    return decorated
