import axios from 'axios';
import { getLocalStorageData } from '../storage';

export const AUTH_BASE_URL = 'http://127.0.0.1:3000';

const headers = {
  headers: {
    'Content-Type': 'application/json',
  },
};

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

type RequestParamsBase = {
  path: string;
  tokenOverride?: string;
};

type WithBody<T> = {
  body: T;
};

type RequestParams<T> = RequestParamsBase & Partial<WithBody<T>>;
type GetParams = RequestParamsBase;
type PostParams<T> = RequestParamsBase & WithBody<T>;

export const processRequest = async <R, T>(
  method: Method,
  params?: RequestParams<R>
): Promise<T> => {
  const { path, body, tokenOverride } = params || {};
  const token = getLocalStorageData()?.token || tokenOverride;

  const response = await axios.request<T>({
    url: `${AUTH_BASE_URL}${path}`,
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
