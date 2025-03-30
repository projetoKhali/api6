from flask import Flask, jsonify
from db.mongo import MongoDB


def create_app():
    db = MongoDB.connect()

    app = Flask(__name__)

    @app.route("/")
    def home():
        return jsonify({"message": "Hello from Flask!"})

    return app


def run():
    app = create_app()

    app.run(debug=True, host="0.0.0.0", port=5000)
