import { useState, useEffect } from 'react';
import Select from 'react-select';
import '../styles.css';
import {
  fetchYieldData,
  FilterParams,
  getFilterData,
} from '../service/DashboardService';
import { AgriculturalData, filterListSchema } from '../schemas/DashboardSchema';
import TableComponent, { Column } from '../components/TableComponent';
import {
  PredictCustomRequest,
  PredictCustomResponseItem,
} from '../schemas/ProjectionSchema';
import { fetchYielPredictiondData } from '../service/ProjectionService';

// Tipo para os dados formatados
interface FormattedPredictionItem extends PredictCustomResponseItem {
  formatted: {
    Area: string;
    Predicted_Production: string;
    Annual_Rainfall: string;
    Predicted_Fertilizer: string;
    Predicted_Pesticide: string;
  };
}

function ProjectionPage() {
  const [filtersData, setFiltersData] = useState<filterListSchema | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<FilterParams>({});
  const [data, setData] = useState<AgriculturalData[]>([]);
  const [predictionData, setPredictionData] = useState<
    PredictCustomResponseItem[]
  >([]);

  // Função para formatar números grandes
  const formatLargeNumber = (value: number, decimals = 2): string => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(decimals)}B`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(decimals)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(decimals)}K`;
    }
    return value.toFixed(decimals);
  };

  // Função para formatar os dados mantendo os originais
  const formatPredictionData = (data: PredictCustomResponseItem[]) => {
    return data.map((item) => ({
      ...item,
      // Mantemos os valores originais
      Area: item.Area,
      Predicted_Production: item.Predicted_Production,
      Annual_Rainfall: item.Annual_Rainfall,
      Predicted_Fertilizer: item.Predicted_Fertilizer,
      Predicted_Pesticide: item.Predicted_Pesticide,
      // Adicionamos cópias formatadas com prefixo
      formatted_Area: formatLargeNumber(item.Area, 1),
      formatted_Production: formatLargeNumber(item.Predicted_Production),
      formatted_Rainfall: formatLargeNumber(item.Annual_Rainfall),
      formatted_Fertilizer: formatLargeNumber(item.Predicted_Fertilizer),
      formatted_Pesticide: formatLargeNumber(item.Predicted_Pesticide),
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      // Remove chaves com valores vazios ou indefinidos
      const cleanedFilters = Object.fromEntries(
        Object.entries(selectedFilters).filter(
          ([_, value]) =>
            value !== undefined &&
            value !== '' &&
            !(Array.isArray(value) && value.length === 0)
        )
      );

      const prediction = await fetchYielPredictiondData(cleanedFilters);
      const formattedData = formatPredictionData(prediction);
      setPredictionData(formattedData);
    };

    fetchData();
  }, [selectedFilters]);

  useEffect(() => {
    getFilterData()
      .then((data) => setFiltersData(data))
      .catch((error) => console.error('Erro ao buscar filtros:', error));
  }, []);

  const tableSchema: Column[] = [
    { key: 'Crop', label: 'Espécie', type: 'text' },
    { key: 'Year', label: 'Ano', type: 'number' },
    { key: 'Season', label: 'Estação', type: 'text' },
    { key: 'State', label: 'Estado', type: 'text' },
    { key: 'formatted_Area', label: 'Area total', type: 'text' },
    { key: 'formatted_Production', label: 'Produção', type: 'text' },
    { key: 'formatted_Rainfall', label: 'Chuva Anual', type: 'text' },
    { key: 'formatted_Fertilizer', label: 'Fertilizante', type: 'text' },
    { key: 'formatted_Pesticide', label: 'Pesticida', type: 'text' },
  ];

  function handleRowSelect(row: Record<string, any>) {
    console.log('Linha selecionada:', row);
  }

  const handleFilterChange = (filterName: keyof FilterParams, value: any) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterName]: value && value.length > 0 ? value : undefined,
    }));
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minHeight: '100vh',
        gap: '12px',
        paddingBottom: '30px',
      }}
    >
      {/* Filtros */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          height: '12%',
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
              styles={{
                container: (base) => ({
                  ...base,
                  width: '31%',
                }),
              }}
              options={
                filtersData?.seasons.map((season) => ({
                  value: season,
                  label: season,
                })) || []
              }
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
              styles={{
                container: (base) => ({
                  ...base,
                  width: '31%',
                }),
              }}
              options={
                filtersData?.crops.map((crop) => ({
                  value: crop,
                  label: crop,
                })) || []
              }
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
              styles={{
                container: (base) => ({
                  ...base,
                  width: '31%',
                }),
              }}
              options={
                filtersData?.states.map((state) => ({
                  value: state,
                  label: state,
                })) || []
              }
              isMulti
              onChange={(selected) =>
                handleFilterChange(
                  'state',
                  selected?.map((item) => item.value)
                )
              }
              placeholder="Selecione os estados..."
            />
          </>
        )}
      </div>

      {/* Tabela */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          maxHeight: '500px',
        }}
      >
        <TableComponent
          schema={tableSchema}
          data={predictionData}
          onRowSelect={handleRowSelect}
        />
      </div>
    </div>
  );
}

export default ProjectionPage;
