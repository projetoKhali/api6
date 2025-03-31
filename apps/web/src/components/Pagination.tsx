import { useState } from 'react';
import './styles/Pagination.css';

type PaginationProps = {
  getPage: () => number;
  setPage: (page: number) => void;
  getTotalPages: () => number;
  onPageChange: (page: number) => void;
};

export const Pagination = ({
  getPage,
  setPage,
  getTotalPages,
  onPageChange,
}: PaginationProps) => {
  const [targetPage, setTargetPage] = useState<number>(getPage());

  return (
    <div className="pagination">
      <button
        onClick={() => {
          const page = getPage();
          if (page > 1) {
            setPage(page - 1);
            setTargetPage(page - 1);
            onPageChange(page - 1);
          }
        }}
      >
        {'<'}
      </button>
      <span>
        <input
          className="pagination-input"
          type="number"
          style={{
            border: 'none',
            width: '2rem',
            height: '100%',
            textAlign: 'center',
          }}
          placeholder={getPage().toString()}
          value={!!targetPage && targetPage !== getPage() ? targetPage : ''}
          onChange={(e) => {
            const value = Number(e.target.value);
            setTargetPage(
              value >= 1 && value <= getTotalPages() ? value : getPage()
            );
          }}
        />
        {!!targetPage && targetPage !== getPage() && (
          <button
            onClick={() => {
              if (targetPage) {
                setPage(targetPage);
                onPageChange(targetPage);
              }
            }}
          >
            <span>Go</span>
          </button>
        )}
        {' / ' + getTotalPages()}
      </span>
      <button
        onClick={() => {
          const page = getPage();
          if (page < getTotalPages()) {
            setPage(page + 1);
            setTargetPage(page + 1);
            onPageChange(page + 1);
          }
        }}
      >
        {'>'}
      </button>
    </div>
  );
};
