import { Stack } from 'expo-router';

export default function RootLayout() {
    return (
        <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="scan" options={{ presentation: 'modal' }} />
            <Stack.Screen name="language-select" options={{ presentation: 'modal' }} />
            <Stack.Screen name="results" />
        </Stack>
    );
}