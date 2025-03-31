import React from 'react';
import './styles/TableComponent.css';

export interface Column {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'actions';
}

interface TableProps {
  schema: Column[];
  data: Record<string, any>[];
  onRowSelect?: (row: Record<string, any>) => void;
  onEdit?: (row: Record<string, any>) => void;
}

const TableComponent: React.FC<TableProps> = ({
  schema,
  data,
  onRowSelect,
  onEdit,
}) => {
  return (
    <div className="table-container">
      <table className="custom-table">
        <thead>
          <tr>
            {schema.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, index) => (
              <tr key={index} onClick={() => onRowSelect?.(row)}>
                {schema.map((col) => (
                  <td key={col.key}>
                    {col.key === 'actions' ? (
                      onEdit ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(row);
                          }}
                        >
                          Editar
                        </button>
                      ) : null
                    ) : (
                      row[col.key]
                    )}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={schema.length} className="empty-message">
                Nenhum dado disponível
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TableComponent;
