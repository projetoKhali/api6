from flask import Blueprint, jsonify, request
from api.service.yield_predict_service import get_filtered_yield_predict_data


def create_blueprint(db):
    print("Criando blueprint para 'yield_predict_dashboard'")  # Teste simples
    yield_predict_blueprint = Blueprint(
        'yield_predict_dashboard', __name__, url_prefix="/api"
    )
    
    @yield_predict_blueprint.route("/get_yield_predict_data", methods=["POST", "OPTIONS"])
    def get_yield_predict_data():
        if request.method == "OPTIONS":
            return _build_cors_preflight_response()

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

            # Criando a resposta com os dados filtrados
            response = jsonify(filtered_data)
            return _corsify_actual_response(response), 200

        except Exception as e:
            print(f"Erro ao consultar os dados: {str(e)}")
            return jsonify({"error": "Erro ao consultar dados"}), 500

    @yield_predict_blueprint.route("/get_filters", methods=["GET", "OPTIONS"])
    def get_filters():
        # Aqui você pode implementar a lógica para retornar os filtros disponíveis
        # Exemplo: return jsonify({"crop_years": [2021, 2022], "seasons": ["Spring", "Summer"], ...})
        return jsonify({
            "crop_years": [2021, 2022, 2023],
            "seasons": ["Spring", "Summer", "Autumn", "Winter"],
            "crops": ["Corn", "Soybean", "Wheat"],
            "states": ["California", "Texas", "Iowa"]
        })

    def _build_cors_preflight_response():
        response = jsonify()
        response.status_code = 204
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "*")
        response.headers.add(
            "Access-Control-Allow-Methods", "POST, OPTIONS, GET")
        return response

    def _corsify_actual_response(response):
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response

    return yield_predict_blueprint
