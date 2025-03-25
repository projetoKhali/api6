from typing import List, Dict, Tuple, Union, Optional
from apps.api.src.models.dashboard_model import DashboardModel  # ajuste o import conforme sua estrutura

def get_filtered_yield_data(
    crop_year: Optional[Union[int, List[int]]] = None,
    season: Optional[Union[str, List[str]]] = None,
    crop: Optional[Union[str, List[str]]] = None,
    state: Optional[Union[str, List[str]]] = None
) -> Tuple[List[Dict], float]: 
    """
    Obtém dados de yield filtrados do MongoDB e retorna processados
    
    Args:
        crop_year: Ano ou lista de anos para filtrar
        season: Estação ou lista de estações
        crop: Cultura ou lista de culturas
        state: Estado ou lista de estados
    
    Returns:
        Lista de dicionários com os dados processados
    """
    # 1. Importa/cria a instância do modelo
    yield_model = DashboardModel()
    
    # 2. Aplica os filtros e armazena o resultado
    filtered_data = yield_model.get_filtered_data(
        crop_year=crop_year,
        season=season,
        crop=crop,
        state=state
    )
    
    total_production = calculate_total_production(filtered_data)
    season_totals = get_yearly_season_totals(filtered_data)
        
    return filtered_data, total_production, season_totals


def calculate_total_production(filtered_data: List[Dict]) -> float:
    """
    Calcula a soma total da produção a partir dos dados filtrados
    
    Args:
        filtered_data: Lista de dicionários com os dados de produção
                      (como retornado por get_filtered_yield_data)
    
    Returns:
        Soma total da produção (float)
    
    Raises:
        ValueError: Se o campo 'production' não existir nos dados
    """
    if not filtered_data:
        return 0.0
    
    # Verifica se os dados têm o campo 'production'
    if 'production' not in filtered_data[0]:
        raise ValueError("O campo 'production' não foi encontrado nos dados")
    
    total = sum(item['production'] for item in filtered_data 
               if isinstance(item.get('production'), (int, float)))
    
    return total

from typing import Dict, List, Tuple
from collections import defaultdict

def get_yearly_season_totals(filtered_data: List[Dict]) -> Dict:
    """
    Agrupa a produção total por ano e estação, retornando um formato específico.
    
    Args:
        filtered_data: Lista de dicionários com os dados de produção
        
    Returns:
        Dicionário no formato:
        {
            "years": [lista de anos ordenados],
            "Spring": [produção por ano],
            "Summer": [produção por ano],
            ... outras estações ...
            "total": [produção total por ano]
        }
    """
    # Passo 1: Agrupar dados por ano e estação
    year_season_data = defaultdict(lambda: defaultdict(float))
    years = set()
    seasons = set()

    for item in filtered_data:
        year = item['crop_year']
        season = item['season']
        production = item.get('production', 0)
        
        year_season_data[year][season] += production
        years.add(year)
        seasons.add(season)

    # Passo 2: Ordenar anos e estações
    sorted_years = sorted(years)
    sorted_seasons = sorted(seasons)

    # Passo 3: Preparar a estrutura de resultados
    result = {
        "years": sorted_years,
        "total": [0] * len(sorted_years)
    }

    # Inicializa listas para cada estação
    for season in sorted_seasons:
        result[season] = [0] * len(sorted_years)

    # Passo 4: Preencher os dados
    for i, year in enumerate(sorted_years):
        for season in sorted_seasons:
            production = year_season_data[year].get(season, 0)
            result[season][i] = production
            result["total"][i] += production

    return result