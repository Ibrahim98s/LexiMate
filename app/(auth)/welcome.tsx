import { useCallback, useRef } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenBackground from '../../components/ScreenBackground';

const FEATURES: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }[] = [
    {
        icon: 'camera-outline',
        title: 'Scan any document',
        body: 'Point your camera at a contract or legal document to get started',
    },
    {
        icon: 'language-outline',
        title: 'Instant translation',
        body: 'Understand documents in plain language, in the language you speak',
    },
    {
        icon: 'shield-checkmark-outline',
        title: 'Risk analysis',
        body: 'Spot risky clauses before you sign, with a clear risk score',
    },
];

// Slides in from left or right, fading in, with a spring settle.
// Returns { style, start } — animation only plays when start() is called.
function useSlideIn(delay: number, fromX: number) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateX = useRef(new Animated.Value(fromX)).current;

    const start = useCallback(() => {
        opacity.setValue(0);
        translateX.setValue(fromX);
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 400,
                delay,
                useNativeDriver: true,
            }),
            Animated.spring(translateX, {
                toValue: 0,
                delay,
                friction: 7,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return { style: { opacity, transform: [{ translateX }] }, start };
}

function usePopIn(delay: number) {
    const scale = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    const start = useCallback(() => {
        scale.setValue(0);
        opacity.setValue(0);
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 250,
                delay,
                useNativeDriver: true,
            }),
            Animated.spring(scale, {
                toValue: 1,
                delay,
                friction: 5,
                tension: 60,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return { style: { opacity, transform: [{ scale }] }, start };
}

function usePulse(delay: number) {
    const pulse = useRef(new Animated.Value(0)).current;
    const loopRef = useRef<Animated.CompositeAnimation | null>(null);

    const start = useCallback(() => {
        const timer = setTimeout(() => {
            loopRef.current = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulse, {
                        toValue: 1,
                        duration: 1200,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulse, {
                        toValue: 0,
                        duration: 1200,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                ])
            );
            loopRef.current.start();
        }, delay);
        return () => {
            clearTimeout(timer);
            loopRef.current?.stop();
        };
    }, []);

    return { pulse, start };
}

export default function WelcomeScreen() {
    const router = useRouter();

    const logoAnim = usePopIn(0);
    const brandNameAnim = useSlideIn(250, -60);
    const taglineAnim = useSlideIn(400, 60);

    const feature0 = useSlideIn(550, -80);
    const feature1 = useSlideIn(680, 80);
    const feature2 = useSlideIn(810, -80);
    const featureAnims = [feature0, feature1, feature2];

    const ctaAnim = usePopIn(1000);
    const buttonPulse = usePulse(1600);

    // Only starts animating once this screen is actually focused/visible —
    // not while it's mounted behind the splash overlay.
    useFocusEffect(
        useCallback(() => {
            logoAnim.start();
            brandNameAnim.start();
            taglineAnim.start();
            feature0.start();
            feature1.start();
            feature2.start();
            ctaAnim.start();
            const stopButton = buttonPulse.start();

            return () => {
                stopButton?.();
            };
        }, [])
    );

    const buttonScale = buttonPulse.pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] });

    return (
        <ScreenBackground
            orbs={[
                { color: '#2DD4BF', size: 300, opacity: 0.16, top: -90, left: -90 },
                { color: '#1B4FD8', size: 260, opacity: 0.13, bottom: -70, right: -70 },
            ]}
        >
            <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
                <View style={styles.content}>
                    <View style={styles.brandSection}>
                        <View style={styles.logoWrap}>
                            <View pointerEvents="none" style={[styles.logoGlow, { opacity: 0.3 }]} />
                            <Animated.View style={[styles.logoCircle, logoAnim.style]}>
                                <Ionicons name="document-text" size={36} color="#2DD4BF" />
                            </Animated.View>
                        </View>
                        <Animated.Text style={[styles.brandName, brandNameAnim.style]}>
                            LexiMate
                        </Animated.Text>
                        <Animated.Text style={[styles.brandTagline, taglineAnim.style]}>
                            Legal documents, simplified
                        </Animated.Text>
                    </View>

                    <View style={styles.featureList}>
                        {FEATURES.map((feature, index) => (
                            <Animated.View
                                key={feature.title}
                                style={[styles.featureRow, featureAnims[index].style]}
                            >
                                <View style={styles.featureIconCircle}>
                                    <Ionicons name={feature.icon} size={20} color="#2DD4BF" />
                                </View>
                                <View style={styles.featureText}>
                                    <Text style={styles.featureTitle}>{feature.title}</Text>
                                    <Text style={styles.featureBody}>{feature.body}</Text>
                                </View>
                            </Animated.View>
                        ))}
                    </View>

                    <Animated.View style={[styles.ctaSection, ctaAnim.style]}>
                        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={() => router.push('/(auth)/register')}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.primaryButtonText}>Get Started</Text>
                            </TouchableOpacity>
                        </Animated.View>

                        <TouchableOpacity
                            style={styles.loginRow}
                            onPress={() => router.push('/(auth)/login')}
                        >
                            <Text style={styles.footer}>Already have an account? </Text>
                            <Text style={styles.link}>Sign In</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </SafeAreaView>
        </ScreenBackground>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'space-between',
    },
    brandSection: {
        alignItems: 'center',
        marginTop: 48,
    },
    logoWrap: {
        width: 80,
        height: 80,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    logoGlow: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#2DD4BF',
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#132240',
        borderColor: '#2DD4BF',
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#2DD4BF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 4,
    },
    brandName: {
        color: '#F0F4FF',
        fontSize: 30,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    brandTagline: {
        color: '#8A9BBF',
        fontSize: 14,
        marginTop: 4,
    },
    featureList: {
        gap: 20,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 14,
    },
    featureIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#132240',
        borderColor: '#2A4470',
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureText: {
        flex: 1,
        paddingTop: 2,
    },
    featureTitle: {
        color: '#F0F4FF',
        fontSize: 15,
        fontWeight: '700',
    },
    featureBody: {
        color: '#8A9BBF',
        fontSize: 13,
        marginTop: 2,
        lineHeight: 18,
    },
    ctaSection: {
        width: '100%',
    },
    primaryButton: {
        backgroundColor: '#1B4FD8',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        color: '#F0F4FF',
        fontSize: 16,
        fontWeight: '700',
    },
    loginRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 18,
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