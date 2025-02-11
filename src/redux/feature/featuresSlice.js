import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API, base_url } from '../Api';

import { Alert } from 'react-native';
import { errorToast, successToast } from '../../configs/customToast';
import ScreenNameEnum from '../../routes/screenName.enum';
const initialState = {
  isLoading: false,
  isError: false,
  isSuccess: false,
  bussinessData:[],
  bussinessDetails:[],
  dashboardData:[],
  Bussinesslist:[],
  nearByStore:[],
  saveBusinessData:[],
  
  


};







export const  send_message_help= createAsyncThunk(
  "send_message_help",
  async (params, thunkApi) => {


    
    try {
      const formData = new FormData();
      formData.append('message', params?.suggestion);
   

      const token = params?.token;

      const config = {
        method: 'POST',
        url: `${base_url.url}/common/ask_support`,
        data: formData, // Use `data` instead of `body`
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data', // Correct Content-Type for FormData
        },
      };

      const response = await API.request(config);

      if (response.data?.status == '1') {

        Alert.alert('Success','Thank you for your suggestion!');
      }
      else {
        successToast(response?.data?.message)
      }

      return response.data;
    } catch (error) {
      console.error('Error:', error);

      // Pass the error to the rejectWithValue for Redux Toolkit error handling
      return thunkApi.rejectWithValue(error.response?.data || 'Network error');
    }
  }
);
export const get_Bussiness_data= createAsyncThunk(
  "get_Bussiness_data",
  async (params, thunkApi) => {


    
    try {
      const token = params?.token;

      const config = {
        method: 'POST',
        url: `${base_url.url}/business/get_business`,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data', // Correct Content-Type for FormData
        },
      };

      const response = await API.request(config);



      
      if (response.data?.status == '1') {

        //Alert.alert('Success','Thank you for your suggestion!');
      }
      else {
        console.log
        (response?.data?.message)
      }

      return response.data.data;
    } catch (error) {
      console.error('Error:', error);

      // Pass the error to the rejectWithValue for Redux Toolkit error handling
      return thunkApi.rejectWithValue(error.response?.data || 'Network error');
    }
  }
);
export const get_save_Bussines= createAsyncThunk(
  "get_save_Bussines",
  async (params, thunkApi) => {


    
    try {
      const token = params?.token;

      const config = {
        method: 'POST',
        url: `${base_url.url}/business/get_business`,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data', // Correct Content-Type for FormData
        },
      };

      const response = await API.request(config);



      
      if (response.data?.status == '1') {

        //Alert.alert('Success','Thank you for your suggestion!');
      }
      else {
        console.log
        (response?.data?.message)
      }

      return response.data.data;
    } catch (error) {
      console.error('Error:', error);

      // Pass the error to the rejectWithValue for Redux Toolkit error handling
      return thunkApi.rejectWithValue(error.response?.data || 'Network error');
    }
  }
);
export const get_Bussiness_list= createAsyncThunk(
  "get_Bussiness_list",
  async (params, thunkApi) => {


    
    try {
      const formData = new FormData();
      formData.append('category_id', params?.category_id);
   

      const token = params?.token;

      const config = {
        method: 'POST',
        url: `${base_url.url}/business/get_busines_filter`,
        data: formData, // Use `data` instead of `body`
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data', // Correct Content-Type for FormData
        },
      };

      const response = await API.request(config);



      
      if (response.data?.status == '1') {

        //Alert.alert('Success','Thank you for your suggestion!');
      }
      else {
        console.log
        (response?.data?.message)
      }

      return response.data.data;
    } catch (error) {
      console.error('Error:', error);

      // Pass the error to the rejectWithValue for Redux Toolkit error handling
      return thunkApi.rejectWithValue(error.response?.data || 'Network error');
    }
  }
);
export const get_dashboard_data= createAsyncThunk(
  "get_dashboard_data",
  async (params, thunkApi) => {


    
    try {
      const token = params?.token;

      const config = {
        method: 'POST',
        url: `${base_url.url}/business/get_dashboard`,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data', // Correct Content-Type for FormData
        },
      };

      const response = await API.request(config);



      
      if (response.data?.status == '1') {

        //Alert.alert('Success','Thank you for your suggestion!');
      }
      else {
        console.log
        (response?.data?.message)
      }

      return response.data.data;
    } catch (error) {
      console.error('Error: get_dashboard_data', error);

      // Pass the error to the rejectWithValue for Redux Toolkit error handling
      return thunkApi.rejectWithValue(error.response?.data || 'Network error');
    }
  }
);
export const get_near_by_business= createAsyncThunk(
  "get_near_by_business",
  async (params, thunkApi) => {


    
    try {
      const token = params?.token;

      console.log('token',token);
      
      const config = {
        method: 'POST',
        url: `${base_url.url}/business/near_by_business`,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data', // Correct Content-Type for FormData
        },
      };

      const response = await API.request(config);



      
      if (response.data?.status == '1') {

        //Alert.alert('Success','Thank you for your suggestion!');
      }
      else {
        console.log
        (response?.data?.message)
      }

      return response.data.data;
    } catch (error) {
      console.error('Error: get_near_by_business ', error);

      // Pass the error to the rejectWithValue for Redux Toolkit error handling
      return thunkApi.rejectWithValue(error.response?.data || 'Network error');
    }
  }
);


