from bson import ObjectId
from typing import Union, List, Optional
from apps.db.mongo_db import MongoDB

class DashboardModel:
    def __init__(self, db_name: str = "reforestation"):
        self.db = MongoDB.get_database(db_name)
        self.collection = self.db["yield_collection"]

    def get_filtered_data(
        self,
        crop_year: Optional[Union[int, List[int]]] = None,
        season: Optional[Union[str, List[str]]] = None,
        crop: Optional[Union[str, List[str]]] = None,
        state: Optional[Union[str, List[str]]] = None
    ) -> List[dict]:
        """
        Filtra dados com base nos parâmetros fornecidos (aceita valores únicos ou listas)
        
        Args:
            crop_year: Ano ou lista de anos
            season: Estação ou lista de estações
            crop: Cultura ou lista de culturas
            state: Estado ou lista de estados
            
        Returns:
            Lista de documentos correspondentes aos filtros
        """
        query = {}

        # Construção dinâmica da query com tratamento para listas
        filters = {
            'crop_year': crop_year,
            'season': season,
            'crop': crop,
            'state': state
        }

        for field, value in filters.items():
            if value is not None:
                if isinstance(value, list):
                    # Remove valores None/nulos da lista
                    clean_list = [v for v in value if v is not None]
                    if clean_list:  # Só adiciona se a lista não estiver vazia
                        query[field] = {"$in": clean_list}
                else:
                    query[field] = value

        # Executa a consulta
        cursor = self.collection.find(query)
        data = list(cursor)
        
        # Converte ObjectId para string
        for item in data:
            item["_id"] = str(item["_id"])
            
        return data