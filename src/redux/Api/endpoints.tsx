// Defining endpoints
export const endpoint = {
  login: '/bikedoctor/userAuth/userLogin',
  otpVerify: '/bikedoctor/userAuth/otpVerify',
  StateData: '/location/getAllStateData',
  CityByState: '/location/getCityByState/:stateId',
  resendOtp: '/bikedoctor/userAuth/resendOtp',
  addProfile: '/bikedoctor/userAuth/addProfile',
  servicelist: '/bikedoctor/service/servicelist',
  bannerlist: '/bikedoctor/banner/bannerlist',
  nearbydeler: '/bikedoctor/dealer/dealerWithInRange2',
  userbooking: '/bikedoctor/bookings/getuserbookings',
  mybikes: '/bikedoctor/customers/getMyBikes',
  addUserBike: '/bikedoctor/customers/addUserBike',
  getbikecompanies: '/bikedoctor/bike/get-bike-companies',
  getbikemodels: '/bikedoctor/bike/get-bike-models/:company_id',
  getbikevariants: '/bikedoctor/bike//get-bike-variants/:model_id',
};
