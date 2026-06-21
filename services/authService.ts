import { api } from './api';

export async function login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
}

export async function register(fullName: string, email: string, password: string) {
    const response = await api.post('/auth/register', { fullName, email, password });
    return response.data;
}