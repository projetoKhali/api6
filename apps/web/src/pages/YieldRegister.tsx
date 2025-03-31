import { useEffect, useState } from 'react';
import DynamicForm from '../components/FormsComponent';
import TableComponent from '../components/TableComponent';
import { schema, tableSchema, initialValues } from '../schemas/FormsSchema';
import { getAllYields, createYield } from '../service/YieldService';
import './styles/EventsRegister.css';

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
    const fetchData = async () => {
      const allYields = await getAllYields();

      setData(allYields);
    };

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

      const newData: Yield = await createYield(transformedData);
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
