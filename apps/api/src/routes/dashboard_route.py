from flask import Blueprint, jsonify, request
from apps.api.src.models.dashboard_model import DashboardModel

# Cria um Blueprint para as rotas
yield_bp = Blueprint('yield_routes', __name__)

@yield_bp.route('/get_yield_data', methods=['POST'])
def get_yield_data():
    if not request.is_json:
        return jsonify({"error": "O corpo da requisição deve ser JSON"}), 400
    
    try:
        filters = request.get_json()
        model = DashboardModel()
        
        # Extrai filtros com fallback para None
        crop_year = filters.get("crop_year")
        season = filters.get("season")
        crop = filters.get("crop")
        state = filters.get("state")
        
        # Validação básica de tipos
        if crop_year and not isinstance(crop_year, (int, list)):
            return jsonify({"error": "crop_year deve ser inteiro ou lista"}), 400
        
        data = model.get_filtered_data(
            crop_year=crop_year,
            season=season,
            crop=crop,
            state=state
        )
        
        return jsonify({
            "data": data
        }), 200
        
    except Exception as e:
        return jsonify({
            "error": "Erro ao processar requisição",
            "details": str(e)
        }), 500