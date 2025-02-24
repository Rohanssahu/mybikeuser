
import axios, { AxiosRequestConfig } from 'axios';

import { endpoint } from './endpoints';
import { successToast } from '../../configs/customToast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { callMultipleApis } from './index';

// Interface for API request
interface ApiRequest {
    endpoint: string;
    method?: 'GET' | 'POST';
    data?: any; // Supports JSON & FormData
    headers?: Record<string, string>;
    token?: string; // Optional Auth Token (per request)
}

const Login_witPhone = async (phoneNumber: string) => {

    console.log('====================================');
    console.log(phoneNumber);
    console.log('====================================');
    // Prepare the request body for login API
    const requestBody = { phone: phoneNumber };

    const apiRequests: ApiRequest[] = [
        {
            endpoint: endpoint.login,
            method: 'POST',
            data: requestBody,
            headers: {
                'Content-Type': 'application/json',
            },
        },
    ];

    console.log(apiRequests);


    try {
        // Call the multiple APIs and await the result
        const results = await callMultipleApis(apiRequests);
        console.log('API Response:', results);


        const response = results[0];


        if (response.success) {
            if (response.message === "OTP sent to your mobile.") {
                successToast(response.message)
                console.log("OTP sent to user.");
                return { success: true, message: "OTP sent", user: response.user || null };
            } else if (response.message === "User created and OTP sent to your mobile.") {
                successToast(response.message)
                console.log("User created and OTP sent.");
                return { success: true, message: "User created", user: response.user || null };
            }
        }
        return { success: false, message: "Unexpected response", user: null };

    } catch (error) {
        console.error('Error fetching data:', error);
        return { success: false, message: error.message, user: null };
    }
};
const resend_Otp = async (phoneNumber: string) => {
    // Prepare the request body for login API
    const requestBody = { phone: phoneNumber };

    const apiRequests: ApiRequest[] = [
        {
            endpoint: endpoint.resendOtp,
            method: 'POST',
            data: requestBody,
            headers: {
                'Content-Type': 'application/json',
            },
        },
    ];

    try {
        // Call the multiple APIs and await the result
        const results = await callMultipleApis(apiRequests);
        console.log('API Response:', results);


        const response = results[0];


        if (response.success) {
            if (response.message === "OTP sent successfully") {
                successToast("Otp Resent Successfully")

                return { success: true, message: "OTP sent", user: response.user || null };
            } else if (response.message === "User created and OTP sent to your mobile.") {
                successToast(response.message)
                console.log("User created and OTP sent.");
                return { success: true, message: "User created", user: response.user || null };
            }
        }
        return { success: false, message: "Unexpected response", user: null };

    } catch (error) {
        console.error('Error fetching data:', error);
        return { success: false, message: error.message, user: null };
    }
};
const otp_Verify = async (phoneNumber: string, otp: string) => {
    // Prepare the request body for login API
    const requestBody = { phone: phoneNumber, otp: otp };

    const apiRequests: ApiRequest[] = [
        {
            endpoint: endpoint.otpVerify,
            method: 'POST',
            data: requestBody,
            headers: {
                'Content-Type': 'application/json',
            },
        },
    ];

    try {
        // Call the multiple APIs and await the result
        const results = await callMultipleApis(apiRequests);
        console.log('API Response:', results);


        const response = results[0];


        if (response.success) {
            if (response.message === "OTP verified successfully") {

                await AsyncStorage.setItem('token', response.token)
                successToast(response.message)

                return { success: true, message: "OTP verified successfully", user: response.user || null };
            } else if (response.message === "User not found") {
                successToast(response.message)

                await AsyncStorage.setItem('token', response.token)
                return { success: true, message: "User not found", user: response.user || null };
            }
        }
        return { success: false, message: "Unexpected response", user: null };

    } catch (error) {
        console.error('Error fetching data:', error);
        return { success: false, message: error.message, user: null };
    }
};
const add_Profile = async (phone: string, first_name: string, last_name: string, state: string, city: string, address: string, pincode: string, image: string) => {
    // Prepare the request body for login API
    const requestBody = { phone: phone, first_name: first_name, last_name: last_name, state: state, city: city, address: address, pincode: pincode, image: image };
    const token = await AsyncStorage.getItem('token')
    const apiRequests: ApiRequest[] = [
        {
            endpoint: endpoint.addProfile,
            method: 'POST',
            data: requestBody,

            headers: {
                'Content-Type': 'application/json',
            },
            token: token,
        },
    ];

    try {
        // Call the multiple APIs and await the result
        const results = await callMultipleApis(apiRequests);
        console.log('API Response:', results);


        const response = results[0];


        if (response.success) {
            if (response.message === "OTP verified successfully") {


                return { success: true, message: "OTP verified successfully", user: response.user || null };
            } else if (response.message === "User not found") {

                return { success: true, message: "User not found", user: response.user || null };
            }
        }
        return { success: false, message: "Unexpected response", user: null };

    } catch (error) {
        console.error('Error fetching data:', error);
        return { success: false, message: error.message, user: null };
    }
};
const add_Bikes = async (name: string, model: string, bike_cc: string, plate_number: string,) => {
    

    
    // Prepare the request body for login API
    const requestBody = { name, model, bike_cc, plate_number };
    const token = await AsyncStorage.getItem('token')
    const apiRequests: ApiRequest[] = [
        {
            endpoint: endpoint.addUserBike,
            method: 'POST',
            data: requestBody,

            headers: {
                'Content-Type': 'application/json',
            },
            token: token,
        },
    ];

    try {
        // Call the multiple APIs and await the result
        const results = await callMultipleApis(apiRequests);
        console.log('API Response:', results);


        const response = results[0];


        if (response.status == 200) {
            if (response.message === "Bike added successfully") {


                successToast(response.message)
            } else {

                successToast(response.message)
            }
        }
        return { success: false, message: "Unexpected response", user: null };

    } catch (error) {
        console.error('Error fetching data:', error);
        return { success: false, message: error.message, user: null };
    }
};
const get_states = async () => {

    const apiRequests: ApiRequest[] = [
        {
            endpoint: endpoint.StateData,
            method: 'GET',

            headers: {
                'Content-Type': 'application/json',
            },
        },
    ];

    try {
        // Call the multiple APIs and await the result
        const results = await callMultipleApis(apiRequests);
        const response = results[0];
        if (response?.length > 0) {
            return { success: true, state: response };
        }
        else {

            return { success: false, message: "Unexpected response", state: [] };
        }

    } catch (error) {
        console.error('Error fetching data:', error);
        return { success: false, message: error.message, state: [] };
    }
};
const get_citys = async (City: string) => {
    console.log('====================================', City);


    console.log(endpoint.CityByState?.replace(':stateId', City));

    const apiRequests: ApiRequest[] = [
        {



            endpoint: endpoint.CityByState?.replace(':stateId', City),
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        },
    ];

    try {
        // Call the multiple APIs and await the result
        const results = await callMultipleApis(apiRequests);
        console.log('API Response=>>>>>>>>>>:', results);


        const response = results[0];


        if (response?.length > 0) {
            return { success: true, state: response };
        }
        else {

            return { success: false, message: "Unexpected response", state: [] };
        }

    } catch (error) {
        console.error('Error fetching data:', error);
        return { success: false, message: error.message, state: [] };
    }
};

