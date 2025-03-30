from typing import Union, List, Optional, Dict, Any
from bson import ObjectId
from pymongo.errors import PyMongoError
from db.mongo import MongoDB

class DashboardModel:
    def __init__(self, db_name: str = "reforestation"):
        """
        Inicializa o modelo com a conexão existente
        """
        try:
            # Conexão mantida conforme sua implementação original
            self.db = MongoDB.connect()  # Usa o método connect() diretamente
            self.collection = self.db["yield_collection"]
            
            # Verificação segura da coleção
            if not hasattr(self.collection, 'name') or self.collection.name != "yield_collection":
                raise ValueError("Coleção yield_collection não está acessível")
                
        except Exception as e:
            raise RuntimeError(f"Falha ao inicializar DashboardModel: {str(e)}")

    def get_filtered_data(
        self,
        crop_year: Optional[Union[int, List[int]]] = None,
        season: Optional[Union[str, List[str]]] = None,
        crop: Optional[Union[str, List[str]]] = None,
        state: Optional[Union[str, List[str]]] = None
    ) -> List[Dict[str, Any]]:
        """
        Filtra dados com tratamento robusto de erros
        """
        try:
            query = self._build_query(crop_year, season, crop, state)
            cursor = self.collection.find(query)
            return self._convert_documents(cursor)
        except PyMongoError as e:
            print(f"Erro ao consultar MongoDB: {str(e)}")
            return []
        except Exception as e:
            print(f"Erro inesperado: {str(e)}")
            return []

    def _build_query(
        self,
        crop_year: Optional[Union[int, List[int]]],
        season: Optional[Union[str, List[str]]],
        crop: Optional[Union[str, List[str]]],
        state: Optional[Union[str, List[str]]]
    ) -> Dict[str, Any]:
        """Constroi a query de forma segura"""
        query = {}
        filters = {
            'crop_year': crop_year,
            'season': season,
            'crop': crop,
            'state': state
        }

        for field, value in filters.items():
            if value is not None:
                if isinstance(value, list):
                    valid_values = [v for v in value if v is not None]
                    if valid_values:
                        query[field] = {"$in": valid_values}
                else:
                    query[field] = value
        return query

    def _convert_documents(self, cursor) -> List[Dict[str, Any]]:
        """Converte documentos MongoDB para dicionários Python"""
        try:
            return [{**doc, "_id": str(doc["_id"])} for doc in cursor]
        except Exception as e:
            print(f"Erro ao converter documentos: {str(e)}")
            return []

    def get_filter_possible_values(self, field: str) -> List[str]:
        """
        Obtém valores distintos para um campo com tratamento de erros
        """
        try:
            values = self.collection.distinct(field)
            return [str(v) for v in values if v is not None]
        except PyMongoError as e:
            print(f"Erro ao obter valores distintos para {field}: {str(e)}")
            return []
        except Exception as e:
            print(f"Erro inesperado: {str(e)}")
            return []

    def get_all_unique_values(self) -> Dict[str, List[str]]:
        """
        Obtém todos os valores únicos para os campos principais
        """
        fields_mapping = {
            "crop_years": "crop_year",
            "seasons": "season",
            "crops": "crop",
            "states": "state"
        }
        
        results = {}
        for result_key, field in fields_mapping.items():
            values = self.get_filter_possible_values(field)
            results[result_key] = sorted(values) if values else []
                
        return results