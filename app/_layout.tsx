import { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '../store/authStore';
import AnimatedSplashScreen from '../components/AnimatedSplashScreen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const checkAuth = useAuthStore((state) => state.checkAuth);
    const [showSplashOverlay, setShowSplashOverlay] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const onRootLayout = useCallback(() => {
        SplashScreen.hideAsync();
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: '#0A1628' }} onLayout={onRootLayout}>
            <Stack
                initialRouteName="index"
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: '#0A1628' },
                }}
            >
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="scan" options={{ presentation: 'modal' }} />
                <Stack.Screen name="language-select" options={{ presentation: 'modal' }} />
                <Stack.Screen name="results" />
                <Stack.Screen name="profile" options={{ presentation: 'modal' }} />
                <Stack.Screen name="help" options={{ presentation: 'modal' }} />
                <Stack.Screen name="account-settings" options={{ presentation: 'modal' }} />
            </Stack>

            {showSplashOverlay && (
                <AnimatedSplashScreen onFinish={() => setShowSplashOverlay(false)} />
            )}
        </View>
    );
}