import axios, { AxiosRequestConfig } from 'axios';

export interface ApiRequest {
  endpoint: string;
  method?: 'GET' | 'POST';
  data?: any;
  headers?: Record<string, string>;
  token?: string;
}

export const base_url = 'https://mrbikedoctors.com/api';

export const callMultipleApis = async (requests: ApiRequest[]) => {
  
  console.log('callMultipleApis called'); // Debugging purpose

  try {
    const responses = await Promise.all(
      requests.map((req) => {
        const config: AxiosRequestConfig = {
          method: req.method || 'GET',
          url: `${base_url}${req.endpoint}`,
          data: req.method === 'POST' ? req.data : undefined,
          headers: {
            'Content-Type': req.data instanceof FormData ? 'multipart/form-data' : 'application/json',
            ...(req.token ? { Authorization: `Bearer ${req.token}` } : {}),
            ...req.headers,
          },
        };
        return axios(config);
      })
    );

    return responses?.map((res) => res.data);
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
