import React, { useState } from "react";
import { FieldSchema } from "../schemas/FormsSchema";
import "./styles/FormsComponent.css";

interface DynamicFormProps {
    schema: FieldSchema[];
    initialValues: Record<string, string>;
    onSubmit: (data: Record<string, string>) => void;
}

function DynamicForm({ schema, initialValues, onSubmit }: DynamicFormProps) {
    const [formData, setFormData] = useState<Record<string, string>>(initialValues);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        onSubmit(formData);
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Cadastro de colheita</h2>
            {schema.map((field) => (
                <div key={field.name}>
                    <label>{field.label}</label>
                    <input
                        type={field.type}
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                    />
                </div>
            ))}
            <button type="submit">Cadastrar</button>
        </form>
    );
}

export default DynamicForm;
