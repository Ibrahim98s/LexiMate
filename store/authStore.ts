import { create } from 'zustand';

type AuthState = {
    isAuthenticated: boolean;
    userName: string | null;
    userEmail: string | null;
    login: (name: string, email: string) => void;
    logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: false,
    userName: null,
    userEmail: null,
    login: (name, email) => set({ isAuthenticated: true, userName: name, userEmail: email }),
    logout: () => set({ isAuthenticated: false, userName: null, userEmail: null }),
}));