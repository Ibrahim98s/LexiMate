import { create } from 'zustand';
import * as authService from '../services/authService';

type AuthState = {
    isAuthenticated: boolean;
    isLoading: boolean;
    userName: string | null;
    userEmail: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (fullName: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: false,
    isLoading: true,
    userName: null,
    userEmail: null,

    login: async (email, password) => {
        const data = await authService.login(email, password);
        set({ isAuthenticated: true, userName: data.fullName, userEmail: data.email });
    },

    register: async (fullName, email, password) => {
        const data = await authService.register(fullName, email, password);
        set({ isAuthenticated: true, userName: data.fullName, userEmail: data.email });
    },

    logout: async () => {
        await authService.logout();
        set({ isAuthenticated: false, userName: null, userEmail: null });
    },

    checkAuth: async () => {
        const token = await authService.getToken();

        if (!token) {
            set({ isAuthenticated: false, isLoading: false });
            return;
        }

        try {
            const user = await authService.getCurrentUser();
            set({ isAuthenticated: true, userName: user.fullName, userEmail: user.email, isLoading: false });
        } catch (error) {
            await authService.logout();
            set({ isAuthenticated: false, userName: null, userEmail: null, isLoading: false });
        }
    },
}));