import { useEffect, useState } from 'react';
import TableComponent from '../components/TableComponent';
import { tableSchema } from '../schemas/FormsSchema';
import { reportYields } from '../service/YieldService';
import { Yield } from '../schemas/yield';
import './styles/EventsRegister.css';
import { Pagination } from '../components/Pagination';
import Select from 'react-select';
import { FilterParams, getFilterData } from '../service/DashboardService';
import { filterListSchema } from '../schemas/DashboardSchema';

import Loading from '../components/Loading';

const PAGE_SIZE = 20;

function ReportPage() {
  const [data, setData] = useState<Yield[]>([]);
  const [filtersData, setFiltersData] = useState<filterListSchema | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<FilterParams>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchPage = async (newPage: number) => {
    setPage(newPage);

    const cleanedFilters = Object.fromEntries(
      Object.entries(selectedFilters).filter(
        ([_, value]) =>
          value !== undefined &&
          value !== '' &&
          !(Array.isArray(value) && value.length === 0)
      )
    );

    const yieldsPage = await reportYields(
      newPage,
      PAGE_SIZE,
      cleanedFilters.crop_year,
      cleanedFilters.season,
      cleanedFilters.crop,
      cleanedFilters.state
    );

    setTotalPages(yieldsPage.totalPages);
    setData(yieldsPage.items);
  };

  useEffect(() => {
    getFilterData()
      .then((data) => setFiltersData(data))
      .catch((error) => console.error('Erro ao buscar filtros:', error));
  }, []);

  useEffect(() => {
    fetchPage(1); // Sempre começa da página 1 ao alterar os filtros
  }, [selectedFilters]);

  const handleFilterChange = (filterName: keyof FilterParams, value: any) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterName]: value && value.length > 0 ? value : undefined,
    }));
  };

  const exportToCSV = async () => {
    setIsLoading(true);
    const cleanedFilters = Object.fromEntries(
      Object.entries(selectedFilters).filter(
        ([_, value]) =>
          value !== undefined &&
          value !== '' &&
          !(Array.isArray(value) && value.length === 0)
      )
    );

    let allData: Yield[] = [];
    let currentPage = 1;
    let totalPageCount = 1;

    do {
      const pageData = await reportYields(
        currentPage,
        100,
        cleanedFilters.crop_year,
        cleanedFilters.season,
        cleanedFilters.crop,
        cleanedFilters.state
      );

      allData = allData.concat(pageData.items);
      totalPageCount = pageData.totalPages;
      currentPage++;
    } while (currentPage <= totalPageCount);

    if (allData.length === 0) {
      alert('Nenhum dado para exportar.');
      return;
    }

    const headers = Object.keys(allData[0]);
    const csvRows = [
      headers.join(','), // header
      ...allData.map((row) =>
        headers
          .map((field) => JSON.stringify((row as any)[field] ?? ''))
          .join(',')
      ),
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'relatorio_producao.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsLoading(false);
  };

  return (
    <div
      className="container"
      style={{ width: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          height: '12%',
          width: '100%',
          padding: '10px',
          backgroundColor: '#f0f0f0',
          gap: '10px',
          justifyContent: 'space-evenly',
          flexWrap: 'wrap',
        }}
      >
        {filtersData && (
          <>
            <Select
              styles={{ container: (base) => ({ ...base, width: '23%' }) }}
              options={filtersData.seasons.map((season) => ({
                value: season,
                label: season,
              }))}
              isMulti
              onChange={(selected) =>
                handleFilterChange(
                  'season',
                  selected?.map((item) => item.value)
                )
              }
              placeholder="Selecione as estações..."
            />

            <Select
              styles={{ container: (base) => ({ ...base, width: '23%' }) }}
              options={filtersData.crops.map((crop) => ({
                value: crop,
                label: crop,
              }))}
              isMulti
              onChange={(selected) =>
                handleFilterChange(
                  'crop',
                  selected?.map((item) => item.value)
                )
              }
              placeholder="Selecione as culturas..."
            />

            <Select
              styles={{ container: (base) => ({ ...base, width: '23%' }) }}
              options={filtersData.states.map((state) => ({
                value: state,
                label: state,
              }))}
              isMulti
              onChange={(selected) =>
                handleFilterChange(
                  'state',
                  selected?.map((item) => item.value)
                )
              }
              placeholder="Selecione os estados..."
            />

            <Select
              styles={{ container: (base) => ({ ...base, width: '23%' }) }}
              options={filtersData.crop_years.map((year) => ({
                value: year,
                label: year,
              }))}
              isMulti
              onChange={(selected) =>
                handleFilterChange(
                  'crop_year',
                  selected?.map((item) => item.value)
                )
              }
              placeholder="Selecione os anos..."
            />
          </>
        )}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {isLoading ? (
          <Loading />
        ) : (
          <button
            onClick={exportToCSV}
            style={{
              margin: '10px auto',
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              alignSelf: 'center',
            }}
          >
            Extrair Relatório
          </button>
        )}
      </div>
      {/* Tabela + Paginação */}
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
          onPageChange={fetchPage}
          style={{ marginTop: '30px', gap: '10px' }}
        />
      </div>
    </div>
  );
}

export default ReportPage;
