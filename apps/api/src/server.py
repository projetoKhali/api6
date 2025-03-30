from flask import Flask, jsonify
from api.routes import yield_routes
from db.mongo import MongoDB
from dev import print_routes
from api.routes.dashboard_route import create_blueprint as dashboard_blueprint


def create_app():
    db = MongoDB.connect()

    app = Flask(__name__)

    @app.route("/")
    def home():
        return jsonify({"message": "Hello from Flask!"})

    blueprints = [
        yield_routes.create_blueprint(db),  # Mantém o existente
        dashboard_blueprint(db)             # Adiciona o novo
    ]

    for blueprint in blueprints:
        app.register_blueprint(blueprint)

    return app


def run():
    app = create_app()

    print_routes(app)

    app.run(debug=True, host="0.0.0.0", port=5000)
