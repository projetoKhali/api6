import * as echarts from 'echarts';

export interface BaseChartSchema extends echarts.EChartsOption {
  title?: {
    text: string;
    left?: "center"
  };
  tooltip?: {
    trigger: 'axis' | 'item';
  };
  legend?: {
    data: string[];
    top?: '90%';
    left?: 'center';
    height?: string;
  };
  toolbox?: {
    feature?: {
      saveAsImage?: object;
    };
  };
}

export interface LineChartSchema extends BaseChartSchema {
  xAxis: {
    type: 'category' | 'time';
    boundaryGap?: boolean;
    data: string[];
  };
  yAxis: {
    type: 'value';
  };
  grid: {
    left: string,  // Reduz a margem esquerda
    right: string, // Reduz a margem direita para ocupar mais espaço
    top: string,
    bottom: string,
    containLabel: true, // Garante que os labels não saiam do gráfico
  },
  series: Array<{
    name: string;
    type: 'line';
    stack?: string;
    data: number[];
    itemStyle?: {
      color: string;
    };
  }>;
}

export interface StackedBarChartSchema extends BaseChartSchema {
  xAxis: {
    type: 'category';
    data: string[];
  };
  yAxis: {
    type: 'value';
  };
  grid: {
    left: string,  // Reduz a margem esquerda
    right: string, // Reduz a margem direita para ocupar mais espaço
    top: string,
    bottom: string,
    containLabel: true, // Garante que os labels não saiam do gráfico
  },
  series: Array<{
    name: string;
    type: 'bar' | 'line';
    stack?: 'Total';
    emphasis?: {
      focus: 'series';
    };
    data: number[];
    itemStyle?: {
      color: string;
    };
  }>;
}

export interface PieChartSchema extends BaseChartSchema {
  series: Array<{
    name: string;
    type: 'pie';
    radius: string[];
    center?: string[];
    data: Array<{ value: number; name: string, itemStyle?: {
      color: string;
    }; }>;
    avoidLabelOverlap?: false,
      itemStyle?: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label?: {
        show: false,
        position: 'center'
      },
      emphasis?: {
        label: {
          show: true,
          fontSize: 40,
          fontWeight: 'bold'
        }
      },
      labelLine?: {
        show: false
      },
  }>;
}

// Corrigido para MapChartSchema com MapSeriesOption
export interface MapChartSchema extends BaseChartSchema {
    geo: {
      map: 'BR';
      roam?: boolean;
    };
    series: Array<echarts.SeriesOption & {
      type: 'map';
      geoIndex: number;
      map: 'BR'; // Adicionando corretamente o campo 'map' aqui
      data: Array<{ name: string; value: number }>;
      itemStyle?: {
        color: string;
      };
    }>;
  }