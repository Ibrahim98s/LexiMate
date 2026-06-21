import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.greeting}>Welcome back 👋</Text>
            <Text style={styles.subtitle}>Let's make sense of your documents</Text>

            <TouchableOpacity style={styles.scanButton} onPress={() => router.push('/scan')}>
                <Ionicons name="camera-outline" size={22} color="#FFFFFF" />
                <Text style={styles.scanButtonText}>Scan New Document</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A1628',
        padding: 24,
    },
    greeting: {
        fontSize: 26,
        fontWeight: '800',
        color: '#F0F4FF',
    },
    subtitle: {
        fontSize: 15,
        color: '#8A9BBF',
        marginTop: 4,
        marginBottom: 24,
    },
    scanButton: {
        backgroundColor: '#1B4FD8',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    scanButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});