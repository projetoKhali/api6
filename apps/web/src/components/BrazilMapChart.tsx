import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';


export interface EchartProps {
  option: echarts.EChartsOption;
}

const BrazilMapChart = ({ option }: EchartProps) => {
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

      // Configurar e renderizar o gráfico
      chart.setOption(option);

      // Limpeza quando o componente for desmontado
      return () => {
        chart.dispose();
      };
    }
  }, [geoJsonData, option]);

  return <div ref={chartRef} style={{ width: '100%', height: '800px', background: 'white', paddingTop: '10px', borderRadius: '10px'}} />;
};

export default BrazilMapChart;
