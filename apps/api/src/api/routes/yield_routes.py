from flask import Blueprint, jsonify, request
from api.middleware.auth import require_auth
from api.models.yield_model import (
    create_yield_event,
    get_yield_events_filter,
    update_yield_event,
)
from .pagination import Pagination


def create_blueprint(db):

    assert db is not None

    yield_collection = db.get_collection('yield_collection')

    assert yield_collection is not None

    yield_blueprint = Blueprint('yield', __name__, url_prefix="/yield")

    @yield_blueprint.route('/', methods=['OPTIONS'])
    def options():
        return '', 200

    @yield_blueprint.route('/new', methods=['POST'])
    @require_auth
    def create():
        data = request.json
        result = create_yield_event(yield_collection, data)
        return jsonify(result)

    @yield_blueprint.route('/', methods=['POST'])
    @require_auth
    def read():
        page, size, error_response, status_code = Pagination.parse()
        if error_response:
            return error_response, status_code

        items = list(yield_collection.find().skip(
            (page - 1) * size).limit(size))

        for item in items:
            item['_id'] = str(item['_id'])  # Convert ObjectId to string

        return jsonify({
            'items': items,
            **Pagination.get_metadata(yield_collection, size)
        })

    @yield_blueprint.route('/all', methods=['GET'])
    @require_auth
    def read_all():
        filters = request.args.to_dict()
        result = get_yield_events_filter(yield_collection, filters)
        return jsonify(result)

    @yield_blueprint.route('/', methods=['PUT'])
    @require_auth
    def update():
        data = request.json
        crop = data.get('crop')
        crop_year = data.get('crop_year')
        update_data = data.get('update_data')
        result = update_yield_event(
            yield_collection, crop, crop_year, update_data)
        return jsonify(result)
    
    @yield_blueprint.route('/filter', methods=['POST'])
    @require_auth
    def read_filtered():
        # Paginação
        page, size, error_response, status_code = Pagination.parse()
        if error_response:
            return error_response, status_code

        # Recebe os filtros enviados no corpo da requisição
        filters = request.get_json() or {}

        crop_year = filters.get("crop_year")
        season = filters.get("season")
        crop = filters.get("crop")
        state = filters.get("state")

        # Validação básica
        if crop_year and not isinstance(crop_year, (int, list)):
            return jsonify({"error": "crop_year deve ser inteiro ou lista"}), 400
        if season and not isinstance(season, (str, list)):
            return jsonify({"error": "season deve ser string ou lista"}), 400
        if crop and not isinstance(crop, (str, list)):
            return jsonify({"error": "crop deve ser string ou lista"}), 400
        if state and not isinstance(state, (str, list)):
            return jsonify({"error": "state deve ser string ou lista"}), 400

        # Construindo o dicionário de filtros para o MongoDB
        mongo_filter = {}

        if crop_year:
            mongo_filter['crop_year'] = {'$in': crop_year if isinstance(crop_year, list) else [crop_year]}
        if season:
            mongo_filter['season'] = {'$in': season if isinstance(season, list) else [season]}
        if crop:
            mongo_filter['crop'] = {'$in': crop if isinstance(crop, list) else [crop]}
        if state:
            mongo_filter['state'] = {'$in': state if isinstance(state, list) else [state]}

        # Consulta paginada com filtros
        items = list(
            yield_collection.find(mongo_filter)
            .skip((page - 1) * size)
            .limit(size)
        )

        # Converte ObjectId para string
        for item in items:
            item['_id'] = str(item['_id'])

        return jsonify({
            'items': items,
            **Pagination.get_metadata(yield_collection, size, mongo_filter)
        })

    return yield_blueprint
