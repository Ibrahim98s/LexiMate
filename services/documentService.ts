import { api } from './api';

export type DocumentAnalysisResult = {
    id: number;
    title: string;
    originalLanguage: string;
    targetLanguage: string;
    riskLevel: 'low' | 'medium' | 'high' | null;
    riskScore: number | null;
    summary: string | null;
    translation: string | null;
    flaggedPoints: string[];
    createdAt: string;
};

export async function uploadDocument(
    imageUri: string,
    targetLanguage: string
): Promise<DocumentAnalysisResult> {
    const formData = new FormData();
    formData.append('file', {
        uri: imageUri,
        name: 'document.jpg',
        type: 'image/jpeg',
    } as any);
    formData.append('targetLanguage', targetLanguage);

    const response = await api.post('/documents/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000, // analysis can take longer than a normal request
    });

    return response.data;
}

export async function getDocumentHistory(): Promise<DocumentAnalysisResult[]> {
    const response = await api.get('/documents/history');
    return response.data;
}

export async function askQuestion(
    documentId: number,
    question: string
): Promise<string> {
    const response = await api.post(`/documents/${documentId}/ask`, { question });
    return response.data.answer;
}