import axios from 'axios';


 export const base_url = {
  url: 'https://server-php-8-3.technorizen.com/braza/api',

}
export const API = axios.create({
  baseURL: 'https://server-php-8-3.technorizen.com/braza/api',

});
