export type PageRequest = {
  page: number;
  size: number;
};

export type Page<T> = {
  items: T[];
  total: number;
  totalPages: number;
  size: number;
};

export const emptyPage = <T>(): Page<T> => ({
  items: [],
  total: 0,
  totalPages: 1,
  size: 0,
});
