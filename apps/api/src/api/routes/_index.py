from . import yield_routes, dashboard_routes, yield_predict_router, terms_routes


def create_blueprints(db):
    return [
        yield_routes.create_blueprint(db),
        dashboard_routes.create_blueprint(db),
        yield_predict_router.create_blueprint(db),
        terms_routes.create_terms_blueprint(db),
    ]
