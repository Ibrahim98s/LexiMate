import { useState, useRef, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
    StyleSheet, Text, View, TouchableOpacity,
    KeyboardAvoidingView, Platform, TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';

export default function VerifyEmailScreen() {
    const router = useRouter();
    const { email } = useLocalSearchParams<{ email?: string }>();
    const verifyEmail = useAuthStore((state) => state.verifyEmail);
    const resendCode = useAuthStore((state) => state.resendCode);

    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendMessage, setResendMessage] = useState('');

    async function handleVerify() {
        setError('');
        setResendMessage('');

        if (!email) {
            setError('Missing email address. Please go back and register again.');
            return;
        }
        if (code.trim().length !== 6) {
            setError('Enter the 6-digit code from your email.');
            return;
        }

        setIsVerifying(true);
        try {
            await verifyEmail(email, code.trim());
            router.replace('/(tabs)');
        } catch (err: any) {
            const message = err?.response?.data?.error || 'Invalid or expired code. Please try again.';
            setError(message);
        } finally {
            setIsVerifying(false);
        }
    }

    async function handleResend() {
        setError('');
        setResendMessage('');

        if (!email) {
            setError('Missing email address. Please go back and register again.');
            return;
        }

        setIsResending(true);
        try {
            await resendCode(email);
            setResendMessage('A new code has been sent to your email.');
        } catch (err: any) {
            const message = err?.response?.data?.error || 'Could not resend code. Please try again.';
            setError(message);
        } finally {
            setIsResending(false);
        }
    }

    return (
        <LinearGradient colors={['#0A1628', '#0F1F3A']} style={styles.container}>
            <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View style={styles.content}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="mail-outline" size={32} color="#2DD4BF" />
                        </View>

                        <Text style={styles.title}>Verify your email</Text>
                        <Text style={styles.subtitle}>
                            We sent a 6-digit code to{'\n'}
                            <Text style={styles.emailText}>{email || 'your email'}</Text>
                        </Text>

                        <TextInput
                            style={styles.codeInput}
                            placeholder="000000"
                            placeholderTextColor="#4A5A7A"
                            keyboardType="number-pad"
                            maxLength={6}
                            value={code}
                            onChangeText={setCode}
                            textAlign="center"
                        />

                        {error ? (
                            <View style={styles.messageRow}>
                                <Ionicons name="alert-circle-outline" size={15} color="#EF4444" />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}
                        {resendMessage ? (
                            <View style={styles.messageRow}>
                                <Ionicons name="checkmark-circle-outline" size={15} color="#22C55E" />
                                <Text style={styles.successText}>{resendMessage}</Text>
                            </View>
                        ) : null}

                        <TouchableOpacity
                            style={[styles.verifyButton, isVerifying && styles.buttonDisabled]}
                            onPress={handleVerify}
                            disabled={isVerifying}
                        >
                            <Text style={styles.verifyButtonText}>
                                {isVerifying ? 'Verifying...' : 'Verify Email'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.resendButton}
                            onPress={handleResend}
                            disabled={isResending}
                        >
                            <Text style={styles.resendButtonText}>
                                {isResending ? 'Sending...' : "Didn't get a code? Resend"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                            <Text style={styles.backToLoginText}>Back to Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#132240',
        borderColor: '#2DD4BF',
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    title: {
        color: '#F0F4FF',
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        color: '#8A9BBF',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 28,
    },
    emailText: {
        color: '#F0F4FF',
        fontWeight: '600',
    },
    codeInput: {
        width: '100%',
        backgroundColor: '#132240',
        borderWidth: 1,
        borderColor: '#2A4470',
        borderRadius: 12,
        padding: 16,
        color: '#F0F4FF',
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: 8,
        marginBottom: 16,
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 16,
        width: '100%',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 13,
        flex: 1,
    },
    successText: {
        color: '#22C55E',
        fontSize: 13,
        flex: 1,
    },
    verifyButton: {
        width: '100%',
        backgroundColor: '#1B4FD8',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginBottom: 16,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    verifyButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    resendButton: {
        marginBottom: 24,
    },
    resendButtonText: {
        color: '#2DD4BF',
        fontSize: 14,
        fontWeight: '600',
    },
    backToLoginText: {
        color: '#8A9BBF',
        fontSize: 13,
    },
});