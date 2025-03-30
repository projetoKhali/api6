import React from "react";
import DynamicForm from "../components/FormsComponent";
import TableComponent, { Column } from "../components/TableComponent";
import { initialValues, schema } from "../schemas/FormsSchema";
import "./styles/EventsRegister.css";


const tableSchema: Column[] = [
    { key: "plot", label: "Lote", type: "text" },
    { key: "species", label: "Espécie", type: "text" },
    { key: "date", label: "Data", type: "date" },
    { key: "age", label: "Idade", type: "number" },
];

const tableData = [
    { plot: "Lote 1", species: "Café", date: "2023-10-01", age: "10" },
    { plot: "Lote 2", species: "Cacau", date: "2023-10-02", age: "10" },
    { plot: "Lote 1", species: "Café", date: "2023-10-01", age: "10" },
    { plot: "Lote 1", species: "Café", date: "2023-10-01", age: "10" },
];

function EventsRegister() {
    function handleFormSubmit(data: Record<string, string>) {
        console.log("Dados enviados:", data);
    }

    function handleRowSelect(row: Record<string, any>) {
        console.log("Linha selecionada:", row);
    }

    return (
        <div className="container">
            <div className="form-container">
                <DynamicForm schema={schema} initialValues={initialValues} onSubmit={handleFormSubmit} />
            </div>

            <div className="separator"></div>

            <div className="table-container">
                <TableComponent schema={tableSchema} data={tableData} onRowSelect={handleRowSelect} />
            </div>
        </div>
    );
}

export default EventsRegister;