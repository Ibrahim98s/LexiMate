import { useRouter } from 'expo-router';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';

export default function LoginScreen() {
    const router = useRouter();
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to LexiMate</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#4A5A7A"
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#4A5A7A"
                secureTextEntry
            />

            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>

            <Text style={styles.footer}>
                Don't have an account?{' '}
                <Text style={styles.link} onPress={() => router.push('/(auth)/register')}>
                    Register
                </Text>
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A1628',
        padding: 24,
        justifyContent: 'center',
    },
    title: {
        fontSize: 30,
        fontWeight: '800',
        color: '#F0F4FF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: '#8A9BBF',
        marginBottom: 32,
    },
    input: {
        backgroundColor: '#132240',
        borderWidth: 1,
        borderColor: '#2A4470',
        borderRadius: 12,
        padding: 16,
        color: '#F0F4FF',
        fontSize: 15,
        marginBottom: 16,
    },
    button: {
        backgroundColor: '#1B4FD8',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        color: '#8A9BBF',
        textAlign: 'center',
        marginTop: 24,
        fontSize: 14,
    },
    link: {
        color: '#1B4FD8',
        fontWeight: '600',
    },
});