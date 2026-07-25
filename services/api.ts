import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'https://leximate.onrender.com/api';

const TOKEN_KEY = 'leximate_auth_token';

export const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        console.log('API Error:', error?.response?.data || error.message);

        if (error?.response?.status === 401) {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
        }

        return Promise.reject(error);
    }
);