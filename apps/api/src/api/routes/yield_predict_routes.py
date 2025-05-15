from flask import Blueprint, jsonify, request
from api.middleware.auth import require_auth
from api.service.yield_predict_service import get_filtered_yield_predict_data


def create_blueprint(db):
    yield_predict_blueprint = Blueprint(
        'projection', __name__, url_prefix="/projection"
    )

    @yield_predict_blueprint.route('/', methods=['OPTIONS'])
    def options():
        return '', 200

    @yield_predict_blueprint.route("/", methods=["POST"])
    @require_auth
    def get_yield_predict_data():
        if not request.is_json:
            return jsonify({"error": "O corpo da requisição deve ser JSON"}), 400

        try:
            # Recebendo os filtros via POST
            filters = request.get_json()

            # Extrai filtros com fallback para None
            crop_year = filters.get("crop_year")
            season = filters.get("season")
            crop = filters.get("crop")
            state = filters.get("state")

            # Validação básica de tipos
            if crop_year and not isinstance(crop_year, (int, list)):
                return jsonify({"error": "crop_year deve ser inteiro ou lista"}), 400
            if season and not isinstance(season, (str, list)):
                return jsonify({"error": "season deve ser string ou lista"}), 400
            if crop and not isinstance(crop, (str, list)):
                return jsonify({"error": "crop deve ser string ou lista"}), 400
            if state and not isinstance(state, (str, list)):
                return jsonify({"error": "state deve ser string ou lista"}), 400

            # Obtendo os dados filtrados
            filtered_data = get_filtered_yield_predict_data(
                crop_year=crop_year,
                season=season,
                crop=crop,
                state=state
            )

            return jsonify(filtered_data), 200

        except Exception as e:
            print(f"Erro ao consultar os dados: {str(e)}")
            return jsonify({"error": "Erro ao consultar dados"}), 500

    @yield_predict_blueprint.route("/filters", methods=["GET"])
    @require_auth
    def get_filters():
        return jsonify({
            "crop_years": [2021, 2022, 2023],
            "seasons": ["Spring", "Summer", "Autumn", "Winter"],
            "crops": ["Corn", "Soybean", "Wheat"],
            "states": ["California", "Texas", "Iowa"]
        })

    return yield_predict_blueprint
