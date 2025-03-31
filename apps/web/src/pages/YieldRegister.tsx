import { useEffect, useState } from 'react';
import DynamicForm from '../components/FormsComponent';
import TableComponent from '../components/TableComponent';
import { schema, tableSchema, initialValues } from '../schemas/FormsSchema';
import { getAllYields, createYield } from '../service/YieldService';
import { Yield, Season } from '../schemas/yield';
import './styles/EventsRegister.css';

function YieldRegister() {
  const [data, setData] = useState<Yield[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const allYields = await getAllYields();

      setData(allYields);
    };

    fetchData();
  }, []);

  async function handleFormSubmit(formData: Record<string, string>) {
    const transformedData: Omit<Yield, 'id'> = {
      crop: formData.crop,
      crop_year: formData.crop_year,
      season: formData.season as Season,
      state: formData.state,
      area: Number(formData.area),
      production: Number(formData.production),
      annual_rainfall: Number(formData.annual_rainfall),
      fertilizer: Number(formData.fertilizer),
      pesticide: Number(formData.pesticide),
      yield_: Number(formData.yield_),
    };

    const newData: Yield = await createYield(transformedData);
    setData((prevData) => [...prevData, newData]);
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
