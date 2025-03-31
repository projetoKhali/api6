from . import yield_routes, dashboard_routes


def create_blueprints(db):
    return [
        yield_routes.create_blueprint(db),
        dashboard_routes.create_blueprint(db),
    ]
