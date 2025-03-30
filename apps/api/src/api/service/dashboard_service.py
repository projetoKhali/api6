from typing import List, Dict, Tuple, Union, Optional
from api.models.dashboard_model import DashboardModel  # ajuste o import conforme sua estrutura

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
    states_totals = get_production_by_state(filtered_data)
    yearly_crop_stats = get_yearly_crop_statistics(filtered_data)
    metrics = get_general_metrics(filtered_data)
    crops_totals = get_production_by_crop(filtered_data)
    
    filtered_data = filtered_data[0:500]

        
    return filtered_data, total_production, season_totals, states_totals, yearly_crop_stats, metrics, crops_totals

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

from collections import defaultdict
from typing import List, Dict

from collections import defaultdict
from typing import List, Dict

def get_yearly_season_totals(filtered_data: List[Dict]) -> Dict:
    """
    Agrupa a produção total por ano e estação, garantindo que produções registradas 
    como "Whole Year" sejam mantidas separadas e uma nova chave "production_average"
    seja criada contendo a soma dos valores dentro de "Whole Year" dividida por 4.

    Args:
        filtered_data: Lista de dicionários com os dados de produção.

    Returns:
        Dicionário no formato:
        {
            "years": [lista de anos ordenados],
            "Spring": [produção por ano],
            "Summer": [produção por ano],
            "Fall": [produção por ano],
            "Winter": [produção por ano],
            "total": [produção total por ano],
            "production_average": [média apenas da produção registrada em "Whole Year"]
        }
    """
    # Passo 1: Agrupar dados por ano e estação
    year_season_data = defaultdict(lambda: defaultdict(float))
    whole_year_data = defaultdict(float)  # Guarda os valores de "Whole Year"
    years = set()

    for item in filtered_data:
        year = item['crop_year']
        season = item['season']
        production = item.get('production', 0)

        if season == "Whole Year":
            whole_year_data[year] += production  # Acumula a produção do ano inteiro
        else:
            year_season_data[year][season] += production  # Produção normal por estação

        years.add(year)

    # Passo 2: Ordenar anos e definir estações fixas
    sorted_years = sorted(years)
    fixed_seasons = ["Spring", "Summer", "Autumn", "Winter"]

    # Passo 3: Preparar a estrutura de resultados
    result = {
        "years": sorted_years,
        "total": [0] * len(sorted_years),
        "production_average": [0] * len(sorted_years)  # Média apenas dos dados "Whole Year"
    }

    # Inicializa listas para cada estação
    for season in fixed_seasons:
        result[season] = [0] * len(sorted_years)

    # Passo 4: Preencher os dados
    for i, year in enumerate(sorted_years):
        total_year_prod = 0
        for season in fixed_seasons:
            production = year_season_data[year].get(season, 0)
            result[season][i] = production
            total_year_prod += production

        # Soma dos valores das estações
        result["total"][i] = total_year_prod

        # Média apenas dos valores de "Whole Year"
        if year in whole_year_data:
            result["production_average"][i] = whole_year_data[year] / 4

    return result



def get_production_by_state(filtered_data: List[Dict]) -> List[Dict[str, Union[str, float]]]:
    """
    Calcula o total de produção, área e eficiência por estado, ordenando por eficiência (maior para menor)
    
    Args:
        filtered_data: Lista de dicionários com os dados de produção
        
    Returns:
        Lista de dicionários no formato:
        [
            {
                "state": "Santa Catarina", 
                "total_production": 5685.0,
                "total_area": 1200.0,
                "efficiency": 4.74  # produção/área
            },
            {
                "state": "Paraná", 
                "total_production": 7200.0,
                "total_area": 2000.0,
                "efficiency": 3.60
            },
            ...
        ]
        ordenado por eficiência (decrescente)
    """
    state_stats = defaultdict(lambda: {'production': 0.0, 'area': 0.0})
    
    for item in filtered_data:
        state = item.get('state')
        production = item.get('production', 0)
        area = item.get('area', 0)
        
        if state is not None:
            if isinstance(production, (int, float)):
                state_stats[state]['production'] += production
            if isinstance(area, (int, float)):
                state_stats[state]['area'] += area
    
    # Converte para lista de dicionários e calcula eficiência
    result = []
    for state, stats in state_stats.items():
        efficiency = stats['production'] / stats['area'] if stats['area'] > 0 else 0.0
        result.append({
            "state": state, 
            "total_production": stats['production'],
            "total_area": stats['area'],
            "efficiency": round(efficiency, 2)
        })
    
    # Ordena por eficiência (decrescente) e depois por nome do estado (caso empate)
    result.sort(key=lambda x: (-x['efficiency'], x['state']))
    
    return result

def get_filter():
    model = DashboardModel()
    unique_values = model.get_all_unique_values()
    return unique_values["crop_years"], unique_values["seasons"], unique_values["crops"], unique_values["states"]

