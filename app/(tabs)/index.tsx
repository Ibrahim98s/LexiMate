import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
    StyleSheet, Text, View, TouchableOpacity,
    ScrollView, Animated, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import Svg, { Path, Line, Circle } from 'react-native-svg';
import { getDocumentHistory, DocumentAnalysisResult } from '../../services/documentService';
import { useAuthStore } from '../../store/authStore';
import { useOnboardingStore } from '../../store/onboardingStore';
import OnboardingWalkthrough, { OnboardingStep } from '../../components/OnboardingWalkthrough';

const riskColor = (level: string | null) => {
    switch (level) {
        case 'low': return '#22C55E';
        case 'medium': return '#F59E0B';
        case 'high': return '#EF4444';
        default: return '#4A5A7A';
    }
};

const riskBg = (level: string | null) => {
    switch (level) {
        case 'low': return 'rgba(34,197,94,0.12)';
        case 'medium': return 'rgba(245,158,11,0.12)';
        case 'high': return 'rgba(239,68,68,0.12)';
        default: return 'rgba(74,90,122,0.12)';
    }
};

function ScaleGlyph({ size, color }: { size: number; color: string }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
            <Line x1="50" y1="10" x2="50" y2="82" stroke={color} strokeWidth="3" strokeLinecap="round" />
            <Line x1="18" y1="24" x2="82" y2="24" stroke={color} strokeWidth="3" strokeLinecap="round" />
            <Line x1="50" y1="86" x2="34" y2="94" stroke={color} strokeWidth="3" strokeLinecap="round" />
            <Line x1="50" y1="86" x2="66" y2="94" stroke={color} strokeWidth="3" strokeLinecap="round" />
            <Line x1="30" y1="94" x2="70" y2="94" stroke={color} strokeWidth="3" strokeLinecap="round" />
            <Line x1="18" y1="24" x2="8" y2="50" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            <Line x1="18" y1="24" x2="28" y2="50" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            <Path d="M6 50 Q18 64 30 50" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <Line x1="82" y1="24" x2="72" y2="50" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            <Line x1="82" y1="24" x2="92" y2="50" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            <Path d="M70 50 Q82 64 94 50" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <Circle cx="50" cy="14" r="5" stroke={color} strokeWidth="3" fill="none" />
        </Svg>
    );
}

function GavelGlyph({ size, color }: { size: number; color: string }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
            <Path d="M34 18 L52 36 L44 44 L26 26 Z" stroke={color} strokeWidth="3" strokeLinejoin="round" fill="none" />
            <Path d="M48 32 L66 50 L58 58 L40 40 Z" stroke={color} strokeWidth="3" strokeLinejoin="round" fill="none" />
            <Line x1="42" y1="46" x2="16" y2="72" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
            <Line x1="14" y1="86" x2="46" y2="86" stroke={color} strokeWidth="3" strokeLinecap="round" />
            <Line x1="58" y1="66" x2="86" y2="66" stroke={color} strokeWidth="3" strokeLinecap="round" />
            <Line x1="72" y1="52" x2="72" y2="80" stroke={color} strokeWidth="3" strokeLinecap="round" />
        </Svg>
    );
}

