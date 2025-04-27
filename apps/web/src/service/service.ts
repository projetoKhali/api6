import axios from 'axios';
import { Page, PageRequest, emptyPage } from '../schemas/pagination';

export const API_BASE_URL = 'http://127.0.0.1:5000';

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
  token?: string,
): Promise<T> => {
  const authHeaders = {
    ...headers.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const response = await axios.request<T>({
    url: `${API_BASE_URL}${path}`,
    method,
    headers: authHeaders,
    ...(body && { data: body }),
  });

  return response.data;
};

export const processGET = async <Response>(path: string, token?: string): Promise<Response> =>
  await processRequest('GET', path, undefined, token);

export const processPOST = async <Body, Response>(
  path: string,
  body: Body,
  token?: string
): Promise<Response> => await processRequest('POST', path, body, token);

export const processPaginatedRequest = async <Body, Response>(
  path: string,
  body: PageRequest & Body,
  token?: string
): Promise<Page<Response>> =>
  (await processRequest('POST', path, body, token)) || emptyPage();

export const processPaginatedGET = async <Response>(
  path: string,
  page: number,
  size: number,
  token?: string
): Promise<Page<Response>> =>
  await processPaginatedRequest(path, { page, size }, token);
