import { api } from './api';

export type PaymentInitResponse = {
    authorizationUrl: string;
    reference: string;
};

export type PaymentVerifyResponse = {
    isPremium: boolean;
    premiumExpiresAt: string;
};

export async function initializePayment(): Promise<PaymentInitResponse> {
    const response = await api.post('/payments/initialize');
    return response.data;
}

export async function verifyPayment(reference: string): Promise<PaymentVerifyResponse> {
    const response = await api.post('/payments/verify', { reference });
    return response.data;
}