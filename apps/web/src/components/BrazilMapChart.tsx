import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';

const BrazilMapChart = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [geoJsonData, setGeoJsonData] = useState(null);

  useEffect(() => {
    // Carregar o arquivo GeoJSON do Brasil
    fetch('/brazil-states.geojson')
      .then(response => response.json())
      .then(data => {
        setGeoJsonData(data);
      });  
  }, []);

  useEffect(() => {
    if (geoJsonData && chartRef.current) {
      // Inicializar o gráfico após o GeoJSON ser carregado
      const chart = echarts.init(chartRef.current);

      // Registrar o mapa do Brasil
      echarts.registerMap('BR', geoJsonData);

      // Dados de população por estado
      const populationData = [
        { name: 'São Paulo', value: 100 },
        { name: 'Rio de Janeiro', value: 80 },
        { name: 'Minas Gerais', value: 60 },
        { name: 'Bahia', value: 6 },
        { name: 'Pernambuco', value: 499 },
        // Você pode adicionar mais dados de população aqui
      ];

      // Encontrar o valor mínimo e máximo para aplicar uma escala de cores
      const maxValue = Math.max(...populationData.map(item => item.value));
      const minValue = Math.min(...populationData.map(item => item.value));

      // Função para mapear valores para cores
      const getColor = (value: number) => {
        // Exemplo de cor com base no valor (você pode ajustar a lógica de cores conforme necessário)
        const colorScale = ['#f7f7f7', '#ff6666'];
        return echarts.color.lerp(value / maxValue, colorScale); // Normaliza para o intervalo de [0, 1]
      };

      // Configuração do gráfico
      const mapChartData = {
        title: { text: 'Produção por Estado', left: 'center' },
        geo: {
          map: 'BR',
          roam: true, // Permite navegar pelo mapa
          itemStyle: {
            areaColor: '#ddd', // Cor de fundo das áreas
            borderColor: '#fff', // Cor da borda dos estados
            borderWidth: 1, // Largura da borda dos estados
          },
        },
        visualMap: {
          left: 'right',
          min: 0,
          max: 500,
          inRange: {
            color: [
              '#026734',
              '#4F9572',
              '#6EA88A',
              '#90BCA6',
              '#B6D3C4',
              '#D2FADC',
              '#AEF5C0',
              '#8EF1A7',
              '#67ED89',
              '#8EF1A7',
              '#50EA77'
            ]
          },
          text: ['aaa', 'Low'],
          calculable: true,
          itemHeight: 300, // Aumenta a altura da barra
          width: 20,   // Ajusta a largura da barra
        },
        series: [
          {
            name: 'População por Estado',
            type: 'map',
            geoIndex: 0,
            data: populationData.map(item => ({
              ...item,
              itemStyle: {
                areaColor: getColor(item.value), // Aplica a cor com base no valor
              },
            })),
          },
        ],
      };

      // Configurar e renderizar o gráfico
      chart.setOption(mapChartData);

      // Limpeza quando o componente for desmontado
      return () => {
        chart.dispose();
      };
    }
  }, [geoJsonData]);

  return <div ref={chartRef} style={{ width: '100%', height: '800px'}} />;
};

export default BrazilMapChart;
