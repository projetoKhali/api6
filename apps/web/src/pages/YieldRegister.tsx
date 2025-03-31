import React, { useEffect, useState } from 'react';
import DynamicForm from '../components/FormsComponent';
import TableComponent from '../components/TableComponent';
import { schema, tableSchema, initialValues } from '../schemas/FormsSchema';
import './styles/EventsRegister.css';
import { YieldService } from '../service/YieldService';

interface YieldData {
  id: string;
  plot: string;
  species: string;
  date: string;
  age: number;
  production: number;
}

function YieldRegister() {
  const [data, setData] = useState<YieldData[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const result: YieldData[] = await YieldService.getAll();
        setData(result);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    }
    fetchData();
  }, []);

  async function handleFormSubmit(formData: Record<string, string>) {
    try {
      const transformedData: Omit<YieldData, 'id'> = {
        plot: formData.plot,
        species: formData.species,
        date: formData.date,
        age: Number(formData.age),
        production: Number(formData.production),
      };
      const newData: YieldData = await YieldService.create(transformedData);
      setData((prevData) => [...prevData, newData]);
    } catch (error) {
      console.error('Erro ao adicionar registro:', error);
    }
  }

  return (
    <div className="container">
      <div className="form-container">
        <DynamicForm
          schema={schema}
          initialValues={initialValues}
          onSubmit={handleFormSubmit}
        />
      </div>
      <div className="separator"></div>
      <div className="table-container">
        <TableComponent schema={tableSchema} data={data} />
      </div>
    </div>
  );
}

export default YieldRegister;
