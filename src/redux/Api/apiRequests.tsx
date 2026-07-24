
import axios, { AxiosRequestConfig } from 'axios';

import { endpoint } from './endpoints';
import { errorToast, successToast } from '../../configs/customToast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { base_url, callMultipleApis } from './index';
import { string } from 'prop-types';

// Interface for API request
interface ApiRequest {
    endpoint: string;
    method?: 'GET' | 'POST' | 'PUT';
    data?: any; // Supports JSON & FormData
    headers?: Record<string, string>;
    token?: string; // Optional Auth Token (per request)
}

const Login_witPhone = async (phoneNumber: string, device_token: string) => {


    // Prepare the request body for login API
    const requestBody = { phone: phoneNumber, device_token };

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

const updateBooking = async (
    save: string,
    Price: number,
    dataUser: any,
    token: string,
    lastServiceKm: string,
    id: any,
    setLoading: any,
    navigation: any,
) => {
    // Pricing snapshot fields (tax, totalBill) are never sent — the backend
    // is the only pricing authority and recomputes them from `services` via
    // pricingEngine.computePriceBreakdown() whenever the service list changes.
    const requestBody = {
        bookingId: dataUser?._id,
        billGenerated: false,
        lastServiceKm: lastServiceKm,
        services: id,
    };

    setLoading(true); // Start loader

    console.log('requestBody', requestBody);

    const apiRequests: ApiRequest[] = [
        {
            endpoint: endpoint.updateBooking,
            method: 'POST',
            data: requestBody,
            headers: {
                'Content-Type': 'application/json',
                token: token,
            },
        },
    ];

    try {
        const results = await callMultipleApis(apiRequests);
        const response = results[0];
        if (response.message) {
            setLoading(false); // Stop loader

            if (save === 'save') {
                // navigation.navigate(ScreenNameEnum.BOTTAM_TAB);
                successToast(response.message);
                navigation.goBack();
                setLoading(false);
                return { success: true, message: response.message, user: null };
            } else {
                setLoading(false);
                return { success: true, message: response.message, user: null };
            }
        }
        setLoading(false);
        return { success: false, message: 'Unexpected response', user: null };
    } catch (error: any) {
        errorToast(error.message);
        setLoading(false); // Stop loader
        return { success: false, message: error.message, user: null };
    }
};

const get_invoice = async (booking_id: string) => {
    const token = await AsyncStorage.getItem('token');
    const apiRequests: ApiRequest[] = [
        {
            endpoint: `${endpoint.invoiceUnified}/${booking_id}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                token: token,
            },
        },
    ];
    try {
        const results = await callMultipleApis(apiRequests);
        const response = results[0];
        if (response?.success) {
            return { success: true, data: response.data };
        }
        return { success: false, data: null };
    } catch (error: any) {
        console.error('get_invoice error:', error);
        return { success: false, data: null };
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
                await AsyncStorage.setItem('user_id', response.user_id)
                successToast(response.message)

                return { success: true, message: "OTP verified successfully", user: response };
            } else if (response.message === "User not found") {
                successToast(response.message)

                await AsyncStorage.setItem('token', response.token)
                return { success: true, message: "User not found", user: response.user[0] || null };
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
const get_nearyBydeler = async (lat: number, long: number) => {

    console.log(`${endpoint.nearbydeler}?userLat=${lat}&userLon=${long}`);
    const token = await AsyncStorage.getItem('token')
    const apiRequests: ApiRequest[] = [
        {
            endpoint: `${endpoint.nearbydeler}?userLat=${lat}&userLon=${long}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',

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
const get_featured_categories = async (lat: number, lon: number) => {
    const token = await AsyncStorage.getItem('token');
    const apiRequests: ApiRequest[] = [
        {
            endpoint: `${endpoint.featuredCategories}?latitude=${lat}&longitude=${lon}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'token': token,
            },
        },
    ];
    try {
        const results = await callMultipleApis(apiRequests);
        const response = results[0];
        if (response?.data?.length > 0) {
            return { success: true, data: response.data };
        } else {
            return { success: false, message: 'No data', data: [] };
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return { success: false, message: error.message, data: [] };
    }
};

const get_bannerlist = async () => {

    const token = await AsyncStorage.getItem('token')

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
const get_userbooking = async (_id: string) => {
    console.log('===============get_userbooking=====================', endpoint.userbooking + `/${_id}?user_type=4`);
    const token = await AsyncStorage.getItem('token')

    console.log(token);

    const apiRequests: ApiRequest[] = [
        {
            endpoint: endpoint.userbooking + `/${_id}?user_type=4`,
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

    console.log(endpoint.getbikemodels?.replace(':company_id', encodeURIComponent(id)));

    const apiRequests: ApiRequest[] = [
        {



            endpoint: endpoint.getbikemodels?.replace(':company_id', encodeURIComponent(id)),
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


    console.log(endpoint.getbikevariants?.replace(':model_id', encodeURIComponent(id)));

    const apiRequests: ApiRequest[] = [
        {

            endpoint: endpoint.getbikevariants?.replace(':model_id', encodeURIComponent(id)),
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
const add_Bikes = async (plate_number: string, variant_id: string) => {
    // name/model/bike_cc are resolved server-side from variant_id, not sent by the client
    const requestBody = { plate_number, variant_id };

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
const garage_details = async (id: string, digitsOnly: string) => {
    const token = await AsyncStorage.getItem('token');

    const apiRequests: ApiRequest[] = [
        {
            endpoint: `${endpoint.garagedetails}/${id}?cc=${digitsOnly}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'token': token
            },
        },
    ];

    try {
        const results = await callMultipleApis(apiRequests);
        const response = results[0];

        if (response?.success) {
            return { success: true, message: "Success", data: response.data };
        } else {
            return { success: false, message: response?.message || "Unexpected response", data: [] };
        }

    } catch (error: any) {
        console.error('Error fetching data:', error);
        // Dealer-unavailable (offline/inactive/blocked) comes back as a non-2xx
        // status, which axios rejects — the actual "This garage is currently
        // unavailable." text lives in error.response.data.message, not
        // error.message (which would just say "Request failed with status code 403").
        return {
            success: false,
            message: error?.response?.data?.message || error.message,
            data: [],
        };
    }
};

const get_dealer_services = async (dealerId: string, variant_id: string, cc?: string) => {

    let servicesUrl = `${endpoint.dealerServices}?dealerId=${dealerId}&variant_id=${variant_id}`;
    if (cc) {servicesUrl += `&cc=${cc}`;}

    const apiRequests: ApiRequest[] = [
        {
            endpoint: servicesUrl,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',

            },
        },
    ];


   
    try {
        const results = await callMultipleApis(apiRequests);
        const response = results[0];

        // API returns { status: true, pricing: [...] }
        const pricing = response?.pricing ?? response?.data;
        if (response?.status === true || response?.success) {
            return { success: true, message: 'Success', data: Array.isArray(pricing) ? pricing : [] };
        } else {
            return { success: false, message: 'Unexpected response', data: [] };
        }
    } catch (error) {
        console.error('Error fetching dealer services:', error);
        return { success: false, message: error.message, data: [] };
    }
};

const get_FilterBydeler = async (lat: string, long: string, variant_id: string, serviceId?: string, cc?: string) => {

    const token = await AsyncStorage.getItem('token')
    let filterUrl = `${endpoint.nearbydeler}?userLat=${lat}&userLon=${long}&variant_id=${variant_id}`;
    if (serviceId) {filterUrl += `&serviceId=${serviceId}`;}
    if (cc) {filterUrl += `&cc=${cc}`;}
    const apiRequests: ApiRequest[] = [
        {
            endpoint: filterUrl,
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
const addPickupAddress = async (user_lat: string, user_lng: string, dealer_id: string, user_id: string) => {
    const requestBody = { user_lat, user_lng, dealer_id, user_id };
    const token = await AsyncStorage.getItem('token')

    console.log('============requestBody========================');
    console.log(requestBody);
    console.log('====================================');
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
const additionalservices = async (id: string, token: string, cc: string) => {
    const apiRequests: ApiRequest[] = [
        {
            endpoint: `${endpoint.additionalservices}/${id}?cc=${cc}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                token: token,
            },
        },
    ];

    try {
        // Call the multiple APIs and await the result
        const results = await callMultipleApis(apiRequests);
        const response = results[0];

        if (response?.success) {
            return { success: true, message: 'Success', data: response.data };
        } else {
            return { success: false, message: 'Unexpected response', data: [] };
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return { success: false, message: error.message, state: [] };
    }
};
const create_booking = async (dealer_id: string, services: string[], transportOption: string, pickupAndDropId: string | null, userBike_id: string, pickupDate: string, promoCode?: string | null) => {
    const requestBody = { dealer_id, services, transportOption, pickupAndDropId, userBike_id, pickupDate, promoCode: promoCode || undefined };
    const token = await AsyncStorage.getItem('token')

    console.log('requestBody',requestBody);

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
        const results = await callMultipleApis(apiRequests);
        console.log('API Response: create_booking', results);
        const response = results[0];

        if (response.success) {
            successToast(response.message);
            return { success: true, message: response.message, data: response.data };
        } else {
            return { success: false, message: response.message, data: [], errorCode: response.errorCode };
        }
    }
    catch (error: any) {
        console.error('Error fetching data:', error);
        return {
            success: false,
            message: error?.response?.data?.message || error?.message || 'Something went wrong',
            data: null,
            errorCode: error?.response?.data?.errorCode,
        };
    }
};

// Live price preview from the pricing engine — NO local math. Every field the
// User App shows as a money value comes from this response.
const get_pricing_quote = async (
    dealerId: string,
    serviceIds: string[],
    transportOption: string,
    bikeCC: string | number,
    promoCode?: string | null,
) => {
    const requestBody = { dealerId, serviceIds, transportOption, bikeCC, promoCode: promoCode || undefined };
    const token = await AsyncStorage.getItem('token');

    const apiRequests: ApiRequest[] = [
        {
            endpoint: endpoint.pricingQuote,
            method: 'POST',
            data: requestBody,
            headers: {
                'Content-Type': 'application/json',
                token: token,
            },
        },
    ];

    try {
        const results = await callMultipleApis(apiRequests);
        const response = results[0];

        if (response?.success) {
            return { success: true, data: response.data };
        }
        return { success: false, message: response?.message || 'Unable to fetch price', data: null };
    } catch (error: any) {
        return {
            success: false,
            message: error?.response?.data?.message || error?.message || 'Something went wrong',
            data: null,
        };
    }
};

const get_profile = async (user_id: string) => {

    const token = await AsyncStorage.getItem('token')

    console.log(token);

    const apiRequests: ApiRequest[] = [
        {
            endpoint: `${endpoint.getprofile}/${user_id}`,
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
const updateProfile = async (user_id: string, phone: string, first_name: string, last_name: string, state: string, city: string, address: string, pincode: string, image: string, email: string, referralCode?: string) => {
    // Prepare the request body for login API
    const requestBody = { first_name, last_name, email, phone, state, city, address, pincode, image, ...(referralCode ? { referralCode } : {}) };

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
// Validates a referral code entered during registration against the
// backend — mirrors get_pricing_quote's "enter a code, validate via API"
// shape. Requires the caller to already be logged in (token issued at
// OTP verify), since self-referral checks need the current user's id.
const validate_referral_code = async (referralCode: string) => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
        return { success: false, message: 'Token not found, please log in again', data: null };
    }

    const apiRequests: ApiRequest[] = [
        {
            endpoint: endpoint.validateReferralCode,
            method: 'POST',
            data: { referralCode },
            headers: {
                'Content-Type': 'application/json',
                token: token,
            },
        },
    ];

    try {
        const results = await callMultipleApis(apiRequests);
        const response = results[0];

        if (response?.success) {
            return { success: true, message: response.message, data: response.data };
        }
        return { success: false, message: response?.message || 'Invalid referral code', data: null };
    } catch (error: any) {
        return {
            success: false,
            message: error?.response?.data?.message || error?.message || 'Something went wrong',
            data: null,
        };
    }
};

// Fetches the logged-in user's own referral code (auto-generated server-side).
const get_my_referral_code = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
        return { success: false, message: 'Token not found, please log in again', data: null };
    }

    const apiRequests: ApiRequest[] = [
        {
            endpoint: endpoint.myReferralCode,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                token: token,
            },
        },
    ];

    try {
        const results = await callMultipleApis(apiRequests);
        const response = results[0];

        if (response?.success) {
            return { success: true, data: response.data };
        }
        return { success: false, message: response?.message || 'Unable to fetch referral code', data: null };
    } catch (error: any) {
        return {
            success: false,
            message: error?.response?.data?.message || error?.message || 'Something went wrong',
            data: null,
        };
    }
};

// Rewards & Referrals screen header — referral code, referral earnings,
// successful referrals count, and (reused, not a separate settings call)
// the showRewardsReferralsMenu/enableReferralSystem admin flags so the
// Profile tab can decide whether to render the menu entry at all.
const get_referral_summary = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
        return { success: false, message: 'Token not found, please log in again', data: null };
    }

    const apiRequests: ApiRequest[] = [
        {
            endpoint: endpoint.referralSummary,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                token: token,
            },
        },
    ];

    try {
        const results = await callMultipleApis(apiRequests);
        const response = results[0];

        if (response?.success) {
            return { success: true, data: response.data };
        }
        return { success: false, message: response?.message || 'Unable to fetch referral summary', data: null };
    } catch (error: any) {
        return {
            success: false,
            message: error?.response?.data?.message || error?.message || 'Something went wrong',
            data: null,
        };
    }
};

// Rewards & Referrals screen's transaction list.
const get_referral_transactions = async (page: number = 1, limit: number = 20) => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
        return { success: false, message: 'Token not found, please log in again', data: [] };
    }

    const apiRequests: ApiRequest[] = [
        {
            endpoint: `${endpoint.referralTransactions}?page=${page}&limit=${limit}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                token: token,
            },
        },
    ];

    try {
        const results = await callMultipleApis(apiRequests);
        const response = results[0];

        if (response?.success) {
            return { success: true, data: response.data || [], pagination: response.pagination };
        }
        return { success: false, message: response?.message || 'Unable to fetch referral transactions', data: [] };
    } catch (error: any) {
        return {
            success: false,
            message: error?.response?.data?.message || error?.message || 'Something went wrong',
            data: [],
        };
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
    const user_id = await AsyncStorage.getItem('user_id')

    const requestBody = { user_id, status }

    const apiRequests: ApiRequest[] = [
        {
            endpoint: endpoint.cancelbooking + `/${bookingId}/status`,
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

const get_tikit = async (user_id) => {

    const token = await AsyncStorage.getItem('token')

    console.log(token);

    const apiRequests: ApiRequest[] = [
        {
            endpoint: `${endpoint.gettickets}/${user_id}`,
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
const get_tikitdetails = async (id: string) => {
    console.log('===============get_tikit===details==================',);
    const token = await AsyncStorage.getItem('token')

    console.log(token);

    const apiRequests: ApiRequest[] = [
        {
            endpoint: endpoint.gettikitdetails?.replace(':ticket_id', id),
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

const create_tikit = async (
    subject: string,
    message: string,
    user_id: string,
) => {
    const requestBody = {
        sender_id: user_id,
        subject,
        message,
        user_type: 'user',
        sender_type: 'user',
        attachments: [],
    };

    const apiRequests: ApiRequest[] = [
        {
            endpoint: `${endpoint.createTikit}/${user_id}`,
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
        const response = results[0];
        console.log('response', response);

        if (response?.success) {
            // successToast('Bike Remove Successfully')
            return { success: true, message: 'Success', data: response.data };
        } else {
            return { success: false, message: 'Unexpected response', data: [] };
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return { success: false, message: error.message, state: [] };
    }
};
const replay_tikit = async (id: string, message: string, sender_id: string) => {
    const requestBody = {
        sender_id: sender_id,
        sender_type: 'user',
        message,
    };

    const apiRequests: ApiRequest[] = [
        {
            endpoint: endpoint.replytikit?.replace(':ticket_id', id),
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
        const response = results[0];

        if (response?.success) {
            // successToast('Bike Remove Successfully')
            return { success: true, message: 'Success', data: response.data };
        } else {
            return { success: false, message: 'Unexpected response', data: [] };
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return { success: false, message: error.message, state: [] };
    }
};
const tikitstatus = async (id: string, status: string) => {
    const requestBody = { status }
    const token = await AsyncStorage.getItem('token')


    const apiRequests: ApiRequest[] = [
        {
            endpoint: endpoint.tikitstatus?.replace(':ticket_id', id),
            method: 'PUT',
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



const get_bookingTimerStatus = async (bookingId: string) => {
    const token = (await AsyncStorage.getItem('token')) ?? '';
    const apiRequests: ApiRequest[] = [
        {
            endpoint: `${endpoint.bookingTimerStatus}/${bookingId}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                token: token,
            },
        },
    ];
    try {
        const results = await callMultipleApis(apiRequests);
        const response = results[0];

        console.log('get_bookingTimerStatusa',response);
        
        if (response?.success) {
            return { success: true, data: response };
        }
        return { success: false, data: null };
    } catch (error: any) {
        console.error('get_bookingTimerStatus error:', error);
        return { success: false, data: null };
    }
};

const select_payment_method = async (bookingId: string, payment_method: 'ONLINE' | 'CASH') => {
    const token = await AsyncStorage.getItem('token');
    const user_id = await AsyncStorage.getItem('user_id');
    const requestBody = { user_id, payment_method };
    console.log('PAYMENT_METHOD_BODY', requestBody);
    const apiRequests: ApiRequest[] = [
        {
            endpoint: (() => { const finalUrl = `${endpoint.selectPaymentMethod}/${bookingId}/select-payment-method`; console.log('PAYMENT_METHOD_URL', finalUrl); return finalUrl; })(),
            method: 'POST',
            data: requestBody,
            headers: {
                'Content-Type': 'application/json',
                token: token,
            },
        },
    ];
    try {
        const results = await callMultipleApis(apiRequests);
        const response = results[0];
        if (response?.success) {
            return { success: true, data: response.data };
        }
        return { success: false, data: null };
    } catch (error: any) {
        console.error('select_payment_method error:', error);
        return { success: false, data: null };
    }
};

const get_Notification = async (receiverId: string, setIsLoading: (v: boolean) => void) => {
    const resolvedEndpoint = endpoint.notification.replace(':receiverId', receiverId);
    console.log('[get_Notification] endpoint:', resolvedEndpoint);
    console.log('[get_Notification] receiverId:', receiverId);
    const apiRequests: ApiRequest[] = [
        {
            endpoint: resolvedEndpoint,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        },
    ];
    setIsLoading(true);
    try {
        const results = await callMultipleApis(apiRequests);
        const response = results[0];
        console.log('[get_Notification] raw response:',);
        
        
        if (response?.success || response?.status) {
            setIsLoading(false);
            return { success: true, message: 'success', data: response };
        } else {
            setIsLoading(false);
            return { success: false, message: 'Data Not Found', data: [] };
        }
    } catch (error: any) {
        setIsLoading(false);
        console.error('Error fetching notifications:', error);
        return { success: false, message: error.message, data: [] };
    }
};

const get_legal_document = async (docType: string) => {
    const apiRequests: ApiRequest[] = [
        {
            endpoint: endpoint.legalDocument.replace(':docType', docType),
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        },
    ];

    try {
        const results = await callMultipleApis(apiRequests);
        const response = results[0];
        if (response?.success) {
            return { success: true, data: response.data };
        }
        return { success: false, data: null };
    } catch (error: any) {
        console.error('get_legal_document error:', error);
        return { success: false, data: null };
    }
};

const get_app_settings = async () => {
    const apiRequests: ApiRequest[] = [
        {
            endpoint: endpoint.appSettings,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        },
    ];

    try {
        const results = await callMultipleApis(apiRequests);
        const response = results[0];
        if (response?.success) {
            return { success: true, data: response.data };
        }
        return { success: false, data: null };
    } catch (error: any) {
        console.error('get_app_settings error:', error);
        return { success: false, data: null };
    }
};

const get_app_banners = async (bannerType: 'home' | 'popup' | 'announcement') => {
    const apiRequests: ApiRequest[] = [
        {
            endpoint: endpoint.appBanners.replace(':bannerType', bannerType),
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        },
    ];

    try {
        const results = await callMultipleApis(apiRequests);
        const response = results[0];
        if (response?.success) {
            return { success: true, data: response.data || [] };
        }
        return { success: false, data: [] };
    } catch (error: any) {
        console.error('get_app_banners error:', error);
        return { success: false, data: [] };
    }
};

const get_faqs = async () => {
    const apiRequests: ApiRequest[] = [
        {
            endpoint: `${endpoint.faqs}?appType=user`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        },
    ];

    try {
        const results = await callMultipleApis(apiRequests);
        const response = results[0];
        if (response?.success) {
            return { success: true, data: response.data || [] };
        }
        return { success: false, data: [] };
    } catch (error: any) {
        console.error('get_faqs error:', error);
        return { success: false, data: [] };
    }
};

export { additionalservices, updateBooking, get_invoice, tikitstatus, replay_tikit, get_tikitdetails, create_tikit, get_tikit, cancel_booking, bookingdetails, updateProfileImage, updateProfile, get_profile, addPickupAddress, create_booking, get_pricing_quote, garage_details, get_dealer_services, get_FilterBydeler, remove_bike, get_BikeVariant, get_BikeModel, get_BikeCompany, add_Bikes, get_mybikes, get_userbooking, Login_witPhone, get_nearyBydeler, otp_Verify, get_states, get_citys, resend_Otp, add_Profile, get_servicelist, get_bannerlist, get_featured_categories, get_bookingTimerStatus, get_Notification, select_payment_method, get_legal_document, get_app_settings, get_app_banners, get_faqs, validate_referral_code, get_my_referral_code, get_referral_summary, get_referral_transactions };
