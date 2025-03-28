import React, { useState, useEffect } from 'react';
import {
  LineChartSchema,
  StackedBarChartSchema,
  PieChartSchema,
  MapChartSchema,
} from '../schemas/chartSchema';
import GenericChart from '../components/GenericChart';
import BrazilMapChart from '../components/BrazilMapChart';
import Select, { MultiValue } from 'react-select';
import '../styles.css';
import {
  fetchYieldData,
  FilterParams,
  getFilterData,
} from '../service/DashboardService';
import {
  filterListSchema,
  StatesTotals,
  YieldDataResponse,
} from '../schemas/DashboardSchema';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

interface SelectedFilters {
  seasons: string[];
  crops: string[];
  states: string[];
  years: string[];
}

// Dados para o gráfico de barras empilhadas
const stackedBarChartData: StackedBarChartSchema = {
  title: { text: 'Gráfico de Barras Empilhadas', left: 'center' },
  tooltip: { trigger: 'axis' },
  legend: {
    data: ['Em cultivo', 'Perdido', 'Colhido'],
    top: '90%',
    left: 'center',
  },
  xAxis: {
    type: 'category',
    data: ['Manga', 'Dacueba', 'bom', 'ciriguela', 'zeruela'],
  },
  yAxis: { type: 'value' },
  grid: {
    left: '1%', // Reduz a margem esquerda
    right: '1%', // Reduz a margem direita para ocupar mais espaço
    top: '15%',
    bottom: '10%',
    containLabel: true, // Garante que os labels não saiam do gráfico
  },
  series: [
    {
      name: 'Perdido',
      type: 'bar',
      stack: 'Total',
      data: [0.5, 1.7, 1.6, 2.9, 1.7],
      itemStyle: {
        color: '#8FFD24',
      },
    },
  ],
};



// Dados para o gráfico de pizza
const pieChartData: PieChartSchema = {
  title: { text: 'Gráfico de Pizza', left: 'center' },
  tooltip: { trigger: 'item' },
  legend: {
    data: ['Produto A', 'Produto B', 'Produto C'],
    top: '90%',
    left: 'center',
  },
  series: [
    {
      name: 'Produtos',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '50%'],
      data: [
        {
          value: 1048,
          name: 'Produto A',
          itemStyle: {
            color: '#8FFD24',
          },
        },
        {
          value: 735,
          name: 'Produto B',
          itemStyle: {
            color: '#000000',
          },
        },
        {
          value: 580,
          name: 'Produto C',
          itemStyle: {
            color: '#026734',
          },
        },
      ],
    },
  ],
};

const options = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
];

