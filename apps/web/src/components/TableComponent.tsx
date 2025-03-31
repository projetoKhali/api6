import { CSSProperties } from 'react';
import './styles/TableComponent.css';

export interface Column {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'actions';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

interface TableProps {
  schema: Column[];
  data: Row[];
  onRowSelect?: (row: Row) => void;
  onEdit?: (row: Row) => void;
  style?: CSSProperties;
}

const TableComponent = ({
  schema,
  data,
  onRowSelect,
  onEdit,
  style,
}: TableProps) => {
  return (
    <div className="table-container" style={style}>
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
