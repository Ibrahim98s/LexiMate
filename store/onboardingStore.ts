import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const ONBOARDING_KEY = 'has_seen_onboarding';

interface OnboardingState {
    hasSeenOnboarding: boolean;
    isHydrated: boolean;
    justRegistered: boolean;
    hydrate: () => Promise<void>;
    setJustRegistered: (value: boolean) => void;
    completeOnboarding: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
    hasSeenOnboarding: false,
    isHydrated: false,
    justRegistered: false,

    hydrate: async () => {
        try {
            const value = await SecureStore.getItemAsync(ONBOARDING_KEY);
            set({ hasSeenOnboarding: value === 'true', isHydrated: true });
        } catch (error) {
            console.log('Failed to hydrate onboarding state:', error);
            set({ isHydrated: true });
        }
    },

    setJustRegistered: (value: boolean) => set({ justRegistered: value }),

    completeOnboarding: async () => {
        try {
            await SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
        } catch (error) {
            console.log('Failed to persist onboarding state:', error);
        }
        set({ hasSeenOnboarding: true, justRegistered: false });
    },
}));