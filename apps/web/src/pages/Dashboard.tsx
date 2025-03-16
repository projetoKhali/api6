import React from 'react';
import { LineChartSchema, StackedBarChartSchema, PieChartSchema, MapChartSchema } from '../schemas/chartSchema';
import GenericChart from '../components/GenericChart';
import BrazilMapChart from '../components/BrazilMapChart';

// Dados para o gráfico de linha
const lineChartData: LineChartSchema = {
  title: { text: 'Gráfico de Linhas' },
  tooltip: { trigger: 'axis' },
  legend: { data: ['Kg', 'Unidades', 'Metros'] , top: '90%', left: 'center'},
  xAxis: { type: 'category', data: ['13/01', '14/01', '15/01', '16/01', '17/01', '18/01', '19/01'] },
  yAxis: { type: 'value' },
  series: [
    { name: 'Kg', type: 'line', data: [34, 24, 66, 345, 34, 289, 270] },
    { name: 'Unidades', type: 'line', data: [120, 132, 101, 134, 90, 230, 210] },
    { name: 'Metros', type: 'line', data: [220, 182, 191, 234, 290, 330, 310] },
  ],
};

// Dados para o gráfico de barras empilhadas
const stackedBarChartData: StackedBarChartSchema = {
  title: { text: 'Gráfico de Barras Empilhadas' },
  tooltip: { trigger: 'axis' },
  legend: { data: ['Em cultivo', 'Perdido', 'Colhido'], top: '90%', left: 'center' },
  xAxis: { type: 'category', data: ['Manga', 'Dacueba', 'bom', 'ciriguela', 'zeruela'] },
  yAxis: { type: 'value' },
  series: [
    { name: 'Em cultivo', type: 'bar', stack: 'Total', data: [30, 80, 90, 30, 90] },
    { name: 'Perdido', type: 'bar', stack: 'Total', data: [10, 10, 8, 30, 1] },
    { name: 'Colhido', type: 'bar', stack: 'Total', data: [60, 10, 2, 30, 9] },
  ],
};

// Dados para o gráfico de pizza
const pieChartData: PieChartSchema = {
  title: { text: 'Gráfico de Pizza' },
  tooltip: { trigger: 'item' },
  legend: { data: ['Produto A', 'Produto B', 'Produto C'], top: '90%', left: 'center'  },
  series: [
    {
      name: 'Produtos',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '50%'],
      data: [
        { value: 1048, name: 'Produto A' },
        { value: 735, name: 'Produto B' },
        { value: 580, name: 'Produto C' },
      ],
    },
  ],
};

function App (){
  return (
    <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            width: '100vw' 
        }}>
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            height: '20%',
            width: '100%',
            backgroundColor: '#f0f0f0',
            justifyContent: 'space-evenly',
            alignItems: 'center'
        }}>
            <div style={{
                height: '90%',
                width: '16%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                backgroundColor: 'red',
                borderRadius: 10,
                fontFamily: 'monospace',
            }}> 
                <p style={{
                        fontSize: 14,
                        fontWeight: 'normal',
                        margin: 0,
                        height: '20%',
                    }}>Total de Especie</p>
                <p  style={{
                        display: 'flex',
                        fontSize: 30,
                        fontWeight: 'bold',
                        margin: 0,
                        height: '70%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center'
                    }}> 7</p>
            </div>

        </div>
      <div style={{ height: '50%', width: '30%' }}>
        <GenericChart option={lineChartData} />
      </div>

      <div style={{ height: '50%', width: '30%' }}>
        <GenericChart option={stackedBarChartData} />
      </div>

      <div style={{ height: '50%', width: '30%' }}>
        <GenericChart option={pieChartData} />
      </div>
      <div style={{display: 'flex', height: '50%', width: '60%' }}>
        <BrazilMapChart />
    </div>
    
    </div>
  );
}

export default App;
