import { useState } from 'react';
import { fetchCustomPrediction } from '../service/ProjectionCustomService';
import {
  CustomPredictionRequest,
  CustomPredictionResponse,
} from '../schemas/ProjectionCustomSchema';
import TableComponent, { Column } from '../components/TableComponent';

function ProjectionCustomPage() {
  const [formData, setFormData] = useState<CustomPredictionRequest>({
    state: undefined,
    crop: undefined,
    season: undefined,
    area: undefined,
    fertilizer: undefined,
    pesticide: undefined,
    annual_rainfall: undefined,
    year: undefined,
  });
  const tableSchema: Column[] = [
    { key: 'Crop', label: 'Cultura', type: 'text' },
    { key: 'Year', label: 'Ano', type: 'number' },
    { key: 'Season', label: 'Estação', type: 'text' },
    { key: 'State', label: 'Estado', type: 'text' },
    { key: 'formatted_Area', label: 'Área', type: 'text' },
    { key: 'formatted_Production', label: 'Produção Prevista', type: 'text' },
    { key: 'formatted_Rainfall', label: 'Chuva Anual', type: 'text' },
    {
      key: 'formatted_Fertilizer',
      label: 'Fertilizante Previsto',
      type: 'text',
    },
    { key: 'formatted_Pesticide', label: 'Pesticida Previsto', type: 'text' },
  ];

  const [prediction, setPrediction] = useState<
    CustomPredictionResponse[] | null
  >(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        isNaN(Number(value)) ||
        name === 'state' ||
        name === 'crop' ||
        name === 'season'
          ? value
          : Number(value),
    }));
  };

  const handlePredict = async () => {
    const result = await fetchCustomPrediction(formData);
    setPrediction(formatPredictionData(result));
    console.log('Predição recebida:', result);
  };

  const formatLargeNumber = (value: number, decimals = 2): string => {
    if (value >= 1_000_000_000)
      return `${(value / 1_000_000_000).toFixed(decimals)}B`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(decimals)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(decimals)}K`;
    return value.toFixed(decimals);
  };

  const formatPredictionData = (data: CustomPredictionResponse[]) =>
    data.map((item) => ({
      ...item,
      formatted_Area: formatLargeNumber(item.Area, 1),
      formatted_Production: formatLargeNumber(item.Predicted_Production),
      formatted_Rainfall: formatLargeNumber(item.Annual_Rainfall),
      formatted_Fertilizer: formatLargeNumber(item.Predicted_Fertilizer),
      formatted_Pesticide: formatLargeNumber(item.Predicted_Pesticide),
    }));

  return (
    <div style={{}}>
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          height: '20%',
          backgroundColor: 'red',
        }}
      ></div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0px',
          padding: '20px',
        }}
      >
        {[
          { label: 'Estado', name: 'state' },
          { label: 'Cultura', name: 'crop' },
          { label: 'Estação', name: 'season' },
          { label: 'Área', name: 'area' },
          { label: 'Fertilizante', name: 'fertilizer' },
          { label: 'Pesticida', name: 'pesticide' },
          { label: 'Chuva Anual', name: 'annual_rainfall' },
          { label: 'Ano', name: 'year' },
        ].map(({ label, name }) => (
          <div
            key={name}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px',
              borderRadius: '6px',
              width: '24%',
            }}
          >
            <label style={{ marginRight: '8px', width: '20%' }}>{label}:</label>
            <input
              type={
                ['state', 'crop', 'season'].includes(name) ? 'text' : 'number'
              }
              name={name}
              value={(formData as any)[name] ?? ''}
              onChange={handleInputChange}
              style={{
                padding: '5px',
                width: '80%',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontFamily: '',
              }}
            />
          </div>
        ))}
      </div>

      {/* Botão de envio */}
      <button onClick={handlePredict} style={{ padding: '10px 20px' }}>
        Obter Previsão
      </button>

      {/* Exibição do resultado */}
      {prediction && (
        <div style={{ marginTop: '20px' }}>
          <h3>Resultado:</h3>
          <TableComponent
            schema={tableSchema}
            data={prediction}
            onRowSelect={(row) => console.log('Linha:', row)}
          />
        </div>
      )}
    </div>
  );
}

export default ProjectionCustomPage;
