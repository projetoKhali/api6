import { useState } from 'react';
import './styles/Pagination.css';

type PaginationProps = {
  getPage: () => number;
  setPage: (page: number) => void;
  getTotalPages: () => number;
  onPageChange: (page: number) => void;
  style?: React.CSSProperties;
};

export const Pagination = ({
  getPage,
  setPage,
  getTotalPages,
  onPageChange,
  style,
}: PaginationProps) => {
  const [targetPage, setTargetPage] = useState<number>(getPage());

  const pageChange = (page: number) => {
    setPage(page);
    setTargetPage(page);
    onPageChange(page);
  };

  const conditions = {
    first: () => getPage() > 1,
    previous: () => getPage() > 1,
    target: () => !!targetPage && targetPage !== getPage(),
    next: () => getPage() < getTotalPages(),
    last: () => getPage() < getTotalPages(),
  };

  return (
    <div style={style} className="pagination">
      <button
        className={
          'pagination-button ' +
          (conditions.first() ? '' : 'pagination-button-disabled')
        }
        disabled={!conditions.first()}
        onClick={() => {
          if (getPage() > 1) pageChange(1);
        }}
      >
        {'first'}
      </button>
      <button
        className={
          'pagination-button ' +
          (conditions.previous() ? '' : 'pagination-button-disabled')
        }
        disabled={!conditions.previous()}
        onClick={() => {
          const page = getPage();
          if (page > 1) pageChange(page - 1);
        }}
      >
        {'previous'}
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
        <button
          className={
            'pagination-button ' +
            (conditions.target() ? '' : 'pagination-button-disabled')
          }
          disabled={!conditions.target()}
          onClick={() => {
            if (targetPage) {
              setPage(targetPage);
              onPageChange(targetPage);
            }
          }}
        >
          <span>Go</span>
        </button>
        {' / ' + getTotalPages()}
      </span>
      <button
        className={
          'pagination-button ' +
          (conditions.next() ? '' : 'pagination-button-disabled')
        }
        disabled={!conditions.next()}
        onClick={() => {
          const page = getPage();
          if (page < getTotalPages()) pageChange(page + 1);
        }}
      >
        {'next'}
      </button>
      <button
        className={
          'pagination-button ' +
          (conditions.last() ? '' : 'pagination-button-disabled')
        }
        disabled={!conditions.last()}
        onClick={() => {
          if (getPage() < getTotalPages()) pageChange(getTotalPages());
        }}
      >
        {'last'}
      </button>
    </div>
  );
};
