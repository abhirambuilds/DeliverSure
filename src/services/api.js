import storage from '../../utils/storage';
import axios from 'axios';

const BASE_URL = 'http://192.168.1.15:8000';

const api = axios.create({ baseURL: BASE_URL, timeout: 10000 });

api.interceptors.request.use(
  async (config) => {
    const token = await storage.getItem('userToken');
    if (token) config.headers.Authorization = 'Bearer ' + token;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      await storage.removeItem('userToken');
      await storage.removeItem('userRole');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
};
export const profileAPI = { getMe: () => api.get('/profiles/me') };
export const policiesAPI = {
  activate: (data) => api.post('/policies/activate', data),
  getActive: () => api.get('/policies/active'),
  cancel: (id) => api.post('/policies/cancel/' + id),
};
export const claimsAPI = {
  list: () => api.get('/claims/'),
  approve: (id) => api.post('/claims/approve/' + id),
};
export const disruptionsAPI = {
  list: () => api.get('/disruptions/'),
  scan: () => api.post('/disruptions/scan'),
};
export default api;
