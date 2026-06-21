import { api } from './api';

export type DocumentAnalysisResult = {
    id: string;
    summary: string;
    translation: string;
    riskLevel: 'low' | 'medium' | 'high';
    flaggedPoints: string[];
};

export async function uploadDocument(imageUri: string, targetLanguage: string): Promise<DocumentAnalysisResult> {
    // TODO: replace with real multipart upload once backend exists
    const formData = new FormData();
    formData.append('file', {
        uri: imageUri,
        name: 'document.jpg',
        type: 'image/jpeg',
    } as any);
    formData.append('targetLanguage', targetLanguage);

    const response = await api.post('/documents/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
}

export async function getDocumentHistory() {
    const response = await api.get('/documents/history');
    return response.data;
}