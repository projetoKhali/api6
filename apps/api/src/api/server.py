from flask import Flask, jsonify
from flask_cors import CORS
from api.routes import create_blueprints
from db.mongo import MongoDB
from dev import print_routes


def create_app():
    db = MongoDB.connect()

    MongoDB.test()

    app = Flask(__name__)
    CORS(app)

    @app.route("/")
    def home():
        return jsonify({"message": "Hello from Flask!"})

    for blueprint in create_blueprints(db):
        app.register_blueprint(blueprint)

    return app


def run():
    app = create_app()

    print_routes(app)

    app.run(debug=True, host="0.0.0.0", port=5000)
