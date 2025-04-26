import { useState, useEffect } from 'react';
import Select from 'react-select';
import '../styles.css';
import {
    fetchYieldData,
    FilterParams,
    getFilterData,
} from '../service/DashboardService';
import {
    AgriculturalData,
    filterListSchema,
} from '../schemas/DashboardSchema';
import TableComponent, { Column } from '../components/TableComponent';

function ProjectionPage() {
    const [filtersData, setFiltersData] = useState<filterListSchema | null>(null);
    const [selectedFilters, setSelectedFilters] = useState<FilterParams>({});
    const [data, setData] = useState<AgriculturalData[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchYieldData(selectedFilters);
                setData(data.data);
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
            }
        };

        fetchData();
    }, [selectedFilters]);

    useEffect(() => {
        getFilterData()
            .then((data) => setFiltersData(data))
            .catch((error) => console.error('Erro ao buscar filtros:', error));
    }, []);

    const tableSchema: Column[] = [
        { key: 'crop', label: 'Espécie', type: 'text' },
        { key: 'crop_year', label: 'Ano', type: 'number' },
        { key: 'season', label: 'Estação', type: 'text' },
        { key: 'state', label: 'Estado', type: 'text' },
        { key: 'area', label: 'Area total', type: 'text' },
        { key: 'production', label: 'Produção', type: 'number' },
        { key: 'annual_rainfall', label: 'Chuva Anual', type: 'number' },
        { key: 'fertilizer', label: 'Fertilizante', type: 'number' },
        { key: 'pesticide', label: 'Pesticida', type: 'number' },
        { key: 'yield', label: 'Rendimento', type: 'number' },
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
                            options={
                                filtersData?.crop_years.map((year) => ({
                                    value: year,
                                    label: year,
                                })) || []
                            }
                            isMulti
                            onChange={(selected) =>
                                handleFilterChange(
                                    'crop_year',
                                    selected?.map((item) => item.value)
                                )
                            }
                            placeholder="Selecione os anos..."
                        />

                        <Select
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
                    data={data}
                    onRowSelect={handleRowSelect}
                />
            </div>
        </div>
    );
}

export default ProjectionPage;