function App() {
  const [selectedOptions, setSelectedOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [yieldData, setYieldData] = useState<YieldDataResponse | null>(null);
  const [stateData, setStateData] = useState<StatesTotals[] | null>(null);
  const [filtersData, setFiltersData] = useState<filterListSchema | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<FilterParams>({});

  const handleChange = (
    newValue: MultiValue<{ value: string; label: string }>
  ) => {
    setSelectedOptions(newValue ? [...newValue] : []);
  };

  useEffect(() => {
    fetchYieldData({})
      .then((response) => {
        setYieldData(response);
        setStateData(response.states_totals);
        console.log('Dados recebidos:', response);
      })
      .catch((error) => {
        console.error('Erro:', error);
      });
  }, []);

  useEffect(() => {
    getFilterData()
      .then((data) => setFiltersData(data))
      .catch((error) => console.error('Erro ao buscar filtros:', error));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchYieldData(selectedFilters);
        setYieldData(data);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };

    fetchData();
  }, [selectedFilters]);

  const getScatterData = () => {
    if (!yieldData?.data) return [];
  
    return yieldData.data.map(item => ({
      name: item.crop,
      value: [
        item.fertilizer, // Eixo X (fertilizante)
        item.yield,      // Eixo Y (rendimento)
        item.area,       // Tamanho do ponto (área)
        item.crop        // Cor (cultura)
      ],
      production: item.production,
      state: item.state,
      season: item.season
    }));
  };

  // Função para lidar com mudanças nos filtros
  const handleFilterChange = (filterName: keyof FilterParams, value: any) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterName]: value && value.length > 0 ? value : undefined,
    }));
  };

  const getSelectOptions = (items: string[]) => {
    return items.map((item) => ({
      value: item,
      label: item,
    }));
  };

  const scatterChartOption: EChartsOption = {
    title: {
      text: 'Relação entre Fertilizante e Rendimento por Cultura',
      left: 'center'
    },
    tooltip: {
      formatter: (params: any) => {
        const data = params.data;
        return `
          <strong>${data.name}</strong><br/>
          Fertilizante: ${data.value[0]} kg<br/>
          Rendimento: ${data.value[1]}<br/>
          Área: ${data.value[2]} ha<br/>
          Produção: ${data.production}<br/>
          Estado: ${data.state}<br/>
          Estação: ${data.season}
        `;
      }
    },
    grid: {
      left: '10%',
      right: '5%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      name: 'Fertilizante (kg)',
      nameLocation: 'middle',
      nameGap: 30,
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    yAxis: {
      name: 'Rendimento',
      nameLocation: 'middle',
      nameGap: 30,
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: 'Culturas',
        type: 'scatter',
        symbolSize: function (data) {
          // Ajusta o tamanho baseado na área (normalizado)
          const minArea = Math.min(...(yieldData?.data.map(item => item.area) || [0]));
          const maxArea = Math.max(...(yieldData?.data.map(item => item.area) || [1]));
          return 10 + ((data[2] - minArea) / (maxArea - minArea)) * 30;
        },
        data: getScatterData(),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  const lineChartData: LineChartSchema = {
    title: { text: 'Volume produzido por estação do ano', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['Verão', 'Outono', 'Inverno', 'Primavera'],
      top: '90%',
      left: 'center',
    },
    xAxis: {
      type: 'category',
      data: yieldData?.season_totals.years?.map(String) || [],
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: 'Verão',
        type: 'line',
        data: yieldData?.season_totals.Summer?.map(Number) || [],
        itemStyle: {
          color: '#026734',
        },
      },
      {
        name: 'Outono',
        type: 'line',
        data: yieldData?.season_totals.Autumn?.map(Number) || [],
        itemStyle: {
          color: '#8FFD24',
        },
      },
      {
        name: 'Inverno',
        type: 'line',
        data: yieldData?.season_totals.Winter?.map(Number) || [],
        itemStyle: {
          color: '#50EA77',
        },
      },
      {
        name: 'Primavera',
        type: 'line',
        data: yieldData?.season_totals.Spring?.map(Number) || [],
        itemStyle: {
          color: 'black',
        },
      },
    ],
    grid: {
      left: '1%', // Reduz a margem esquerda
      right: '1%', // Reduz a margem direita para ocupar mais espaço
      top: '15%',
      bottom: '10%',
      containLabel: true, // Garante que os labels não saiam do gráfico
    },
  };

  const statesData =
    yieldData?.states_totals?.map((state) => ({
      name: state.state,
      value: state.total_production, // Usa logaritmo para normalizar
    })) || [];

  console.log('Dados formatados dos estados:', statesData);

  const maxValue = Math.max(...statesData.map((item) => item.value));
  const minValue = Math.min(...statesData.map((item) => item.value));

  // Função para mapear valores para cores
  const getColor = (value: number) => {
    // Exemplo de cor com base no valor (você pode ajustar a lógica de cores conforme necessário)
    const colorScale = ['#f7f7f7', '#ff6666'];
    return echarts.color.lerp(value / maxValue, colorScale);

    // Normaliza para o intervalo de [0, 1]
  };

  // Configuração do gráfico
  const mapChartData: EChartsOption = {
    title: { text: 'Produção por Estado', left: 'center' },
    tooltip: {
      trigger: 'item',
    },
    geo: {
      map: 'BR',
      roam: true,
      itemStyle: {
        areaColor: '#f0f0f0',
        borderColor: '#fff',
        borderWidth: 1,
      },
      emphasis: {
        itemStyle: {
          areaColor: '#026734',
        },
      },
    },
    visualMap: {
      left: 'right',
      min: Math.min(...statesData.map(item => item.value)), // Valor mínimo
      max: 1000000000, // Valor máximo
      inRange: {
        color: ['#50EA77', '#026734'] // Gradiente de cores
      },
      text: ['Alta produção', 'Baixa produção'],
      calculable: true,
      itemHeight: 300,
      width: 20
    },

    series: [
      {
        name: 'População por Estado',
        type: 'map',
        map: 'BR',
        geoIndex: 0,
        data: statesData.map((item) => {
          const color = getColor(item.value);
          console.log(
            `Estado: ${item.name}, Valor: ${item.value}, Cor:`,
            color
          );
          return {
            ...item,
            itemStyle: { areaColor: color },
          };
        }),
      },
    ],
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minHeight: '100vh',
        gap: '12px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          height: '12%',
          padding: '10px',
          backgroundColor: '#f0f0f0',
          gap: '10px',
          justifyContent: 'space-evenly',
          flexWrap: 'wrap',
        }}
      >
        {filtersData && (
            <>
              {/* Filtro de anos */}
              <Select
                options={
                  filtersData?.crop_years.map((year) => ({
                    value: year,
                    label: year,
                  })) || []
                }
                isMulti
                onChange={(selected) =>
                  handleFilterChange(
                    'crop_year',
                    selected?.map((item) => item.value)
                  )
                }
                placeholder="Selecione os anos..."
              />
            
              {/* Filtro de estações */}
              <Select
                options={
                  filtersData?.seasons.map((season) => ({
                    value: season,
                    label: season,
                  })) || []
                }
                isMulti
                onChange={(selected) =>
                  handleFilterChange(
                    'season',
                    selected?.map((item) => item.value)
                  )
                }
                placeholder="Selecione as estações..."
              />
            
              {/* Filtro de culturas */}
              <Select
                options={
                  filtersData?.crops.map((crop) => ({
                    value: crop,
                    label: crop,
                  })) || []
                }
                isMulti
                onChange={(selected) =>
                  handleFilterChange(
                    'crop',
                    selected?.map((item) => item.value)
                  )
                }
                placeholder="Selecione as culturas..."
              />
            
              {/* Filtro de estados */}
              <Select
                options={
                  filtersData?.states.map((state) => ({
                    value: state,
                    label: state,
                  })) || []
                }
                isMulti
                onChange={(selected) =>
                  handleFilterChange(
                    'state',
                    selected?.map((item) => item.value)
                  )
                }
                placeholder="Selecione os estados..."
              />
            </>
        )}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          height: '12%',
          padding: '10px',
          gap: '10px',
          backgroundColor: '#f0f0f0',
          justifyContent: 'space-evenly',
          alignItems: 'center',
          flexWrap: 'wrap',
          borderRadius: '10px',
          boxShadow: '0px 4px 0px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className="card-dashboard">
          <p className="title-card-dash">Eficiência da produção</p>
          <p className="value-card-dash"> 7</p>
        </div>
        <div className="card-dashboard">
          <p className="title-card-dash">Área Total cultivada</p>
          <p className="value-card-dash"> 7</p>
        </div>
        <div className="card-dashboard">
          <p className="title-card-dash">Quantidade de produção</p>
          <p className="value-card-dash"> 7</p>
        </div>
        <div className="card-dashboard">
          <p className="title-card-dash">Total de Especies</p>
          <p className="value-card-dash"> 7</p>
        </div>
        <div className="card-dashboard">
          <p className="title-card-dash">Total de Estados</p>
          <p className="value-card-dash"> 7</p>
        </div>
      </div>
      <div
        style={{
          height: '300px',
          backgroundColor: '#f0f0f0',
          borderRadius: '10px',
          boxShadow: '0px 4px 0px rgba(0, 0, 0, 0.1)',
          padding: '10px',
        }}
      >
        <GenericChart option={lineChartData} />
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '20px',
          height: '100%',
          minHeight: '300px',
          padding: '20px',
          backgroundColor: '#f0f0f0',
          borderRadius: '10px',
          boxShadow: '0px 4px 0px rgba(0, 0, 0, 0.1)',
          flexWrap: 'wrap',
          justifyContent: 'space-evenly',
        }}
      >
        <div style={{ height: '300px', width: '45%' }}>
          <GenericChart option={stackedBarChartData} />
        </div>
        <div style={{ height: '300px', width: '45%' }}>
          <GenericChart option={stackedBarChartData} />
        </div>
      </div>
      <div
        style={{
          backgroundColor: '#f0f0f0',
          height: '100%',
          minHeight: '240px',
          display: 'flex',
          flexDirection: 'row',
          padding: '20px',
          gap: '20px',
          justifyContent: 'space-evenly',
        }}
      >
        <div style={{ height: '200px', width: '30%' }}>
          <GenericChart option={pieChartData} />
        </div>
        <div style={{ height: '200px', width: '30%' }}>
          <GenericChart option={pieChartData} />
        </div>
      </div>
      <div style={{ height: '300px', width: '1000px' }}>
        <BrazilMapChart option={mapChartData} />
        <div style={{ height: '700px', width: '100%' }}>
          <GenericChart option={scatterChartOption} />
        </div>
      </div>
    </div>
  );
}

export default App;
