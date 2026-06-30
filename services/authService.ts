import { api } from './api';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'leximate_auth_token';

export async function login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    const { token } = response.data;
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    return response.data;
}

export async function register(fullName: string, email: string, password: string) {
    const response = await api.post('/auth/register', { fullName, email, password });
    const { token } = response.data;
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    return response.data;
}

export async function logout() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function getToken() {
    return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
}