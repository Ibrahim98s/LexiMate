import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '../store/authStore';

export default function Index() {
    const isLoading = useAuthStore((state) => state.isLoading);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#0A1628', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#1B4FD8" />
            </View>
        );
    }

    return <Redirect href={isAuthenticated ? '/(tabs)' : '/(auth)/welcome'} />;
}