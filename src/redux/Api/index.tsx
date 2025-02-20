import axios, { AxiosRequestConfig } from 'axios';

interface ApiRequest {
  endpoint: string; // Only endpoint, base URL is added automatically
  method?: 'GET' | 'POST';
  data?: any; // Supports JSON & FormData
  headers?: Record<string, string>;
  token?: string; // Optional Auth Token (per request)
}

export const base_url = 'https://mrbikedoctors.com/api';

export const callMultipleApis = async (requests: ApiRequest[]) => {
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

    return responses.map((res) => res.data);
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};



