from math import ceil
from flask import request, jsonify


class Pagination:
    """Utility class for handling pagination."""
    def __new__(cls, *args, **kwargs):
        raise TypeError(f"{cls.__name__} cannot be instantiated")

    @staticmethod
    def parse():
        """Extract and validate pagination parameters from request JSON."""
        data = request.get_json()

        page = data.get('page', 1)
        size = data.get('size', 50)

        try:
            page = int(page)
            size = int(size)
            if page < 1 or size < 1:
                raise ValueError
        except ValueError:
            return None, None, jsonify({
                'error': 'Page and size must be positive integers',
            }), 400

        return page, size, None, None

    @staticmethod
    def get_metadata(collection, size, query_filter=None):
        """Return pagination metadata for a collection, with optional filtering."""
        if query_filter is None:
            query_filter = {}

        total = collection.count_documents(query_filter)

        pages = ceil(total / size)
        return {
            'total': total,
            'totalPages': pages,
            'size': size,
        }