const get_servicelist = async () => {

    const token = await AsyncStorage.getItem('token')
    const apiRequests: ApiRequest[] = [
        {
            endpoint: endpoint.servicelist,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "token": token
            },
        },
    ];
    try {
        const results = await callMultipleApis(apiRequests);
        const response = results[0];

        if (response?.data.length > 0) {
            return { success: true, data: response?.data };
        }
        else {

            return { success: false, message: "Unexpected response", data: [] };
        }

    } catch (error) {
        console.error('Error fetching data:', error);
        return { success: false, message: error.message, data: [] };
    }
};
const get_nearyBydeler = async (lat: string, long: string) => {

    console.log(`${endpoint.nearbydeler}?userLat=${lat}&userLon=${long}`);
    const token = await AsyncStorage.getItem('token')
    const apiRequests: ApiRequest[] = [
        {
            endpoint: `${endpoint.nearbydeler}?userLat=${lat}&userLon=${long}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "token": token
            },
        },
    ];
    try {
        const results = await callMultipleApis(apiRequests);
        const response = results[0];

        if (response?.data.length > 0) {
            return { success: true, data: response?.data };
        }
        else {

            return { success: false, message: "Unexpected response", data: [] };
        }

    } catch (error) {
        console.error('Error fetching data:', error);
        return { success: false, message: error.message, data: [] };
    }
};
const get_bannerlist = async () => {

    const token = await AsyncStorage.getItem('token')
    console.log('====================================');
    console.log(token);
    console.log('====================================');
    const apiRequests: ApiRequest[] = [
        {
            endpoint: endpoint.bannerlist,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "token": token
            },
        },
    ];
    try {
        const results = await callMultipleApis(apiRequests);
        const response = results[0];

        if (response?.data.length > 0) {
            return { success: true, data: response?.data };
        }
        else {

            return { success: false, message: "Unexpected response", data: [] };
        }

    } catch (error) {
        console.error('Error fetching data:', error);
        return { success: false, message: error.message, data: [] };
    }
};
const get_userbooking = async () => {
    console.log('===============get_userbooking=====================', endpoint.userbooking);
    const token = await AsyncStorage.getItem('token')

    console.log(token);

    const apiRequests: ApiRequest[] = [
        {
            endpoint: endpoint.userbooking,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'token': token
            },
        },
    ];


    try {
        // Call the multiple APIs and await the result
        const results = await callMultipleApis(apiRequests);

        const response = results[0];

        if (response?.data.length > 0) {
            return { success: true, message: "success", data: response?.data };
        }
        else {
            return { success: false, message: "Data Not Found", data: [] };
        }

    } catch (error) {
        console.error('Error fetching data:', error);
        return { success: false, message: error.message, data: [] };
    }
};
const get_mybikes = async () => {
    console.log('===============get_userbooking=====================', endpoint.userbooking);
    const token = await AsyncStorage.getItem('token')

    console.log(token);

    const apiRequests: ApiRequest[] = [
        {
            endpoint: endpoint.mybikes,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'token': token
            },
        },
    ];


    try {
        // Call the multiple APIs and await the result
        const results = await callMultipleApis(apiRequests);

        const response = results[0];

        if (response?.data.length > 0) {
            return { success: true, message: "success", data: response?.data };
        }
        else {
            return { success: false, message: "Data Not Found", data: [] };
        }

    } catch (error) {
        console.error('Error fetching data:', error);
        return { success: false, message: error.message, data: [] };
    }
};


export { add_Bikes, get_mybikes, get_userbooking, Login_witPhone, get_nearyBydeler, otp_Verify, get_states, get_citys, resend_Otp, add_Profile, get_servicelist, get_bannerlist }  