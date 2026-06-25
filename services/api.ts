import axios from 'axios';

// TODO: replace with real backend URL once Spring Boot + Neon is deployed (Week 2)
const BASE_URL = 'https://shortlist-epidermal-segment.ngrok-free.dev/api';

export const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    // TODO: attach Firebase auth token here once auth is wired up
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.log('API Error:', error?.response?.data || error.message);
        return Promise.reject(error);
    }
);