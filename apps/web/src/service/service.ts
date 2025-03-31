import axios from 'axios';

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
  body: R
): Promise<T> => {
  const response = await axios.request<T>({
    url: `${API_BASE_URL}${path}`,
    method,
    data: body,
    headers: headers.headers,
  });

  return response.data;
};

export const processGET = async <T>(path: string): Promise<T> =>
  await processRequest('GET', path, {});

export const processPOST = async <R, T>(path: string, body: R): Promise<T> =>
  await processRequest('POST', path, body);
