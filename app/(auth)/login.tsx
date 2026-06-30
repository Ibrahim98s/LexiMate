import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useAuthStore } from '../../store/authStore';

export default function LoginScreen() {
    const router = useRouter();
    const login = useAuthStore((state) => state.login);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    function validate() {
        let valid = true;

        if (!email.trim()) {
            setEmailError('Email is required');
            valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setEmailError('Enter a valid email address');
            valid = false;
        } else {
            setEmailError('');
        }

        if (!password) {
            setPasswordError('Password is required');
            valid = false;
        } else if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            valid = false;
        } else {
            setPasswordError('');
        }

        return valid;
    }

    async function handleSignIn() {
        setFormError('');
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            await login(email.trim(), password);
            router.replace('/(tabs)');
        } catch (error: any) {
            const message = error?.response?.data?.error || 'Unable to sign in. Please try again.';
            setFormError(message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to LexiMate</Text>

            <Input
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                error={emailError}
            />

            <Input
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                error={passwordError}
            />

            {formError ? <Text style={styles.formError}>{formError}</Text> : null}

            <Button label="Sign In" onPress={handleSignIn} loading={isSubmitting} />

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
    formError: {
        color: '#FF6B6B',
        fontSize: 14,
        marginBottom: 16,
        textAlign: 'center',
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