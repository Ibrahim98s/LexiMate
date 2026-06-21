import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../../components/Button';
import Input from '../../components/Input';

export default function RegisterScreen() {
    const router = useRouter();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    function validate() {
        let valid = true;

        if (!fullName.trim()) {
            setNameError('Full name is required');
            valid = false;
        } else {
            setNameError('');
        }

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

    function handleCreateAccount() {
        if (!validate()) return;
        // Temporary — will be replaced with real Firebase auth later
        router.replace('/(tabs)');
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Get started with LexiMate</Text>

            <Input
                placeholder="Full Name"
                value={fullName}
                onChangeText={setFullName}
                error={nameError}
            />

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

            <Button label="Create Account" onPress={handleCreateAccount} />

            <Text style={styles.footer}>
                Already have an account?{' '}
                <Text style={styles.link} onPress={() => router.push('/(auth)/login')}>
                    Sign In
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