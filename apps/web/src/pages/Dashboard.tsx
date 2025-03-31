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
  AgriculturalData,
  cropsTotalsSchema,
  filterListSchema,
  Metrics,
  StatesTotals,
  YieldDataResponse,
} from '../schemas/DashboardSchema';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import TableComponent, { Column } from '../components/TableComponent';


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

function App() {
  const [yieldData, setYieldData] = useState<YieldDataResponse | null>(null);
  const [stateData, setStateData] = useState<StatesTotals[] | null>(null);
  const [filtersData, setFiltersData] = useState<filterListSchema | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<FilterParams>({});
  const [cropData, setCropData] = useState<cropsTotalsSchema[] | null>(null);
  const [data, setData] = useState<AgriculturalData[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    production_efficiency: 0,
    total_cultivated_area: 0,
    total_production: 0,
    total_species: 0,
    total_states: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchYieldData(selectedFilters);
        const dataMetrics = data.metrics;
        setYieldData(data);
        setStateData(data.states_totals); // Adicione esta linha
        setMetrics(dataMetrics);
        setCropData(data.crops_totals);
        setData(data.data);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };

    fetchData();
  }, [selectedFilters]);

  useEffect(() => {
    getFilterData()
      .then((data) => setFiltersData(data))
      .catch((error) => console.error('Erro ao buscar filtros:', error));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchYieldData(selectedFilters);
        const dataMetrics = data.metrics;
        setYieldData(data);
        setMetrics(dataMetrics);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };

    fetchData();
  }, [selectedFilters]);

  const tableSchema: Column[] = [
    { key: "crop", label: "Espécie", type: "text" },
    { key: "area", label: "Area total", type: "text" },
    { key: "crop_year", label: "Ano", type: "number" },
    { key: "fertilizer", label: "Fertilizante", type: "number" },
    { key: "pesticide", label: "Pesticida", type: "number" },
    { key: "production", label: "Produção", type: "number" },
    { key: "season", label: "Estação", type: "text" },
    { key: "state", label: "Estado", type: "text" },
  ];

  function handleRowSelect(row: Record<string, any>) {
    console.log("Linha selecionada:", row);
  }

  const handleFilterChange = (filterName: keyof FilterParams, value: any) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterName]: value && value.length > 0 ? value : undefined,
    }));
  };

  const lineChartData: LineChartSchema = {
    title: { text: 'Volume produzido por estação do ano', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['Verão', 'Outono', 'Inverno', 'Primavera', "Trimestre (Produções Anuais)"],
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
      {
        name: 'Trimestre (Produções Anuais)',
        type: 'line',
        data: yieldData?.season_totals.production_average?.map(Number) || [],
        itemStyle: {
          color: '#918f61',
        },
      },
    ],
    grid: {
      left: '1%',
      right: '1%',
      top: '15%',
      bottom: '10%',
      containLabel: true,
    },
  };



  const getScatterDataByYear = () => {
    if (!yieldData?.yearly_crop_stats) return [];

    const scatterData = [];

    for (const [year, crops] of Object.entries(yieldData.yearly_crop_stats)) {
      for (const crop of crops) {
        scatterData.push({
          name: crop.crop,
          year: parseInt(year),
          value: [
            crop.total_fertilizer, // Eixo X (fertilizante total)
            crop.total_production, // Eixo Y (rendimento = produção/área)
            crop.avg_area, // Tamanho do ponto (área média)
            crop.crop, // Cor (cultura)
          ],
          total_production: crop.total_production,
          avg_rainfall: crop.avg_rainfall,
        });
      }
    }

    return scatterData;
  };

  const getCropAreaChartData = (cropsData: cropsTotalsSchema[] | null): EChartsOption => {
    if (!cropsData || cropsData.length === 0) {
      return {
        title: {
          text: 'Nenhum dado disponível',
          left: 'center'
        }
      };
    }

    // Ordena as culturas por produção (decrescente)
    const sortedData = [...cropsData].sort((a, b) => b.total_production - a.total_production);

    return {
      title: {
        text: 'Produção e Eficiência por Cultura',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999'
          }
        },
        formatter: (params: any) => {
          const crop = params[0].name;
          const cropInfo = sortedData.find(c => c.crop === crop);
          const production = params[0].value;
          const efficiency = params[1].value;

          return `
            <strong>${crop}</strong><br/>
            Produção total: ${formatBrazilianValue(production)}<br/>
            Eficiência: ${efficiency.toFixed(2)} (produção/área)<br/>
            Área total: ${formatBrazilianValue(cropInfo?.total_area || 0)} m²
          `;
        }
      },
      legend: {
        data: ['Produção Total', 'Eficiência'],
        top: '30'
      },
      grid: {
        left: '1%',
        right: '1%',
        bottom: '10%',
        top: '20%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: sortedData.map(item => item.crop),
        axisLabel: {
          interval: 0,
          rotate: 30, // Rotaciona os labels para melhor legibilidade
          fontSize: 10
        },
        axisPointer: {
          type: 'shadow'
        }
      },
      yAxis: [
        {
          type: 'value',
          name: 'Produção Total',
          position: 'left',
          axisLine: {
            lineStyle: {
              color: '#026734'
            }
          },
          axisLabel: {
            formatter: (value: number) => formatBrazilianValue(value)
          }
        },
        {
          type: 'value',
          name: 'Eficiência',
          position: 'right',
          axisLine: {
            lineStyle: {
              color: '#8FFD24'
            }
          },
          axisLabel: {
            formatter: (value: number) => value.toFixed(2)
          },
          splitLine: {
            show: false
          }
        }
      ],
      series: [
        {
          name: 'Produção Total',
          type: 'bar',
          barWidth: '40%',
          data: sortedData.map(item => item.total_production),
          itemStyle: {
            color: '#79dd7e'
          },
          label: {
            show: true,
            position: 'top',
            formatter: (params: any) => formatBrazilianValue(params.value)
          }
        },
        {
          name: 'Eficiência',
          type: 'line',
          yAxisIndex: 1,
          data: sortedData.map(item => item.efficiency),
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            color: '#caf729'
          },
          lineStyle: {
            width: 3
          },
          label: {
            show: true,
            position: 'top',
            formatter: (params: any) => params.value.toFixed(2)
          }
        }
      ]
    };
  };

  const getStatesBarChartData = (statesData: StatesTotals[] | null): EChartsOption => {
    if (!statesData || statesData.length === 0) {
      return {
        title: {
          text: 'Nenhum dado disponível',
          left: 'center'
        }
      };
    }

    // Ordena os estados por eficiência (decrescente)
    const sortedData = [...statesData].sort((a, b) => a.efficiency - b.efficiency);

    return {
      title: {
        text: 'Área Cultivada e Eficiência por Estado',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          const state = params[0].name;
          const stateInfo = sortedData.find(s => s.state === state);
          const area = params[0].value;
          const efficiency = params[1].value;

          return `
            <strong>${state}</strong><br/>
            Área total: ${formatBrazilianValue(area)} m²<br/>
            Eficiência: ${efficiency.toFixed(2)} (produção/área)<br/>
            Produção total: ${formatBrazilianValue(stateInfo?.total_production || 0)}
          `;
        }
      },
      legend: {
        data: ['Área Cultivada (m²)', 'Eficiência (produção/área)'],
        top: '30'
      },
      grid: {
        left: '5%',
        right: '10%',
        bottom: '10%',
        top: '10%',
        containLabel: true
      },
      yAxis: {
        type: 'category',
        data: sortedData.map(item => item.state),
        axisLabel: {
          interval: 0,
          fontSize: 15
        }
      },
      xAxis: [
        {
          type: 'value',
          name: 'Área (m²)',
          position: 'bottom',
          nameLocation: 'middle',
          nameGap: 25,
          axisLabel: {
            formatter: (value: number) => formatBrazilianValue(value)
          },
          axisLine: {
            lineStyle: {
              color: 'black'
            }
          },
          splitLine: {
            show: false
          }
        },
        {
          type: 'value',
          name: 'Eficiência',
          position: 'top',
          nameLocation: 'middle',
          nameGap: 25,
          min: 0,
          max: Math.max(...sortedData.map(item => item.efficiency)) * 1.2,
          axisLabel: {
            formatter: (value: number) => value.toFixed(1)
          },
          axisLine: {
            lineStyle: {
              color: 'black'
            }
          },
          splitLine: {
            show: false
          }
        }
      ],
      series: [
        {
          name: 'Área Cultivada (m²)',
          type: 'bar',
          data: sortedData.map(item => item.total_area),
          itemStyle: {
            color: '#7a907c'
          },
          label: {
            show: true,
            position: 'right',
            formatter: (params: any) => formatBrazilianValue(params.value)
          },
          barWidth: '40%'
        },
        {
          name: 'Eficiência (produção/área)',
          type: 'line',
          data: sortedData.map(item => item.efficiency),
          xAxisIndex: 1, // Usa o segundo eixo X (topo)
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            color: '#9ae07d'
          },
          label: {
            show: true,
            position: 'right',
            formatter: (params: any) => params.value.toFixed(2)
          },
          lineStyle: {
            width: 3
          }
        }
      ]
    };
  };

  // Nova função para obter dados de pesticida vs rendimento
  const getPesticideScatterData = () => {
    if (!yieldData?.yearly_crop_stats) return [];

    const scatterData = [];

    for (const [year, crops] of Object.entries(yieldData.yearly_crop_stats)) {
      for (const crop of crops) {
        scatterData.push({
          name: crop.crop,
          year: parseInt(year),
          value: [
            crop.total_pesticide || 0, // Eixo X (pesticida total)
            crop.total_production, // Eixo Y (rendimento = produção/área)
            crop.avg_area, // Tamanho do ponto (área média)
            crop.crop, // Cor (cultura)
          ],
          total_production: crop.total_production,
          avg_rainfall: crop.avg_rainfall,
        });
      }
    }

    return scatterData;
  };

  // Nova função para linha de tendência de pesticida
  const getPesticideRegressionLine = () => {
    const scatterData = getPesticideScatterData();
    if (scatterData.length === 0) return null;

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    const n = scatterData.length;

    scatterData.forEach((item) => {
      const x = Number(item.value[0]); // pesticida
      const y = Number(item.value[1]); // rendimento

      if (!isNaN(x)) sumX += x;
      if (!isNaN(y)) {
        sumY += y;
        sumXY += x * y;
      }
      sumX2 += x * x;
    });

    const denominator = n * sumX2 - sumX * sumX;
    if (denominator === 0) return null;

    const b = (n * sumXY - sumX * sumY) / denominator;
    const a = (sumY - b * sumX) / n;

    const xValues = scatterData
      .map((item) => Number(item.value[0]))
      .filter((x) => !isNaN(x));
    if (xValues.length === 0) return null;

    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);

    return [
      [minX, a + b * minX],
      [maxX, a + b * maxX],
    ];
  };

  // Configuração do novo gráfico de pesticida
  const pesticideScatterOption: EChartsOption = {
    title: {
      text: 'Relação entre Uso de Pesticidas e Rendimento por Cultura',
      left: 'center',
      top: '0',
    },
    tooltip: {
      formatter: (params: any) => {
        const data = params.data;
        return `
        <strong>${data.name} (${data.year})</strong><br/>
        Pesticida total: ${formatBrazilianValue(data.value[0])} kg<br/>
        Rendimento: ${formatBrazilianValue(data.value[1])}<br/>
        Área média: ${formatBrazilianValue(data.value[2])} ha<br/>
        Produção total: ${formatBrazilianValue(data.total_production)}<br/>
        Chuva média: ${formatBrazilianValue(data.avg_rainfall)} mm
      `;
      },
    },
    legend: {
      data: ['Dados', 'Linha de Tendência'],
      top: '30',
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '15%',
      top: '80',
      containLabel: true,
    },
    xAxis: {
      name: 'Pesticida Total (kg)',
      nameLocation: 'middle',
      nameGap: 30,
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'dashed',
        },
      },
    },
    yAxis: {
      name: 'Produção (Kg)',
      nameLocation: 'middle',
      nameGap: 110,
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'dashed',
        },
      },
    },
    series: [
      {
        name: 'Dados',
        type: 'scatter',
        symbolSize: function(data) {
          const areas = getPesticideScatterData().map((item) => item.value[2]);
          const minArea = Math.min(...areas.map((area) => typeof area === 'number' ? area : parseFloat(area as string)));
          const maxArea = Math.max(...areas.map((area) => typeof area === 'number' ? area : parseFloat(area as string)));
          return 10 + ((data[2] - minArea) / (maxArea - minArea)) * 30;
        },
        data: getPesticideScatterData(),
        itemStyle: {
          color: function(params: any) {
            const colors = ['#026734', '#8FFD24', '#50EA77', '#1a8703', '#A89059'];
            const index = params.data.name.charCodeAt(0) % colors.length;
            return colors[index];
          },
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
      {
        name: 'Linha de Tendência',
        type: 'line',
        lineStyle: {
          color: '#ff6666',
          width: 2,
          type: 'dashed',
        },
        data: getPesticideRegressionLine() || [],
        symbol: 'none',
        tooltip: {
          show: false,
        },
      },
    ],
  };

  const getRegressionLine = () => {
    const scatterData = getScatterDataByYear();
    if (scatterData.length === 0) return null;

    // Cálculo da regressão linear simples (y = a + bx)
    let sumX = 0,
      sumY = 0,
      sumXY = 0,
      sumX2 = 0;
    const n = scatterData.length;

    scatterData.forEach((item) => {
      // Garantindo que os valores são números
      const x = Number(item.value[0]); // fertilizante
      const y = Number(item.value[1]); // rendimento

      if (!isNaN(x)) sumX += x;
      if (!isNaN(y)) {
        sumY += y;
        sumXY += x * y;
      }
      sumX2 += x * x;
    });

    // Verificação adicional para evitar divisão por zero
    const denominator = n * sumX2 - sumX * sumX;
    if (denominator === 0) return null;

    const b = (n * sumXY - sumX * sumY) / denominator;
    const a = (sumY - b * sumX) / n;

    // Encontra os pontos mínimo e máximo de x para traçar a linha
    const xValues = scatterData
      .map((item) => Number(item.value[0]))
      .filter((x) => !isNaN(x));
    if (xValues.length === 0) return null;

    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);

    return [
      [minX, a + b * minX],
      [maxX, a + b * maxX],
    ];
  };

  const scatterChartOption: EChartsOption = {
    title: {
      text: 'Relação entre Fertilizante e Rendimento por Cultura e Ano',
      left: 'center',
      top: '0',
    },
    tooltip: {
      formatter: (params: any) => {
        const data = params.data;
        return `
          <strong>${data.name} (${data.year})</strong><br/>
          Fertilizante total: ${data.value[0].toLocaleString()} kg<br/>
          Rendimento: ${data.value[1].toFixed(2)}<br/>
          Área média: ${data.value[2].toFixed(2)} ha<br/>
          Produção total: ${data.total_production.toFixed(2)}<br/>
          Chuva média: ${data.avg_rainfall.toFixed(2)} mm
        `;
      },
    },
    legend: {
      data: ['Dados', 'Linha de Tendência'],
      top: '30',
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '15%',
      top: '80',
      containLabel: true,
    },
    xAxis: {
      name: 'Fertilizante Total (kg)',
      nameLocation: 'middle',
      nameGap: 40,
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'dashed',
        },
      },
    },
    yAxis: {
      name: 'Produção (kg)',
      nameLocation: 'middle',
      nameGap: 120,
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'dashed',
        },
      },
    },
    series: [
      {
        name: 'Dados',
        type: 'scatter',
        symbolSize: function(data) {
          // Ajusta o tamanho baseado na área (normalizado)
          const areas = getScatterDataByYear().map((item) => item.value[2]);
          const minArea = Math.min(
            ...areas.map((area) =>
              typeof area === 'number' ? area : parseFloat(area as string)
            )
          );
          const maxArea = Math.max(
            ...areas.map((area) =>
              typeof area === 'number' ? area : parseFloat(area as string)
            )
          );
          return 10 + ((data[2] - minArea) / (maxArea - minArea)) * 30;
        },
        data: getScatterDataByYear(),
        itemStyle: {
          color: function(params: any) {
            // Cores diferentes para cada cultura
            const colors = [
              '#026734', '#8FFD24', '#50EA77', '#1a8703', '#A89059'
            ];
            const index = params.data.name.charCodeAt(0) % colors.length;
            return colors[index];
          },
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
      {
        name: 'Linha de Tendência',
        type: 'line',
        lineStyle: {
          color: '#ff6666',
          width: 2,
          type: 'dashed',
        },
        data: getRegressionLine() || [],
        symbol: 'none',
        tooltip: {
          show: false,
        },
      },
    ],
  };

  const formatBrazilianValue = (value: number, decimalPlaces = 2): string => {
    if (typeof value !== 'number') return String(value);

    const absValue = Math.abs(value);
    const isInteger = Number.isInteger(value);

    // Bilhões
    if (absValue >= 1_000_000_000) {
      const formatted = (value / 1_000_000_000).toFixed(decimalPlaces).replace('.', ',');
      return `${formatted.replace(/,00$/, '')} B`; // Remove ,00 se existir
    }
    // Milhões
    else if (absValue >= 1_000_000) {
      const formatted = (value / 1_000_000).toFixed(decimalPlaces).replace('.', ',');
      return `${formatted.replace(/,00$/, '')} M`; // Remove ,00 se existir
    }
    // Milhares
    else if (absValue >= 1_000) {
      const formatted = (value / 1_000).toFixed(decimalPlaces).replace('.', ',');
      return `${formatted.replace(/,00$/, '')} K`; // Remove ,00 se existir
    }
    // Valores pequenos
    else {
      const options: Intl.NumberFormatOptions = {
        minimumFractionDigits: isInteger ? 0 : decimalPlaces,
        maximumFractionDigits: decimalPlaces
      };
      return value.toLocaleString('pt-BR', options);
    }
  };


  const getRainfallScatterData = () => {
    if (!yieldData?.yearly_crop_stats) return [];

    const scatterData = [];

    for (const [year, crops] of Object.entries(yieldData.yearly_crop_stats)) {
      for (const crop of crops) {
        scatterData.push({
          name: crop.crop,
          year: parseInt(year),
          value: [
            crop.avg_rainfall, // Eixo X (precipitação média)
            crop.total_production, // Eixo Y (rendimento = produção/área)
            crop.avg_area, // Tamanho do ponto (área média)
            crop.crop, // Cor (cultura)
          ],
          total_production: crop.total_production,
          total_pesticide: crop.total_pesticide,
          total_fertilizer: crop.total_fertilizer
        });
      }
    }

    return scatterData;
  };

  // Função para linha de tendência de precipitação
  const getRainfallRegressionLine = () => {
    const scatterData = getRainfallScatterData();
    if (scatterData.length === 0) return null;

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    const n = scatterData.length;

    scatterData.forEach((item) => {
      const x = Number(item.value[0]); // precipitação
      const y = Number(item.value[1]); // rendimento

      if (!isNaN(x)) sumX += x;
      if (!isNaN(y)) {
        sumY += y;
        sumXY += x * y;
      }
      sumX2 += x * x;
    });

    const denominator = n * sumX2 - sumX * sumX;
    if (denominator === 0) return null;

    const b = (n * sumXY - sumX * sumY) / denominator;
    const a = (sumY - b * sumX) / n;

    const xValues = scatterData
      .map((item) => Number(item.value[0]))
      .filter((x) => !isNaN(x));
    if (xValues.length === 0) return null;

    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);

    return [
      [minX, a + b * minX],
      [maxX, a + b * maxX],
    ];
  };

  // Configuração do gráfico de precipitação
  const rainfallScatterOption: EChartsOption = {
    title: {
      text: 'Relação entre Precipitação Média e Rendimento por Cultura',
      left: 'center',
      top: '0',
    },
    tooltip: {
      formatter: (params: any) => {
        const data = params.data;
        return `
          <strong>${data.name} (${data.year})</strong><br/>
          Precipitação média: ${data.value[0].toFixed(2)} mm<br/>
          Rendimento: ${data.value[1].toLocaleString()}<br/>
          Área média: ${data.value[2].toLocaleString()} ha<br/>
          Produção total: ${data.total_production}<br/>
          Pesticida total: ${data.total_pesticide} kg<br/>
          Fertilizante total: ${data.total_fertilizer} kg
        `;
      },
    },
    legend: {
      data: ['Dados', 'Linha de Tendência'],
      top: '30',
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '15%',
      top: '80',
      containLabel: true,
    },
    xAxis: {
      name: 'Precipitação Média (mm)',
      nameLocation: 'middle',
      nameGap: 30,
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'dashed',
        },
      },
    },
    yAxis: {
      name: 'Produção (Kg)',
      nameLocation: 'middle',
      nameGap: 110,
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'dashed',
        },
      },
    },
    series: [
      {
        name: 'Dados',
        type: 'scatter',
        symbolSize: function(data) {
          const areas = getRainfallScatterData().map((item) => item.value[2]);
          const minArea = Math.min(...areas.map((area) => typeof area === 'number' ? area : parseFloat(area as string)));
          const maxArea = Math.max(...areas.map((area) => typeof area === 'number' ? area : parseFloat(area as string)));
          return 10 + ((data[2] - minArea) / (maxArea - minArea)) * 30;
        },
        data: getRainfallScatterData(),
        itemStyle: {
          color: function(params: any) {
            const colors = ['#026734', '#8FFD24', '#50EA77', '#1a8703', '#A89059'];
            const index = params.data.name.charCodeAt(0) % colors.length;
            return colors[index];
          },
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
      {
        name: 'Linha de Tendência',
        type: 'line',
        lineStyle: {
          color: '#ff6666',
          width: 2,
          type: 'dashed',
        },
        data: getRainfallRegressionLine() || [],
        symbol: 'none',
        tooltip: {
          show: false,
        },
      },
    ],
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
        borderColor: '#026734',
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
      min: Math.min(...statesData.map((item) => item.value)), // Valor mínimo
      max: 1000000000, // Valor máximo
      inRange: {
        color: ['#50EA77', '#026734'], // Gradiente de cores
      },
      text: ['Alta produção', 'Baixa produção'],
      calculable: true,
      itemHeight: 300,
      width: 20,
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
        paddingBottom: '30px'
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
          height: '15%',
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
          <p className="title-card-dash">Eficiência da produção(u)</p>
          <p className="value-card-dash"> {formatBrazilianValue(metrics.production_efficiency)}</p>
        </div>
        <div className="card-dashboard">
          <p className="title-card-dash">Área Total cultivada(m)</p>
          <p className="value-card-dash">  {formatBrazilianValue(metrics.total_cultivated_area)}</p>
        </div>
        <div className="card-dashboard">
          <p className="title-card-dash">Quantidade de produção(u)</p>
          <p className="value-card-dash">  {formatBrazilianValue(metrics.total_production)}</p>
        </div>
        <div className="card-dashboard">
          <p className="title-card-dash">Total de Especies</p>
          <p className="value-card-dash"> {formatBrazilianValue(metrics.total_species)}</p>
        </div>
        <div className="card-dashboard">
          <p className="title-card-dash">Total de Estados</p>
          <p className="value-card-dash"> {formatBrazilianValue(metrics.total_states)}</p>
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
        <div style={{ height: '300px', minWidth: '100%' }}>
          <GenericChart option={getCropAreaChartData(cropData)} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', justifyContent: 'space-evenly', width: '100%' }}>
        <div style={{ width: '100%', border: '2px solid #ccc', borderRadius: '10px', padding: '20px', background: '#f0f0f0', boxShadow: '0px 4px 0px rgba(0, 0, 0, 0.1)' }}>
          <GenericChart option={getStatesBarChartData(stateData)} />
        </div>
        <div style={{ width: '100%', border: '2px solid #ccc', borderRadius: '10px', padding: '20px', background: '#f0f0f0', boxShadow: '0px 4px 0px rgba(0, 0, 0, 0.1)' }}>
          <BrazilMapChart option={mapChartData} />
        </div>
      </div>
      <div style={{ height: '400px', backgroundColor: '#f0f0f0', padding: '20px', borderRadius: '10px', boxShadow: '0px 4px 0px rgba(0, 0, 0, 0.1)' }}>
        <GenericChart option={scatterChartOption} />
      </div>
      <div style={{ height: '400px', backgroundColor: '#f0f0f0', padding: '20px', borderRadius: '10px', boxShadow: '0px 4px 0px rgba(0, 0, 0, 0.1)' }}>
        <GenericChart option={pesticideScatterOption} />
      </div>
      <div style={{ height: '400px', backgroundColor: '#f0f0f0', padding: '20px', borderRadius: '10px', boxShadow: '0px 4px 0px rgba(0, 0, 0, 0.1)' }}>
        <GenericChart option={rainfallScatterOption} />
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        maxHeight: '500px',
      }}>
        <TableComponent schema={tableSchema} data={data} onRowSelect={handleRowSelect} />
      </div>
    </div>

  );
}

export default App;
