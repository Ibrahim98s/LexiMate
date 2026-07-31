import { api } from './api';

export type LegalAidOffice = {
    name: string;
    address: string;
    phone: string;
    latitude: number;
    longitude: number;
};

export async function getNearbyLegalAid(
    lat: number,
    lng: number
): Promise<LegalAidOffice[]> {
    const response = await api.get('/legal-aid/nearby', {
        params: { lat, lng },
    });
    return response.data.results;
}