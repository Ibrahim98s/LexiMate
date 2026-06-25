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
    title: string,
    originalLanguage: string,
    targetLanguage: string
): Promise<DocumentAnalysisResult> {
    // TODO Week 4: switch to multipart/form-data once real file upload + OCR is wired up
    const response = await api.post('/documents/analyze', {
        title,
        originalLanguage,
        targetLanguage,
    });

    return response.data;
}

export async function getDocumentHistory(): Promise<DocumentAnalysisResult[]> {
    const response = await api.get('/documents/history');
    return response.data;
}