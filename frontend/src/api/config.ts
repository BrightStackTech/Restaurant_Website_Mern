import axios from 'axios';
import { toast } from 'react-toastify';

// Base URL configuration
const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api` || 'http://localhost:8000/api';

// Create an axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    if (response && response.status === 401) {
      // Only show "token expired" if the user is logged in
      const isLoggedIn = !!localStorage.getItem('auth_token');
      if (isLoggedIn) {
        toast.error('Your session has expired. Please log in again.');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { BASE_URL }; 