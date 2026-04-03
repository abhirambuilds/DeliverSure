import axios from "axios";
import storage from "../../utils/storage";

console.log("API URL:", process.env.EXPO_PUBLIC_API_BASE_URL);

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await storage.getItem("userToken");
    if (token) config.headers.Authorization = "Bearer " + token;
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
