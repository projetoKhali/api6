export type PageRequest = {
  page: number;
  size: number;
};

export type Page<T> = {
  items: T[];
  totalItems: number;
  totalPages: number;
  size: number;
};

export const emptyPage = <T>(): Page<T> => ({
  items: [],
  totalItems: 0,
  totalPages: 1,
  size: 0,
});
