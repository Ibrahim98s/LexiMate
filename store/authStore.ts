import { create } from 'zustand';
import * as authService from '../services/authService';

type AuthState = {
    isAuthenticated: boolean;
    isLoading: boolean;
    userName: string | null;
    userEmail: string | null;
    isPremium: boolean;
    premiumExpiresAt: string | null;
    pendingVerificationEmail: string | null;
    scansUsed: number;
    scanLimit: number;
    login: (email: string, password: string) => Promise<void>;
    register: (fullName: string, email: string, password: string) => Promise<void>;
    verifyEmail: (email: string, code: string) => Promise<void>;
    resendCode: (email: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    setPremiumStatus: (isPremium: boolean, premiumExpiresAt: string | null) => void;
    updateProfile: (fullName: string, email: string) => Promise<void>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
    deleteAccount: (password: string) => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: false,
    isLoading: true,
    userName: null,
    userEmail: null,
    isPremium: false,
    premiumExpiresAt: null,
    pendingVerificationEmail: null,
    scansUsed: 0,
    scanLimit: 5,

    login: async (email, password) => {
        const data = await authService.login(email, password);
        set({
            isAuthenticated: true,
            userName: data.fullName,
            userEmail: data.email,
            isPremium: data.isPremium ?? false,
            premiumExpiresAt: data.premiumExpiresAt ?? null,
            scansUsed: data.scansUsed ?? 0,
            scanLimit: data.scanLimit ?? 5,
        });
    },

    register: async (fullName, email, password) => {
        const data = await authService.register(fullName, email, password);
        set({ pendingVerificationEmail: data.email });
    },

    verifyEmail: async (email, code) => {
        const data = await authService.verifyEmail(email, code);
        set({
            isAuthenticated: true,
            userName: data.fullName,
            userEmail: data.email,
            isPremium: data.isPremium ?? false,
            premiumExpiresAt: data.premiumExpiresAt ?? null,
            pendingVerificationEmail: null,
            scansUsed: data.scansUsed ?? 0,
            scanLimit: data.scanLimit ?? 5,
        });
    },

    resendCode: async (email) => {
        await authService.resendCode(email);
    },

    logout: async () => {
        await authService.logout();
        set({ isAuthenticated: false, userName: null, userEmail: null, isPremium: false, premiumExpiresAt: null, scansUsed: 0, scanLimit: 5 });
    },

    checkAuth: async () => {
        const token = await authService.getToken();

        if (!token) {
            set({ isAuthenticated: false, isLoading: false });
            return;
        }

        try {
            const user = await authService.getCurrentUser();
            set({
                isAuthenticated: true,
                userName: user.fullName,
                userEmail: user.email,
                isPremium: user.isPremium ?? false,
                premiumExpiresAt: user.premiumExpiresAt ?? null,
                scansUsed: user.scansUsed ?? 0,
                scanLimit: user.scanLimit ?? 5,
                isLoading: false,
            });
        } catch (error) {
            await authService.logout();
            set({ isAuthenticated: false, userName: null, userEmail: null, isPremium: false, premiumExpiresAt: null, scansUsed: 0, scanLimit: 5, isLoading: false });
        }
    },

    setPremiumStatus: (isPremium, premiumExpiresAt) => {
        set({ isPremium, premiumExpiresAt });
    },

    updateProfile: async (fullName, email) => {
        const data = await authService.updateProfile(fullName, email);
        set({ userName: data.fullName, userEmail: data.email });
    },

    changePassword: async (currentPassword, newPassword) => {
        await authService.changePassword(currentPassword, newPassword);
    },

    deleteAccount: async (password) => {
        await authService.deleteAccount(password);
        await authService.logout();
        set({ isAuthenticated: false, userName: null, userEmail: null, isPremium: false, premiumExpiresAt: null, scansUsed: 0, scanLimit: 5 });
    },
}));