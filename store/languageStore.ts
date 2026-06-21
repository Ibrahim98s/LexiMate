import { create } from 'zustand';

type LanguageState = {
    selectedLanguage: string;
    setSelectedLanguage: (code: string) => void;
};

export const useLanguageStore = create<LanguageState>((set) => ({
    selectedLanguage: 'en',
    setSelectedLanguage: (code) => set({ selectedLanguage: code }),
}));