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
    def read_all():
        filters = request.args.to_dict()
        result = get_yield_events_filter(yield_collection, filters)
        return jsonify(result)

    @yield_blueprint.route('/', methods=['PUT'])
    def update():
        data = request.json
        crop = data.get('crop')
        crop_year = data.get('crop_year')
        update_data = data.get('update_data')
        result = update_yield_event(
            yield_collection, crop, crop_year, update_data)
        return jsonify(result)

    return yield_blueprint
