import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Assuming local testing with FastAPI
// Use your actual backend IP or domain here
const BASE_URL = 'http://10.0.2.2:8000/api'; // Android emulator localhost

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Add a request interceptor to inject the token
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle global errors (like 401 Unauthorized)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized (e.g., force logout)
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userRole');
      // A full app restart or navigation dispatch might be needed depending on your navigation setup
    }
    return Promise.reject(error);
  }
);

export default api;
