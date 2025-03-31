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

export const processPOST = async <Body, Response>(path: string, body: Body): Promise<Response> =>
  await processRequest('POST', path, body);
