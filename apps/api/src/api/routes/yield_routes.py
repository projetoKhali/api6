from flask import Blueprint, jsonify, request
from api.middleware.auth import require_auth
from api.models.yield_model import (
    create_yield_event,
    get_yield_events_filter,
    update_yield_event,
)


def create_blueprint(db):

    assert db is not None

    yield_collection = db.get_collection('yield_collection')

    assert yield_collection is not None

    yield_blueprint = Blueprint('yield', __name__, url_prefix="/yield")

    @yield_blueprint.route('/', methods=['POST'])
    def create():
        data = request.json
        result = create_yield_event(yield_collection, data)
        return jsonify(result)

    @yield_blueprint.route('/', methods=['GET'])
    @require_auth
    def read():
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
