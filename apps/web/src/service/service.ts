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

export const processRequest = async <R, T>(
  method: Method,
  path: string,
  body?: R,
  overrideURL?: string
): Promise<T> => {
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

export const processGET = async <Response>(path: string): Promise<Response> =>
  await processRequest('GET', path, undefined);

export const processPOST = async <Body, Response>(
  path: string,
  body: Body,
  overrideURL?: string
): Promise<Response> => await processRequest('POST', path, body, overrideURL);

export const processPaginatedRequest = async <Body, Response>(
  path: string,
  body: PageRequest & Body
): Promise<Page<Response>> =>
  (await processRequest('POST', path, body)) || emptyPage();

export const processPaginatedGET = async <Response>(
  path: string,
  page: number,
  size: number
): Promise<Page<Response>> =>
  await processPaginatedRequest(path, { page, size });
