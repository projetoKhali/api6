import os
import requests
from functools import wraps
from flask import request, jsonify

AUTH_INTROSPECT_URL = "http://localhost:3000/validate"


def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if os.getenv("API_BYPASS_AUTH") == "true":
            return f(*args, **kwargs)

        token = request.headers.get("Authorization", None)
        if not token:
            return jsonify({"error": "Missing token"}), 403
        # Remove "Bearer " prefix if present
        if token.startswith("Bearer "):
            token = token[7:]
        # Call the auth app introspection endpoint
        try:
            response = requests.post(
                AUTH_INTROSPECT_URL, json={"token": token})
            if response.status_code != 200:
                return jsonify({"error": "Token introspection failed"}), 403

        except Exception as e:
            return jsonify({"error": str(e)}), 403
        return f(*args, **kwargs)
    return decorated