export const update_profile = createAsyncThunk(
  'update_profile',
  async (params, thunkApi) => {
    try {
      console.log('update_profile params:', params);

      const formData = new FormData();
      formData.append('full_name', params.full_name || '');
      formData.append('image', params.image); // Ensure `params.image` is a valid File/Blob object
      formData.append('dob', params.dob || '');
      formData.append('country_code', params.country_code || '');
      formData.append('mobile_number', params.mobile_number || '');


      const config = {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${params.token}`,
        },
      };

      const response = await API.post('/auth/update-profile', formData, config);



      
      if (response.data.status == '1') {
        successToast('Profile updated successfully');
      
        return response.data;
      } else {
        errorToast(response.data.message);

      }
    } catch (error) {
      console.error('update_profile error:', error);
    
      return thunkApi.rejectWithValue(error);
    }
  }
);
export const get_business_details = createAsyncThunk(
  'get_business_details',
  async (params, thunkApi) => {
    try {
      console.log('get_business_details params:', params);

      const formData = new FormData();
      formData.append('id', params.id );

      const config = {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${params.token}`,
        },
      };

      const response = await API.post('/business/get_business_details', formData, config);



      
      if (response.data.status == '1') {
     console.log('get_business_details success');
     
      
        return response.data.data;
      } else {
        errorToast(response.data.message);

      }
    } catch (error) {
      console.error('get_business_details error:', error);
    
      return thunkApi.rejectWithValue(error);
    }
  }
);





const FeatureSlice = createSlice({
  name: 'featureSlice',
  initialState,
  reducers: {},



  extraReducers: builder => {

 
    builder.addCase(send_message_help.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(send_message_help.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.isError = false;

    });
    builder.addCase(send_message_help.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
    });
    builder.addCase(get_Bussiness_list.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(get_Bussiness_list.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.isError = false;
      state.Bussinesslist =action.payload

    });
    builder.addCase(get_Bussiness_list.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
    });
    builder.addCase(get_save_Bussines.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(get_save_Bussines.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.isError = false;
      state.saveBusinessData =action.payload

    });
    builder.addCase(get_save_Bussines.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
    });
    builder.addCase(get_near_by_business.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(get_near_by_business.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.isError = false;
      state.Bussinesslist =action.payload

    });
    builder.addCase(get_near_by_business.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
    });
    builder.addCase(get_Bussiness_data.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(get_Bussiness_data.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.isError = false;
      state.nearByStore=action.payload

    });
    builder.addCase(get_Bussiness_data.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
    });
    builder.addCase(get_business_details.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(get_business_details.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.isError = false;
      state.bussinessDetails=action.payload

    });
    builder.addCase(get_business_details.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
    });
    builder.addCase(get_dashboard_data.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(get_dashboard_data.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.isError = false;
      state.dashboardData=action.payload

    });
    builder.addCase(get_dashboard_data.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
    });
    builder.addCase(update_profile.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(update_profile.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.isError = false;

    });
    builder.addCase(update_profile.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
    });

  },
});

export default FeatureSlice.reducer;
