import { useEffect, useState } from 'react';
import DynamicForm from '../components/FormsComponent';
import TableComponent from '../components/TableComponent';
import { schema, tableSchema, initialValues } from '../schemas/FormsSchema';
import { getYields, createYield } from '../service/YieldService';
import { Yield, Season } from '../schemas/yield';
import './styles/EventsRegister.css';
import { Pagination } from '../components/Pagination';

const PAGE_SIZE = 20;

function YieldRegister() {
  const [data, setData] = useState<Yield[]>([]);

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchPage = async (newPage: number) => {
    setPage(newPage);

    const yieldsPage = await getYields(page, PAGE_SIZE);

    setTotalPages(yieldsPage.totalPages);
    setData(yieldsPage.items);
  };

  useEffect(() => {
    fetchPage(page);
  }, [page]);

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
    <div className="container"style={{ width: '100%' }}>
      <div className="form-container">
        <DynamicForm
          schema={schema}
          initialValues={initialValues}
          onSubmit={handleFormSubmit}
        />
      </div>
      <div className="separator"></div>
      <div className="table-container" style={{ width: '100%' }}>
        <TableComponent
          style={{ width: '100%' }}
          schema={tableSchema}
          data={data}
        />
        <Pagination
          getPage={() => page}
          setPage={(newPage) => setPage(newPage)}
          getTotalPages={() => totalPages}
          onPageChange={async (newPage) => fetchPage(newPage)}
        />
      </div>
    </div>
  );
}

export default YieldRegister;
