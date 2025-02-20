import { createSlice, createAsyncThunk, createAction } from '@reduxjs/toolkit';
import { API } from '../Api';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenNameEnum from '../../routes/screenName.enum';
import Toast from 'react-native-toast-message';
import { errorToast, successToast } from '../../configs/customToast';

const initialState = {
  isLoading: false,
  isError: false,
  isSuccess: false,
  userData: null,
  isLogin: false,
  isLogOut: false,
  User:[]

};

export const login = createAsyncThunk('login', async (params, thunkApi) => {
  console.log('===============login=====================', params);

  try {

    const formdata = new FormData();


    formdata.append("identity", params.email);
    formdata.append("password", params.password);
   

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
      },
    };

    const response = await API.post('/auth/login', formdata, config);


    console.log('response login',response.data);
    
    if (response.data.status == '1') {
      successToast(response.data.message);
     
        params.navigation.navigate(ScreenNameEnum.BOTTAM_TAB)

      thunkApi.dispatch(loginSuccess(response.data));

    } else {
      // Show error toast if status is not 1
      errorToast(`${response.data.message}`);
    }

    return response.data;
  } catch (error) {
    console.log('Error:', error);
    errorToast('Network error');
    return thunkApi.rejectWithValue(error);
  }
});
export const reset_password = createAsyncThunk('reset_password', async (params, thunkApi) => {
  console.log('===============login=====================', params);

  try {

    const formdata = new FormData();


    formdata.append("identity", params.identity);

   

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
      },
    };

    const response = await API.post('/auth/password-reset', formdata, config);


    console.log('response login',response.data);
    
    if (response.data.status == '1') {
      successToast(response.data.message);
     
        params.navigation.navigate(ScreenNameEnum.OTP_SCREEN,{identity:params.identity})


    } else {
      // Show error toast if status is not 1
      errorToast(`${response.data.message}`);
    }

    return response.data.data;
  } catch (error) {
    console.log('Error:', error);
    errorToast('Network error');
    return thunkApi.rejectWithValue(error);
  }
});
export const verify_otp = createAsyncThunk('verify_otp', async (params, thunkApi) => {
  console.log('===============Verify_otps=====================', params);

  try {

    const formdata = new FormData();


    formdata.append("identity", params.identity);
    formdata.append("otp", params.otp);

   

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
      },
    };

    const response = await API.post('/auth/verify-otp', formdata, config);


    console.log('response login',response.data.status);
    

    if (response.data.status == '1') {
      successToast(response.data.message);
     
       
        params.navigation.navigate(ScreenNameEnum.CreatePassword, {user:response.data.data})

    } else {
      // Show error toast if status is not 1
      errorToast(`${response.data.message}`);
    }

    return response.data.data;
  } catch (error) {
    console.log('Error:', error);
    errorToast('Network error');
    return thunkApi.rejectWithValue(error);
  }
});
export const Create_new_password = createAsyncThunk('Create_new_password', async (params, thunkApi) => {
  console.log('===============login=====================', params);

  try {

    const formdata = new FormData();


    formdata.append("user_id", params.user_id);
    formdata.append("password", params.password);
    formdata.append("c_password", params.c_password);

   

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
      },
    };

    const response = await API.post('/auth/create-new-password', formdata, config);


    console.log('response login',response.data.status);
    

    if (response.data.status == '1') {
      successToast(response.data.message);
     
       
        params.navigation.navigate(ScreenNameEnum.LOGIN_SCREEN)

    } else {
      // Show error toast if status is not 1
      errorToast(response.data.message);
    }

    return response.data.data;
  } catch (error) {
    console.log('Error:', error);
    errorToast('Network error');
    return thunkApi.rejectWithValue(error);
  }
});

export const Sign_up = createAsyncThunk(
  'Sign_up',
  async (params, thunkApi) => {

    try {

      console.log('Sign_up=>>>>>>>>>',params);
      
    

    
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
        },
      };

      const response = await API.post('/auth/signup', params.formData, config);



      if (response.data.status == '1') {
        successToast('User Register Successfuly');
      }
      else{
        errorToast(response.data.message);
      }
      thunkApi.dispatch(loginSuccess(response.data.data));
      return response.data;
    } catch (error) {
      console.log('🚀 ~Register :', error);
      errorToast(response.data.message);
      return thunkApi.rejectWithValue(error);
    }
  },
);
export const create_bussiness = createAsyncThunk(
  'create_bussiness',
  async (params, thunkApi) => {
    try {
      console.log('create_bussiness=>>>>>>>>>', params);

      // Assuming `params` contains the token
      const token = params.token; // Ensure the token is passed in params
      if (!token) {
        throw new Error('Authorization token is missing');
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`, // Add token to the header
        },
      };

      const response = await API.post('/auth/create-business', params.formData, config);


      console.log('response.data.status',response.data);
      
      if (response.data.status == '1') {
        successToast('Details Save Successfully');
      } else {
        errorToast(response.data.message);
      }

      return response.data;
    } catch (error) {
      console.log('🚀 ~ create_bussiness Error:', error);
      errorToast(error.response?.data?.message || 'Something went wrong');
      return thunkApi.rejectWithValue(error);
    }
  }
);
export const get_profile = createAsyncThunk(
  'get_profile',
  async (params, thunkApi) => {
    try {

      // Assuming `params` contains the token
      const token = params.token; // Ensure the token is passed in params
      if (!token) {
        throw new Error('Authorization token is missing');
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`, // Add token to the header
        },
      };

      const response = await API.post('/auth/get-profile', null, config);


      console.log('response.data.status',response.data);
      
      if (response.data.status == '1') {

      } else {
        errorToast(response.data.message);
      }

      return response.data;
    } catch (error) {
      console.log('🚀 ~ create_bussiness Error:', error);
      errorToast(error.response?.data?.message || 'Something went wrong');
      return thunkApi.rejectWithValue(error);
    }
  }
);



const AuthSlice = createSlice({
  name: 'authSlice',
  initialState,
  reducers: {
    loginSuccess(state, action) {
      state.isLoading = false;
      state.isSuccess = true;
      state.isError = false;
      state.isLogin = true;
      state.isLogOut = false;
      state.userData = action.payload;
    },
   
  },
  extraReducers: builder => {
    // login cases
    builder.addCase(login.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.isError = false;
      state.isLogin = true;
      state.isLogOut = false;
      state.userData = action.payload;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.isLogin = false;
    });
    builder.addCase(create_bussiness.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(create_bussiness.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.isError = false;
      state.isLogOut = false;

    });
    builder.addCase(create_bussiness.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.isLogin = false;
    });
    builder.addCase(Create_new_password.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(Create_new_password.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.isError = false;
      state.isLogOut = false;

    });
    builder.addCase(Create_new_password.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.isLogin = false;
    });
    builder.addCase(verify_otp.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(verify_otp.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.isError = false;
      state.isLogOut = false;

    });
    builder.addCase(verify_otp.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.isLogin = false;
    });
    builder.addCase(reset_password.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(reset_password.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.isError = false;
      state.isLogOut = false;
     
    });
    builder.addCase(reset_password.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.isLogin = false;
    });

   

    builder.addCase(Sign_up.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(Sign_up.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.isError = false;
      state.userData = action.payload
     
    });
    builder.addCase(Sign_up.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
    });
    builder.addCase(get_profile.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(get_profile.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.isError = false;
      state.User = action.payload
     
    });
    builder.addCase(get_profile.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
    });
  },
});

export const { loginSuccess,} =
  AuthSlice.actions;

export default AuthSlice.reducer;
