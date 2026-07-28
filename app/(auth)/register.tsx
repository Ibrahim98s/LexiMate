import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
    StyleSheet, Text, View, TouchableOpacity,
    KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import Input from '../../components/Input';
import ScreenBackground from '../../components/ScreenBackground';
import { useAuthStore } from '../../store/authStore';

export default function RegisterScreen() {
    const router = useRouter();
    const register = useAuthStore((state) => state.register);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    async function handleCreateAccount() {
        setFormError('');
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            await register(fullName.trim(), email.trim(), password);
            router.replace({ pathname: '/(auth)/verify-email', params: { email: email.trim() } });
        } catch (error: any) {
            const message = error?.response?.data?.error || 'Unable to create account. Please try again.';
            setFormError(message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <ScreenBackground
            orbs={[
                { color: '#1B4FD8', size: 260, opacity: 0.14, top: -50, left: -70 },
                { color: '#2DD4BF', size: 220, opacity: 0.13, bottom: -50, right: -60 },
            ]}
        >
            <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.brandSection}>
                            <View style={styles.logoCircle}>
                                <Ionicons name="document-text" size={32} color="#2DD4BF" />
                            </View>
                            <Text style={styles.brandName}>LexiMate</Text>
                            <Text style={styles.brandTagline}>Legal documents, simplified</Text>
                        </View>

                        <View style={styles.formSection}>
                            <Text style={styles.title}>Create account</Text>
                            <Text style={styles.subtitle}>Get started for free</Text>

                            <Input
                                placeholder="Full Name"
                                value={fullName}
                                onChangeText={setFullName}
                                error={nameError}
                            />

                            <Input
                                placeholder="Email address"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                                error={emailError}
                            />

                            <Input
                                placeholder="Password"
                                isPassword
                                value={password}
                                onChangeText={setPassword}
                                error={passwordError}
                            />

                            {formError ? (
                                <View style={styles.formErrorContainer}>
                                    <Ionicons name="alert-circle-outline" size={15} color="#EF4444" />
                                    <Text style={styles.formError}>{formError}</Text>
                                </View>
                            ) : null}

                            <Button
                                label="Create Account"
                                onPress={handleCreateAccount}
                                loading={isSubmitting}
                            />

                            <TouchableOpacity
                                style={styles.loginRow}
                                onPress={() => router.push('/(auth)/login')}
                            >
                                <Text style={styles.footer}>Already have an account? </Text>
                                <Text style={styles.link}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </ScreenBackground>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center',
    },
    brandSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#132240',
        borderColor: '#2DD4BF',
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        shadowColor: '#2DD4BF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 4,
    },
    brandName: {
        color: '#F0F4FF',
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    brandTagline: {
        color: '#8A9BBF',
        fontSize: 13,
        marginTop: 4,
    },
    formSection: {
        width: '100%',
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#F0F4FF',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#8A9BBF',
        marginBottom: 28,
    },
    formErrorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(239,68,68,0.1)',
        borderColor: 'rgba(239,68,68,0.35)',
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        marginBottom: 16,
    },
    formError: {
        color: '#EF4444',
        fontSize: 13,
        flex: 1,
    },
    loginRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    footer: {
        color: '#8A9BBF',
        fontSize: 14,
    },
    link: {
        color: '#2DD4BF',
        fontSize: 14,
        fontWeight: '700',
    },
});