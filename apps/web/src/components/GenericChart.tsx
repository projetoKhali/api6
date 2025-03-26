import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

export interface EchartProps {
  option: echarts.EChartsOption;
}

const GenericChart = ({ option }: EchartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartRef.current) {
      const chart = echarts.init(chartRef.current);

      chart.setOption(option);

      return () => {
        chart.dispose();
      };
    }
  }, [option]);

  return <div ref={chartRef} style={{ width: '100%', height: '100%' }} />;
};

export default GenericChart;
