import axios from 'axios';

const BASE_URL = 'https://realtime-todo-app.onrender.com/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL

});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
