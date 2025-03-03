
import axios, { AxiosRequestConfig } from 'axios';

import { endpoint } from './endpoints';
import { successToast } from '../../configs/customToast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { callMultipleApis } from './index';

// Interface for API request
interface ApiRequest {
    endpoint: string;
    method?: 'GET' | 'POST' | 'PUT';
    data?: any; // Supports JSON & FormData
    headers?: Record<string, string>;
    token?: string; // Optional Auth Token (per request)
}

const Login_witPhone = async (phoneNumber: string,device_token:string) => {

    console.log('====================================');
    console.log(phoneNumber);
    console.log('====================================');
    // Prepare the request body for login API
    const requestBody = { phone: phoneNumber ,device_token};

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
const otp_Verify = async (phoneNumber: string, otp: string,) => {
    // Prepare the request body for login API
    const requestBody = { phone: phoneNumber, otp: otp, };

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

                return { success: true, message: "OTP verified successfully", user: response || null,isProfile:response?.isProfile };
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


const get_BikeModel = async (id: string) => {
    console.log('=============getbikemodels=======================', id);

    const token = await AsyncStorage.getItem('token')

    console.log(endpoint.getbikemodels?.replace(':company_id', id));

    const apiRequests: ApiRequest[] = [
        {



            endpoint: endpoint.getbikemodels?.replace(':company_id', id),
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "token": token
            },
        },
    ];

    try {
        // Call the multiple APIs and await the result
        const results = await callMultipleApis(apiRequests);
        console.log('API Response=>>>>>>>>>>:', results);


        const response = results[0];


        if (response?.data.length > 0) {
            return { success: true, message: "Success", data: response?.data, };
        }
        else {

            return { success: false, message: "Unexpected response", data: [] };
        }

    } catch (error) {
        console.error('Error fetching data:', error);
        return { success: false, message: error.message, state: [] };
    }
};
const get_BikeVariant = async (id: string) => {
    console.log('==============get_BikeVariant======================', id);
    const token = await AsyncStorage.getItem('token')


    console.log(endpoint.getbikevariants?.replace(':model_id', id));

    const apiRequests: ApiRequest[] = [
        {

            endpoint: endpoint.getbikevariants?.replace(':model_id', id),
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
        console.log('API Response=>>>>>>>>>>:', results);


        const response = results[0];


        if (response?.data.length > 0) {
            return { success: true, message: "Success", data: response.data, };
        }
        else {

            return { success: false, message: "Unexpected response", data: [] };
        }

    } catch (error) {
        console.error('Error fetching data:', error);
        return { success: false, message: error.message, state: [] };
    }
};
const add_Bikes = async (name: string, model: string, bike_cc: string, plate_number: string, variant_id: string) => {
    // Prepare the request body for login API
    const requestBody = { name, model, bike_cc, plate_number, variant_id };
    const token = await AsyncStorage.getItem('token')
    const apiRequests: ApiRequest[] = [
        {
            endpoint: endpoint.addUserBike,
            method: 'POST',
            data: requestBody,

            headers: {
                'Content-Type': 'application/json',
                token: token,
            },
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
                return { success: true, message: response.message, data: response.data };
            } else {

                successToast(response.message)
                return { success: false, message: response.message, data: [] };
            }
        }


    } catch (error) {
        console.error('Error fetching data:', error);
        return { success: false, message: error.message, data: null };
    }
};

const get_BikeCompany = async () => {
    console.log('===============getbikecompanies=====================', endpoint.getbikecompanies);
    const token = await AsyncStorage.getItem('token')

    console.log(token);

    const apiRequests: ApiRequest[] = [
        {
            endpoint: endpoint.getbikecompanies,
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

const remove_bike = async (id: string) => {
    console.log('==============remove_bike======================', id);

    const token = await AsyncStorage.getItem('token')
    const apiRequests: ApiRequest[] = [
        {

            endpoint: endpoint.deleteMyBike?.replace(':bike_id', id),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'token': token
            },
        },
    ];

    try {
        // Call the multiple APIs and await the result
        const results = await callMultipleApis(apiRequests);
        console.log('API Response=>>>>>>>>>>:', results);
        const response = results[0];

        if (response?.status == '200') {
            successToast('Bike Remove Successfully')
            return { success: true, message: "Success", data: response.data, };
        }
        else {

            return { success: false, message: "Unexpected response", data: [] };
        }

    } catch (error) {
        console.error('Error fetching data:', error);
        return { success: false, message: error.message, state: [] };
    }
};
const garage_details = async (id: string) => {
    console.log('==============garagedetails======================', id);

    const token = await AsyncStorage.getItem('token')
    const apiRequests: ApiRequest[] = [
        {

            endpoint: `${endpoint.garagedetails}?dealer_id=${id}`,
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
        console.log('API Response=>>>>>>>>>>:', results);
        const response = results[0];

        if (response?.success) {
            // successToast('Bike Remove Successfully')
            return { success: true, message: "Success", data: response.data, };
        }
        else {

            return { success: false, message: "Unexpected response", data: [] };
        }

    } catch (error) {
        console.error('Error fetching data:', error);
        return { success: false, message: error.message, state: [] };
    }
};

const get_FilterBydeler = async (lat: string, long: string, variant_id: string,) => {

    const token = await AsyncStorage.getItem('token')
    const apiRequests: ApiRequest[] = [
        {
            endpoint: `${endpoint.nearbydeler}?userLat=${lat}&userLon=${long}&variant_id=${variant_id}`,
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
const addPickupAddress = async (user_lat: string, user_lng: string, dealer_id: string) => {
    const requestBody = { user_lat, user_lng, dealer_id };
    const token = await AsyncStorage.getItem('token')
    const apiRequests: ApiRequest[] = [
        {
            endpoint: endpoint.addpickndrop,
            method: 'POST',
            data: requestBody,
            headers: {
                'Content-Type': 'application/json',
                "token": token
            },
        },
    ];
    try {
        const results = await callMultipleApis(apiRequests);
        const response = results[0];

        if (response?.status === 200) {
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

const create_booking = async (dealer_id: string, services: string, pickupAndDropId: string, userBike_id: string, pickupDate: string) => {
    // Prepare the request body for login API
    const requestBody = { dealer_id, services, pickupAndDropId, userBike_id, pickupDate };
    const token = await AsyncStorage.getItem('token')
    const apiRequests: ApiRequest[] = [
        {
            endpoint: endpoint.createBooking,
            method: 'POST',
            data: requestBody,

            headers: {
                'Content-Type': 'application/json',
                token: token,
            },
        },
    ];

    try {
        // Call the multiple APIs and await the result
        const results = await callMultipleApis(apiRequests);
        console.log('API Response: create_booking', results);


        const response = results[0];


        if (response.success) {

            successToast(response.message)
            return { success: true, message: response.message, data: response.data };
        } else {

            successToast(response.message)
            return { success: false, message: response.message, data: [] };
        }
    }
    catch (error) {
        console.error('Error fetching data:', error);
        return { success: false, message: error.message, data: null };
    }
};

const get_profile = async () => {
    console.log('===============get_profile=====================', endpoint.getprofile);
    const token = await AsyncStorage.getItem('token')

    console.log(token);

    const apiRequests: ApiRequest[] = [
        {
            endpoint: endpoint.getprofile,
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

        if (response?.success) {
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
const updateProfile = async (user_id: string, phone: string, first_name: string, last_name: string, state: string, city: string, address: string, pincode: string, image: string, email: string) => {
    // Prepare the request body for login API
    const requestBody = { first_name, last_name, email, phone, state, city, address, pincode, image };

    const token = await AsyncStorage.getItem('token');
    if (!token) {
        console.error("Token is missing or invalid");
        return { success: false, message: "Token not found, please log in again", user: null };
    }

    const apiRequests: ApiRequest[] = [
        {
            endpoint: endpoint.updateprofile?.replace(':id', user_id),
            method: 'PUT',
            data: requestBody,

            headers: {
                'Content-Type': 'application/json',
                token: token
            },
            token: token,
        },
    ];



    try {
        // Call the multiple APIs and await the result
        const results = await callMultipleApis(apiRequests);
        console.log('API update prpifel Response:=>>>>>>', results);


        const response = results[0];


        if (response.status == '200') {


            successToast(response.message)
            return { success: true, message: "customer updated successfully", user: response.data || null };
        } else {

            return { success: true, message: "customer updated Failed", user: response.data || null };
        }



    } catch (error) {
        console.error('Error fetching data:', error);
        return { success: false, message: error.message, user: null };
    }
};
const updateProfileImage = async (image: any) => {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
        console.error("Token is missing or invalid");
        return { success: false, message: "Token not found, please log in again", user: null };
    }

    const formData = new FormData();
    formData.append('images', {
        uri: image.uri,  // Adjust the image URI based on the source you're using (this works for images picked via ImagePicker)
        type: 'jpeg/png', // e.g. 'image/jpeg', or 'image/png' depending on the file type
        name: 'profile.jpg',  // A fallback file name if none is provided
    });

    const apiRequests: ApiRequest[] = [
        {
            endpoint: endpoint.profileimage,
            method: 'PUT',
            data: formData, // Sending FormData here
            headers: {
                'Content-Type': 'multipart/form-data',
                'token': token, // Ensure the token is passed in the Authorization header
            },

        },
    ];

    try {
        // Call the multiple APIs and await the result
        const results = await callMultipleApis(apiRequests);
        console.log('API update profile Response:=>>>>>>', results);

        const response = results[0];
        if (response.status == '200') {
            successToast(response.message);
            return { success: true, message: "Profile image updated successfully", user: response.data || null };
        } else {
            return { success: false, message: "Profile image update failed", user: response.data || null };
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return { success: false, message: error.message, user: null };
    }
};

const bookingdetails = async (id: string) => {
    console.log('==============bookingdetails======================', id);

    const token = await AsyncStorage.getItem('token')
    const apiRequests: ApiRequest[] = [
        {

            endpoint: endpoint.bookingdetails?.replace(':id', id),
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
        console.log('API Response=>>>>>>>>>>:', results);
        const response = results[0];

        if (response?.success) {
            // successToast('Bike Remove Successfully')
            return { success: true, message: "Success", data: response.data, };
        }
        else {

            return { success: false, message: "Unexpected response", data: [] };
        }

    } catch (error) {
        console.error('Error fetching data:', error);
        return { success: false, message: error.message, state: [] };
    }
};
const cancel_booking = async (bookingId: string, status: string) => {
    const requestBody = { bookingId, status }
    const token = await AsyncStorage.getItem('token')
    const apiRequests: ApiRequest[] = [
        {
            endpoint: endpoint.cancelbooking,
            method: 'POST',
            data: requestBody,

            headers: {
                'Content-Type': 'application/json',
                token: token
            },
        },
    ];


    try {
        // Call the multiple APIs and await the result
        const results = await callMultipleApis(apiRequests);
        const response = results[0];

        if (response?.success) {
            // successToast('Bike Remove Successfully')
            return { success: true, message: "Success", data: response.data, };
        }
        else {

            return { success: false, message: "Unexpected response", data: [] };
        }

    } catch (error) {
        console.error('Error fetching data:', error);
        return { success: false, message: error.message, state: [] };
    }
};


export { cancel_booking, bookingdetails, updateProfileImage, updateProfile, get_profile, addPickupAddress, create_booking, garage_details, get_FilterBydeler, remove_bike, get_BikeVariant, get_BikeModel, get_BikeCompany, add_Bikes, get_mybikes, get_userbooking, Login_witPhone, get_nearyBydeler, otp_Verify, get_states, get_citys, resend_Otp, add_Profile, get_servicelist, get_bannerlist }  