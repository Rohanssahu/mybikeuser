import axios, { AxiosRequestConfig } from 'axios';
import { PermissionsAndroid, Platform } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';

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



export const requestCameraPermissions = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      ]);

      return (
        granted['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED
      );
    } catch (error) {
      console.warn('Permission request error:', error);
      return false;
    }
  }
  return true; // iOS handles permissions automatically
};

export const captureImage = async () => {
  const hasPermissions = await requestCameraPermissions();
  if (!hasPermissions) {
    console.log('Camera permission denied');
    return null;
  }

  try {
    const image = await ImagePicker.openCamera({
      cameraType: 'front', // Opens the front camera only
      cropping: false, // You can enable cropping if needed
      compressImageQuality: 0.8, // Adjust image quality
    });
    return image; // Return the image object
  } catch (error) {
    console.log('Camera error:', error);
    return null;
  }
};
