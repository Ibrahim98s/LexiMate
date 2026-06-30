import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export default function RootLayout() {
    const checkAuth = useAuthStore((state) => state.checkAuth);

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="scan" options={{ presentation: 'modal' }} />
            <Stack.Screen name="language-select" options={{ presentation: 'modal' }} />
            <Stack.Screen name="results" />
            <Stack.Screen name="profile" options={{ presentation: 'modal' }} />
        </Stack>
    );
}