def get_yearly_crop_statistics(filtered_data: List[Dict]) -> Dict[int, List[Dict]]:
    """
    Agrupa estatísticas por ano e por espécie/cultura
    
    Args:
        filtered_data: Lista de dicionários com os dados de produção
        
    Returns:
        Dicionário no formato:
        {
            ano1: [
                {
                    "crop": "nome da cultura",
                    "total_production": soma da produção,
                    "avg_area": média da área cultivada,
                    "total_fertilizer": soma do fertilizante usado,
                    "total_pesticide": soma do pesticida usado,
                    "avg_rainfall": média da precipitação anual
                },
                ...
            ],
            ano2: [...],
            ...
        }
    """
    # Estrutura para armazenar os dados intermediários
    year_crop_data = defaultdict(lambda: defaultdict(lambda: {
        'productions': [],
        'areas': [],
        'fertilizers': [],
        'pesticides': [],
        'rainfalls': []
    }))
    
    # Coletar todos os dados
    for item in filtered_data:
        year = item['crop_year']
        crop = item['crop']
        
        # Adiciona cada valor às listas correspondentes
        year_crop_data[year][crop]['productions'].append(item.get('production', 0))
        year_crop_data[year][crop]['areas'].append(item.get('area', 0))
        year_crop_data[year][crop]['fertilizers'].append(item.get('fertilizer', 0))
        year_crop_data[year][crop]['pesticides'].append(item.get('pesticide', 0))
        year_crop_data[year][crop]['rainfalls'].append(item.get('annual_rainfall', 0))
    
    # Processar os dados para calcular as estatísticas
    result = {}
    
    for year, crops in year_crop_data.items():
        crop_list = []
        
        for crop_name, stats in crops.items():
            # Calcular as estatísticas para cada cultura
            total_production = sum(stats['productions'])
            avg_area = sum(stats['areas']) / len(stats['areas']) if stats['areas'] else 0
            total_fertilizer = sum(stats['fertilizers'])
            total_pesticide = sum(stats['pesticides'])
            avg_rainfall = sum(stats['rainfalls']) / len(stats['rainfalls']) if stats['rainfalls'] else 0
            
            crop_list.append({
                "crop": crop_name,
                "total_production": total_production,
                "avg_area": avg_area,
                "total_fertilizer": total_fertilizer,
                "total_pesticide": total_pesticide,
                "avg_rainfall": avg_rainfall
            })
        
        # Ordenar a lista de culturas por nome
        result[year] = sorted(crop_list, key=lambda x: x['crop'])
    
    return result

def get_general_metrics(filtered_data: List[Dict]) -> Dict[str, Union[float, int]]:
    """
    Calcula métricas gerais de produção agrícola a partir dos dados filtrados.
    
    Args:
        filtered_data: Lista de dicionários com os dados de produção
        
    Returns:
        Dicionário com as seguintes métricas:
        {
            "production_efficiency": float,  # Eficiência da produção (total produzido / área total)
            "total_production": float,      # Soma total da produção
            "total_cultivated_area": float,  # Soma total de áreas cultivadas
            "total_species": int,           # Contagem única de espécies/culturas
            "total_states": int             # Contagem única de estados
        }
    """
    if not filtered_data:
        return {
            "production_efficiency": 0.0,
            "total_production": 0.0,
            "total_cultivated_area": 0.0,
            "total_species": 0,
            "total_states": 0
        }

    # Inicializa variáveis para os cálculos
    total_production = 0.0
    total_area = 0.0
    unique_species = set()
    unique_states = set()

    for item in filtered_data:
        # Soma a produção total (ignorando valores não numéricos)
        production = item.get('production', 0)
        if isinstance(production, (int, float)):
            total_production += production

        # Soma a área total (ignorando valores não numéricos)
        area = item.get('area', 0)
        if isinstance(area, (int, float)):
            total_area += area

        # Adiciona espécies e estados aos conjuntos únicos
        crop = item.get('crop')
        if crop:
            unique_species.add(crop)

        state = item.get('state')
        if state:
            unique_states.add(state)

    # Calcula a eficiência (evitando divisão por zero)
    production_efficiency = total_production / total_area if total_area > 0 else 0.0

    return {
        "production_efficiency": round(production_efficiency, 2),
        "total_production": round(total_production, 2),
        "total_cultivated_area": round(total_area, 2),
        "total_species": len(unique_species),
        "total_states": len(unique_states)
    }
    
    
def get_production_by_crop(filtered_data: List[Dict]) -> List[Dict[str, Union[str, float]]]:
    """
    Calcula o total de produção, área e eficiência por cultura, ordenando por eficiência (maior para menor)
    
    Args:
        filtered_data: Lista de dicionários com os dados de produção
        
    Returns:
        Lista de dicionários no formato:
        [
            {
                "crop": "Soja", 
                "total_production": 15000.0,
                "total_area": 3000.0,
                "efficiency": 5.0  # produção/área
            },
            {
                "crop": "Milho", 
                "total_production": 12000.0,
                "total_area": 4000.0,
                "efficiency": 3.0
            },
            ...
        ]
        ordenado por eficiência (decrescente)
    """
    crop_stats = defaultdict(lambda: {'production': 0.0, 'area': 0.0})
    
    for item in filtered_data:
        crop = item.get('crop')
        production = item.get('production', 0)
        area = item.get('area', 0)
        
        if crop is not None:
            if isinstance(production, (int, float)):
                crop_stats[crop]['production'] += production
            if isinstance(area, (int, float)):
                crop_stats[crop]['area'] += area
    
    # Converte para lista de dicionários e calcula eficiência
    result = []
    for crop, stats in crop_stats.items():
        efficiency = stats['production'] / stats['area'] if stats['area'] > 0 else 0.0
        result.append({
            "crop": crop, 
            "total_production": stats['production'],
            "total_area": stats['area'],
            "efficiency": round(efficiency, 2)
        })
    
    # Ordena por eficiência (decrescente) e depois por nome da cultura (caso empate)
    result.sort(key=lambda x: (-x['efficiency'], x['crop']))
    
    return result