export default function HomeScreen() {
    const router = useRouter();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(24)).current;
    const scanPulse = useRef(new Animated.Value(1)).current;

    const [documents, setDocuments] = useState<DocumentAnalysisResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const userName = useAuthStore((state) => state.userName);
    const isPremium = useAuthStore((state) => state.isPremium);
    const scansUsed = useAuthStore((state) => state.scansUsed);
    const scanLimit = useAuthStore((state) => state.scanLimit);
    const firstName = userName ? userName.split(' ')[0] : null;

    const justRegistered = useOnboardingStore((state) => state.justRegistered);
    const hasSeenOnboarding = useOnboardingStore((state) => state.hasSeenOnboarding);
    const isHydrated = useOnboardingStore((state) => state.isHydrated);
    const completeOnboarding = useOnboardingStore((state) => state.completeOnboarding);

    const scanRef = useRef<View>(null);
    const statsRef = useRef<View>(null);
    const recentDocsRef = useRef<View>(null);
    const upgradeRef = useRef<View>(null);

    const [showOnboarding, setShowOnboarding] = useState(false);

    const loadHistory = useCallback(async () => {
        try {
            const data = await getDocumentHistory();
            setDocuments(data);
        } catch (error) {
            console.log('Failed to load history:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            void loadHistory();
        }, [loadHistory])
    );

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(scanPulse, { toValue: 1.03, duration: 1000, useNativeDriver: true }),
                Animated.timing(scanPulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    useEffect(() => {
        if (isHydrated && justRegistered && !hasSeenOnboarding && !isLoading) {
            const timeout = setTimeout(() => setShowOnboarding(true), 400);
            return () => clearTimeout(timeout);
        }
    }, [isHydrated, justRegistered, hasSeenOnboarding, isLoading]);

    const recentDocs = documents.slice(0, 3);
    const highRiskCount = documents.filter((d) => d.riskLevel === 'high').length;
    const languageCount = new Set(documents.map((d) => d.targetLanguage)).size;
    const scansRemaining = Math.max(scanLimit - scansUsed, 0);

    const onboardingSteps: OnboardingStep[] = [
        {
            ref: scanRef,
            title: 'Scan a document',
            description: 'Tap here to photograph any legal document — lease, contract, or court notice — and get an instant plain-language breakdown.',
        },
        {
            ref: statsRef,
            title: 'Track your documents',
            description: 'See how many documents you have scanned, how many are high-risk, and how many languages you have used.',
        },
        {
            ref: recentDocsRef,
            title: 'Recent documents',
            description: 'Your scanned documents show up here with a risk score. Tap any one to see the full breakdown.',
        },
        ...(!isPremium
            ? [{
                ref: upgradeRef,
                title: 'Go premium',
                description: 'Upgrade anytime for unlimited scans and full AI reports.',
            }]
            : []),
    ];

    function handleOnboardingComplete() {
        setShowOnboarding(false);
        void completeOnboarding();
    }

    return (
        <LinearGradient colors={['#0A1628', '#0F1F3A']} style={styles.gradient}>

            <View pointerEvents="none" style={styles.orbTopRight} />
            <View pointerEvents="none" style={styles.orbBottomLeft} />

            <View pointerEvents="none" style={styles.scaleIcon}>
                <ScaleGlyph size={220} color="#2DD4BF" />
            </View>
            <View pointerEvents="none" style={styles.gavelIcon}>
                <GavelGlyph size={190} color="#F0F4FF" />
            </View>

            <LinearGradient
                pointerEvents="none"
                colors={['rgba(0,0,0,0.28)', 'rgba(0,0,0,0)']}
                style={styles.topVignette}
            />

            <SafeAreaView style={styles.gradient} edges={['top']}>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    <View style={styles.header}>
                        <View>
                            <Text style={styles.greeting}>
                                {firstName ? `Hello, ${firstName} 👋` : 'Welcome back 👋'}
                            </Text>
                            <Text style={styles.subtitle}>Your legal documents, simplified</Text>
                        </View>
                        {isPremium && (
                            <View style={styles.premiumChip}>
                                <Ionicons name="star" size={12} color="#F59E0B" />
                                <Text style={styles.premiumChipText}>PRO</Text>
                            </View>
                        )}
                    </View>

                    <Animated.View
                        ref={scanRef}
                        collapsable={false}
                        style={{ transform: [{ scale: scanPulse }], marginBottom: !isPremium ? 8 : 28 }}
                    >
                        <View style={styles.scanGlowOuter} pointerEvents="none" />
                        <View style={styles.scanGlowInner} pointerEvents="none" />
                        <TouchableOpacity
                            style={styles.scanButton}
                            onPress={() => router.push('/scan')}
                            activeOpacity={0.85}
                        >
                            <LinearGradient
                                colors={['#1B4FD8', '#2DD4BF']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.scanButtonGradient}
                            >
                                <View style={styles.scanIconCircle}>
                                    <Ionicons name="camera" size={22} color="#1B4FD8" />
                                </View>
                                <View>
                                    <Text style={styles.scanButtonTitle}>Scan Document</Text>
                                    <Text style={styles.scanButtonSub}>Tap to analyze a legal document</Text>
                                </View>
                                <Ionicons name="arrow-forward" size={20} color="rgba(255,255,255,0.7)" style={{ marginLeft: 'auto' }} />
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>

                    {!isPremium && (
                        <View ref={upgradeRef} collapsable={false}>
                            <TouchableOpacity
                                style={styles.scansLeftRow}
                                onPress={() => router.push('/profile')}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={scansRemaining === 0 ? 'lock-closed' : 'flash-outline'}
                                    size={13}
                                    color={scansRemaining === 0 ? '#EF4444' : '#8A9BBF'}
                                />
                                <Text style={[styles.scansLeftText, scansRemaining === 0 && { color: '#EF4444' }]}>
                                    {scansRemaining === 0
                                        ? "You're out of free scans this month · Upgrade"
                                        : `${scansRemaining} free scan${scansRemaining === 1 ? '' : 's'} left this month · Upgrade`}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <Animated.View style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }}>
                        <View ref={statsRef} collapsable={false} style={styles.statsRow}>
                            <View style={styles.statCard}>
                                <View style={[styles.statIconCircle, { backgroundColor: 'rgba(27,79,216,0.15)' }]}>
                                    <Ionicons name="document-text-outline" size={18} color="#1B4FD8" />
                                </View>
                                <Text style={styles.statValue}>{documents.length}</Text>
                                <Text style={styles.statLabel}>Scanned</Text>
                            </View>
                            <View style={[styles.statCard, { borderColor: highRiskCount > 0 ? 'rgba(239,68,68,0.3)' : '#2A4470' }]}>
                                <View style={[styles.statIconCircle, { backgroundColor: 'rgba(239,68,68,0.15)' }]}>
                                    <Ionicons name="warning-outline" size={18} color="#EF4444" />
                                </View>
                                <Text style={[styles.statValue, highRiskCount > 0 && { color: '#EF4444' }]}>
                                    {highRiskCount}
                                </Text>
                                <Text style={styles.statLabel}>High Risk</Text>
                            </View>
                            <View style={styles.statCard}>
                                <View style={[styles.statIconCircle, { backgroundColor: 'rgba(45,212,191,0.15)' }]}>
                                    <Ionicons name="language-outline" size={18} color="#2DD4BF" />
                                </View>
                                <Text style={styles.statValue}>{languageCount}</Text>
                                <Text style={styles.statLabel}>Languages</Text>
                            </View>
                        </View>

                        <View ref={recentDocsRef} collapsable={false}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Recent Documents</Text>
                                <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
                                    <Text style={styles.sectionLink}>See all →</Text>
                                </TouchableOpacity>
                            </View>

                            {isLoading ? (
                                <ActivityIndicator size="small" color="#2DD4BF" style={{ marginTop: 20 }} />
                            ) : recentDocs.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <View style={styles.emptyIconCircle}>
                                        <Ionicons name="document-outline" size={28} color="#4A5A7A" />
                                    </View>
                                    <Text style={styles.emptyTitle}>No documents yet</Text>
                                    <Text style={styles.emptyText}>
                                        Scan your first legal document to get started
                                    </Text>
                                </View>
                            ) : (
                                recentDocs.map((doc) => (
                                    <TouchableOpacity
                                        key={doc.id}
                                        style={styles.docCard}
                                        onPress={() => router.push({ pathname: '/results', params: { documentId: doc.id.toString() } })}
                                        activeOpacity={0.75}
                                    >
                                        <View style={[styles.riskPill, { backgroundColor: riskBg(doc.riskLevel) }]}>
                                            <Text style={[styles.riskPillText, { color: riskColor(doc.riskLevel) }]}>
                                                {doc.riskLevel ? doc.riskLevel.toUpperCase() : '—'}
                                            </Text>
                                        </View>
                                        <View style={styles.docInfo}>
                                            <Text style={styles.docTitle} numberOfLines={1}>{doc.title}</Text>
                                            <Text style={styles.docMeta}>
                                                {new Date(doc.createdAt).toLocaleDateString()}
                                                {doc.riskScore != null ? ` · Risk ${doc.riskScore}/100` : ''}
                                            </Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={18} color="#4A5A7A" />
                                    </TouchableOpacity>
                                ))
                            )}
                        </View>
                    </Animated.View>
                </ScrollView>
            </SafeAreaView>

            {showOnboarding && (
                <OnboardingWalkthrough steps={onboardingSteps} onComplete={handleOnboardingComplete} />
            )}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: { flex: 1 },
    content: { padding: 24, paddingBottom: 48 },

    orbTopRight: {
        position: 'absolute',
        top: -80,
        right: -60,
        width: 260,
        height: 260,
        borderRadius: 130,
        backgroundColor: '#2DD4BF',
        opacity: 0.10,
    },
    orbBottomLeft: {
        position: 'absolute',
        bottom: 40,
        left: -100,
        width: 280,
        height: 280,
        borderRadius: 140,
        backgroundColor: '#1B4FD8',
        opacity: 0.12,
    },
    scaleIcon: {
        position: 'absolute',
        top: -30,
        right: -60,
        opacity: 0.07,
        transform: [{ rotate: '-12deg' }],
    },
    gavelIcon: {
        position: 'absolute',
        bottom: -20,
        left: -50,
        opacity: 0.06,
        transform: [{ rotate: '18deg' }],
    },
    topVignette: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 160,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    greeting: {
        fontSize: 24,
        fontWeight: '800',
        color: '#F0F4FF',
    },
    subtitle: {
        fontSize: 14,
        color: '#8A9BBF',
        marginTop: 3,
    },
    premiumChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(245,158,11,0.12)',
        borderColor: 'rgba(245,158,11,0.3)',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginTop: 4,
    },
    premiumChipText: {
        color: '#F59E0B',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
    },

    scanGlowOuter: {
        position: 'absolute',
        top: -20,
        left: '15%',
        right: '15%',
        height: 90,
        borderRadius: 45,
        backgroundColor: '#2DD4BF',
        opacity: 0.14,
    },
    scanGlowInner: {
        position: 'absolute',
        top: -6,
        left: '25%',
        right: '25%',
        height: 70,
        borderRadius: 35,
        backgroundColor: '#1B4FD8',
        opacity: 0.16,
    },
    scanButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#1B4FD8',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.45,
        shadowRadius: 16,
        elevation: 10,
    },
    scanButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 14,
    },
    scanIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scanButtonTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    scanButtonSub: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        marginTop: 2,
    },
    scansLeftRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginBottom: 20,
    },
    scansLeftText: {
        color: '#8A9BBF',
        fontSize: 12,
        fontWeight: '500',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 28,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#132240',
        borderColor: '#2A4470',
        borderWidth: 1,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        gap: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    statIconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
    },
    statValue: {
        color: '#F0F4FF',
        fontSize: 20,
        fontWeight: '700',
    },
    statLabel: {
        color: '#8A9BBF',
        fontSize: 11,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        color: '#F0F4FF',
        fontSize: 16,
        fontWeight: '700',
    },
    sectionLink: {
        color: '#2DD4BF',
        fontSize: 13,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 32,
        gap: 8,
    },
    emptyIconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#132240',
        borderColor: '#2A4470',
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    emptyTitle: {
        color: '#F0F4FF',
        fontSize: 15,
        fontWeight: '600',
    },
    emptyText: {
        color: '#8A9BBF',
        fontSize: 13,
        textAlign: 'center',
        maxWidth: 220,
    },
    docCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#132240',
        borderColor: '#2A4470',
        borderWidth: 1,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 3,
    },
    riskPill: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        minWidth: 52,
        alignItems: 'center',
    },
    riskPillText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    docInfo: {
        flex: 1,
    },
    docTitle: {
        color: '#F0F4FF',
        fontSize: 14,
        fontWeight: '600',
    },
    docMeta: {
        color: '#8A9BBF',
        fontSize: 12,
        marginTop: 2,
    },
});