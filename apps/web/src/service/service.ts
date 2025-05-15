import axios from 'axios';
import { Page, PageRequest, emptyPage } from '../schemas/pagination';
import { getTokenFromLocalStorage } from '../store/storage';

export const API_BASE_URL = 'http://127.0.0.1:5000';
export const AUTH_BASE_URL = 'http://127.0.0.1:3000';
export const API_PREDICTION_URL = 'http://127.0.0.1:9000';

const headers = {
  headers: {
    'Content-Type': 'application/json',
  },
};

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

type RequestParamsBase = {
  path: string;
  overrideURL?: string;
};

type WithBody<T> = {
  body: T;
};

type WithPaginationBody<T> = {
  body: PageRequest & T;
};

type RequestParams<T> = RequestParamsBase & Partial<WithBody<T>>;
type GetParams = RequestParamsBase;
type PostParams<T> = RequestParamsBase & WithBody<T>;

type PaginatedGetParams = RequestParamsBase & PageRequest;
type PaginatedRequestParams<T> = RequestParamsBase & WithPaginationBody<T>;

export const processRequest = async <R, T>(
  method: Method,
  params?: RequestParams<R>
): Promise<T> => {
  const { path, body, overrideURL } = params || {};
  const token = getTokenFromLocalStorage();

  const response = await axios.request<T>({
    url: `${overrideURL || API_BASE_URL}${path}`,
    method,
    headers: {
      ...headers.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body && { data: body }),
  });

  return response.data;
};

export const processGET = async <Response>(
  params: GetParams
): Promise<Response> => await processRequest('GET', params);

export const processPOST = async <R, T>(params: PostParams<R>): Promise<T> =>
  await processRequest('POST', params);

export const processPaginatedRequest = async <R, T>(
  params: PaginatedRequestParams<R>
): Promise<Page<T>> => (await processRequest('POST', params)) || emptyPage();

export const processPaginatedGET = async <Response>(
  params: PaginatedGetParams
): Promise<Page<Response>> =>
  await processPaginatedRequest({
    path: params.path,
    body: {
      page: params.page,
      size: params.size,
    },
  });
