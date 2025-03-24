import React, { useState } from 'react';
import { LineChartSchema, StackedBarChartSchema, PieChartSchema, MapChartSchema } from '../schemas/chartSchema';
import GenericChart from '../components/GenericChart';
import BrazilMapChart from '../components/BrazilMapChart';
import Select, { MultiValue } from "react-select";
import '../styles.css';

// Dados para o gráfico de linha
const lineChartData: LineChartSchema = {
  title: { text: 'Volume produzido por estação do ano', left: "center" },
  tooltip: { trigger: 'axis' },
  legend: { data: ['Kg', 'Unidades', 'Metros'] , top: '90%', left: 'center'},
  xAxis: { type: 'category', data: ['13/01', '14/01', '15/01', '16/01', '17/01', '18/01', '19/01'] },
  yAxis: { type: 'value' },
  series: [
    { name: 'Kg', type: 'line', data: [34, 24, 66, 345, 34, 289, 270], itemStyle: {
      color: '#026734',
    } },
    { name: 'Unidades', type: 'line', data: [120, 132, 101, 134, 90, 230, 210], itemStyle: {
      color: '#8FFD24'
    }},
    { name: 'Metros', type: 'line', data: [220, 182, 191, 234, 290, 330, 310], itemStyle:{
      color: '#50EA77'
    }},
  ],
  grid: {
    left: "1%",  // Reduz a margem esquerda
    right: "1%", // Reduz a margem direita para ocupar mais espaço
    top: "15%",
    bottom: "10%",
    containLabel: true, // Garante que os labels não saiam do gráfico
  },
};

// Dados para o gráfico de barras empilhadas
const stackedBarChartData: StackedBarChartSchema = {
  title: { text: 'Gráfico de Barras Empilhadas', left: "center"},
  tooltip: { trigger: 'axis' },
  legend: { data: ['Em cultivo', 'Perdido', 'Colhido'], top: '90%', left: 'center' },
  xAxis: { type: 'category', data: ['Manga', 'Dacueba', 'bom', 'ciriguela', 'zeruela'] },
  yAxis: { type: 'value'},
  grid: {
    left: "1%",  // Reduz a margem esquerda
    right: "1%", // Reduz a margem direita para ocupar mais espaço
    top: "15%",
    bottom: "10%",
    containLabel: true, // Garante que os labels não saiam do gráfico
  },
  series: [
    { name: 'Perdido', type: 'bar', stack: 'Total', data: [0.5, 1.7, 1.6, 2.9, 1.7], itemStyle: {
      color: '#8FFD24',
    }},
  ],
};

// Dados para o gráfico de pizza
const pieChartData: PieChartSchema = {
  title: { text: 'Gráfico de Pizza', left: "center" },
  tooltip: { trigger: 'item' },
  legend: { data: ['Produto A', 'Produto B', 'Produto C'], top: '90%', left: 'center'  },
  series: [
    {
      name: 'Produtos',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '50%'],
      data: [
        { value: 1048, name: 'Produto A', itemStyle: {
          color: '#8FFD24',
        } },
        { value: 735, name: 'Produto B',itemStyle: {
          color: '#000000',
         }},
        { value: 580, name: 'Produto C', itemStyle:{
          color: '#026734',
        } },
      ],
    },
  ],
};

const options = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "angular", label: "Angular" },
  { value: "svelte", label: "Svelte" },
];


function App (){

  const [selectedOptions, setSelectedOptions] = useState<{ value: string; label: string }[]>([]);

  const handleChange = (newValue: MultiValue<{ value: string; label: string }>) => {
    setSelectedOptions(newValue as { value: string; label: string }[]);
  };
  
  return (
    <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            minHeight: '100vh',
            gap: '12px',
        }}>
           <div style={{
            display: 'flex',
            flexDirection: 'row',
            height: '12%',
            padding: '10px',
            backgroundColor: '#f0f0f0',
            gap: '10px',
            justifyContent: 'space-evenly',
            flexWrap: 'wrap',

            }}>
            <Select
              options={options}
              isMulti
              value={selectedOptions}
              onChange={handleChange}
              placeholder="Selecione as opções..."
              classNamePrefix="custom-select"
            />
            <Select
              options={options}
              isMulti
              value={selectedOptions}
              onChange={handleChange}
              placeholder="Selecione as opções..."
            />
            <Select
              options={options}
              isMulti
              value={selectedOptions}
              onChange={handleChange}
              placeholder="Selecione as opções..."
            />
            <Select
              options={options}
              isMulti
              value={selectedOptions}
              onChange={handleChange}
              placeholder="Selecione as opções..."
            />
          </div>
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            height: '12%',
            padding: '10px',
            gap:'10px',
            backgroundColor: '#f0f0f0',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            flexWrap: 'wrap',
            borderRadius: '10px',
            boxShadow: '0px 4px 0px rgba(0, 0, 0, 0.1)',
        }}>
            <div className="card-dashboard">
                <p className='title-card-dash'>Eficiência da produção</p>
                <p className='value-card-dash'> 7</p>
            </div>
            <div className="card-dashboard">
                <p className='title-card-dash'>Área Total cultivada</p>
                <p className='value-card-dash'> 7</p>
            </div>
            <div className="card-dashboard">
                <p className='title-card-dash'>Quantidade de produção</p>
                <p className='value-card-dash'> 7</p>
            </div>
            <div className="card-dashboard">
                <p className='title-card-dash'>Total de Especies</p>
                <p className='value-card-dash'> 7</p>
            </div>
            <div className="card-dashboard">
                <p className='title-card-dash'>Total de Estados</p>
                <p className='value-card-dash'> 7</p>
            </div>

        </div>
      <div style={{ 
            height: '300px',
            backgroundColor: '#f0f0f0',
            borderRadius: '10px',
            boxShadow: '0px 4px 0px rgba(0, 0, 0, 0.1)',
            padding: '10px',
          }}>
        <GenericChart option={lineChartData} />
      </div>
      <div style={{
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
      }}>
        <div style={{ height: '300px', width: '45%' }}>
          <GenericChart option={stackedBarChartData} />
        </div>
        <div style={{ height: '300px', width: '45%' }}>
          <GenericChart option={stackedBarChartData} />
        </div>
      </div>
      <div style={{
        backgroundColor: '#f0f0f0',
        height: '100%',
        minHeight: '240px',
        display: 'flex',
        flexDirection: 'row',
        padding: '20px',
        gap: '20px',
        justifyContent: 'space-evenly',

      }}>
        <div style={{ height: '200px', width: '30%' }}>
        <GenericChart option={pieChartData} />
      </div>
      <div style={{ height: '200px', width: '30%' }}>
        <GenericChart option={pieChartData} />
      </div>
      <div style={{ height: '200px', width: '30%' }}>
        <GenericChart option={pieChartData} />
      </div>
      </div>
      <div style={{height: '300px', width: '1000px' }}>
        <BrazilMapChart />
    </div>
    </div>
  );
}

export default App;
