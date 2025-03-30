from flask import Blueprint, jsonify, request
from api.service.dashboard_service import (
    get_filtered_yield_data,
    get_filter,
)


def create_blueprint(db):
    dashboard_blueprint = Blueprint(
        'yield_dashboard', __name__, url_prefix="/api")

    @dashboard_blueprint.route("/get_yield_data", methods=["POST", "OPTIONS"])
    def get_yield_data():
        if request.method == "OPTIONS":
            return _build_cors_preflight_response()

        if not request.is_json:
            return jsonify({"error": "O corpo da requisição deve ser JSON"}), 400

        try:
            filters = request.get_json()

            # Extrai filtros com fallback para None
            crop_year = filters.get("crop_year")
            season = filters.get("season")
            crop = filters.get("crop")
            state = filters.get("state")

            # Validação básica de tipos
            if crop_year and not isinstance(crop_year, (int, list)):
                return jsonify({"error": "crop_year deve ser inteiro ou lista"}), 400

            # Chama o service
            data, total_production, season_totals, states_totals, yearly_crop_stats, metrics, crops_totals = get_filtered_yield_data(
                crop_year=crop_year,
                season=season,
                crop=crop,
                state=state
            )

            response = jsonify({
                "data": data,
                "calculations": {
                    "total_production": total_production,
                    "item_count": len(data)
                },
                "season_totals": season_totals,
                "states_totals": states_totals,
                "yearly_crop_stats": yearly_crop_stats,
                "metrics": metrics,
                "crops_totals": crops_totals
            })

            return _corsify_actual_response(response), 200

        except ValueError as e:
            return jsonify({
                "error": "Dados inválidos",
                "details": str(e)
            }), 400
        except Exception as e:
            return jsonify({
                "error": "Erro ao processar requisição",
                "details": str(e)
            }), 500

    @dashboard_blueprint.route("/get_filters", methods=["GET", "OPTIONS"])
    def get_filters():
        crop_years, seasons, crops, states = get_filter()
        return jsonify({
            "crop_years": crop_years,
            "seasons": seasons,
            "crops": crops,
            "states": states
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

    return dashboard_blueprint
