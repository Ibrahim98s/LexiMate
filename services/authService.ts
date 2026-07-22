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
    return response.data;
}

export async function verifyEmail(email: string, code: string) {
    const response = await api.post('/auth/verify-email', { email, code });
    const { token } = response.data;
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    return response.data;
}

export async function resendCode(email: string) {
    const response = await api.post('/auth/resend-code', { email });
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

export async function updateProfile(fullName: string, email: string) {
    const response = await api.put('/auth/me', { fullName, email });
    const { token } = response.data;
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    return response.data;
}

export async function changePassword(currentPassword: string, newPassword: string) {
    const response = await api.put('/auth/me/password', { currentPassword, newPassword });
    return response.data;
}

export async function deleteAccount(password: string) {
    const response = await api.delete('/auth/me', { data: { password } });
    return response.data;
}