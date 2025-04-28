from typing import Dict, List, Tuple
from typing import Union, Optional
from api.models.yield_predict_model import YieldPredictModel


def get_filtered_yield_predict_data(
    crop_year: Optional[Union[int, List[int]]] = None,
    season: Optional[Union[str, List[str]]] = None,
    crop: Optional[Union[str, List[str]]] = None,
    state: Optional[Union[str, List[str]]] = None
) -> List[Dict]:
    """
    Obtém dados de previsão de yield filtrados do MongoDB com base nos filtros opcionais
    """
    # 1. Importa/cria a instância do modelo
    yield_predict_model = YieldPredictModel()

    # 2. Aplica os filtros e armazena o resultado
    filtered_data = yield_predict_model.get_filtered_data(
        crop_year=crop_year,
        season=season,
        crop=crop,
        state=state
    )

    # 3. Retorna os dados filtrados
    return filtered_data[:300]
