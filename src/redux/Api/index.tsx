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
    const apiCalls = requests.map((req) => {
      const isFormData = req.data instanceof FormData;

      const config: AxiosRequestConfig = {
        method: req.method || 'GET',
        url: `${base_url}${req.endpoint}`, // Automatically prepend base URL
        data: req.method === 'POST' ? req.data : undefined,
        headers: {
          'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
          ...(req.token ? { Authorization: `Bearer ${req.token}` } : {}), // Add token if provided
          ...req.headers, // Merge additional headers
        },
      };

      return axios(config);
    });

    const responses = await Promise.all(apiCalls);
    return responses.map((res) => res.data); // Return API response data
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};


