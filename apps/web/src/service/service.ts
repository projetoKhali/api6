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
  body?: R
): Promise<T> => {
  const response = await axios.request<T>({
    url: `${API_BASE_URL}${path}`,
    method,
    headers: headers.headers,
    ...(body && { data: body }),
  });

  return response.data;
};

export const processGET = async <Response>(path: string): Promise<Response> =>
  await processRequest('GET', path);

export const processPOST = async <Body, Response>(
  path: string,
  body: Body
): Promise<Response> => await processRequest('POST', path, body);

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
