import React, { useEffect, useRef, useState } from 'react';
import {
    View, Text, ScrollView, StyleSheet,
    Animated, TouchableOpacity, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../services/api';
import type { DocumentAnalysisResult } from '../services/documentService';

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

export default function ResultsScreen() {
    const { documentId } = useLocalSearchParams<{ documentId?: string }>();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<DocumentAnalysisResult | null>(null);
    const [error, setError] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(24)).current;

    useEffect(() => {
        async function fetchDocument() {
            if (!documentId) {
                setError(true);
                setLoading(false);
                return;
            }
            try {
                const response = await api.get(`/documents/${documentId}`);
                setResult(response.data);
            } catch (e) {
                console.log('Failed to fetch document:', e);
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        fetchDocument();
    }, [documentId]);

    useEffect(() => {
        if (!loading && result) {
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
            ]).start();
        }
    }, [loading, result]);

    return (
        <LinearGradient colors={['#0A1628', '#0F1F3A']} style={styles.container}>
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(tabs)')}>
                        <Ionicons name="arrow-back" size={20} color="#F0F4FF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {result?.title ?? 'Document'}
                    </Text>
                    <View style={{ width: 36 }} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {loading ? (
                        <View style={styles.centered}>
                            <ActivityIndicator size="large" color="#2DD4BF" />
                            <Text style={styles.loadingText}>Loading document...</Text>
                        </View>
                    ) : error || !result ? (
                        <View style={styles.centered}>
                            <View style={styles.emptyIconCircle}>
                                <Ionicons name="alert-circle-outline" size={28} color="#EF4444" />
                            </View>
                            <Text style={styles.errorTitle}>Couldn't load document</Text>
                            <Text style={styles.errorText}>
                                Please try scanning again or check your connection.
                            </Text>
                            <TouchableOpacity
                                style={styles.retryButton}
                                onPress={() => router.replace('/scan')}
                            >
                                <Ionicons name="camera-outline" size={16} color="#F0F4FF" />
                                <Text style={styles.retryButtonText}>Scan Again</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <Animated.View style={{
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        }}>
                            {/* Risk overview card */}
                            <View style={[styles.overviewCard, { borderColor: riskColor(result.riskLevel) }]}>
                                <View style={styles.overviewTop}>
                                    <View style={[styles.riskPill, { backgroundColor: riskBg(result.riskLevel) }]}>
                                        <Text style={[styles.riskPillText, { color: riskColor(result.riskLevel) }]}>
                                            {result.riskLevel ? result.riskLevel.toUpperCase() : '—'} RISK
                                        </Text>
                                    </View>
                                    <View style={styles.scoreCircle}>
                                        <Text style={[styles.scoreValue, { color: riskColor(result.riskLevel) }]}>
                                            {result.riskScore ?? '—'}
                                        </Text>
                                        <Text style={styles.scoreLabel}>/ 100</Text>
                                    </View>
                                </View>
                                <Text style={styles.docTitle}>{result.title}</Text>
                                <View style={styles.metaRow}>
                                    <View style={styles.metaChip}>
                                        <Ionicons name="language-outline" size={12} color="#8A9BBF" />
                                        <Text style={styles.metaChipText}>
                                            {result.originalLanguage?.toUpperCase() ?? '—'} → {result.targetLanguage?.toUpperCase() ?? '—'}
                                        </Text>
                                    </View>
                                    <View style={styles.metaChip}>
                                        <Ionicons name="calendar-outline" size={12} color="#8A9BBF" />
                                        <Text style={styles.metaChipText}>
                                            {new Date(result.createdAt).toLocaleDateString()}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Summary */}
                            <View style={styles.card}>
                                <View style={styles.cardLabelRow}>
                                    <Ionicons name="document-text-outline" size={14} color="#2DD4BF" />
                                    <Text style={[styles.cardLabel, { color: '#2DD4BF' }]}>SUMMARY</Text>
                                </View>
                                <Text style={styles.cardText}>
                                    {result.summary || 'No summary available.'}
                                </Text>
                            </View>

                            {/* Flagged points */}
                            {result.flaggedPoints && result.flaggedPoints.length > 0 && (
                                <View style={[styles.card, styles.flaggedCard]}>
                                    <View style={styles.cardLabelRow}>
                                        <Ionicons name="warning-outline" size={14} color="#EF4444" />
                                        <Text style={[styles.cardLabel, { color: '#EF4444' }]}>
                                            FLAGGED POINTS · {result.flaggedPoints.length}
                                        </Text>
                                    </View>
                                    {result.flaggedPoints.map((point, idx) => (
                                        <View key={idx} style={styles.flaggedItem}>
                                            <View style={styles.flaggedDot} />
                                            <Text style={styles.flaggedText}>{point}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Translation */}
                            <View style={[styles.card, styles.translationCard]}>
                                <View style={styles.cardLabelRow}>
                                    <Ionicons name="language-outline" size={14} color="#8A9BBF" />
                                    <Text style={styles.cardLabel}>FULL TRANSLATION</Text>
                                </View>
                                <Text style={styles.cardText}>
                                    {result.translation || 'No translation available.'}
                                </Text>
                            </View>
                        </Animated.View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomColor: '#2A4470',
        borderBottomWidth: 1,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#132240',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        flex: 1,
        color: '#F0F4FF',
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
        marginHorizontal: 8,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 48,
    },
    centered: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
        gap: 10,
    },
    loadingText: {
        color: '#8A9BBF',
        fontSize: 14,
        marginTop: 12,
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
    errorTitle: {
        color: '#F0F4FF',
        fontSize: 16,
        fontWeight: '600',
    },
    errorText: {
        color: '#8A9BBF',
        fontSize: 13,
        textAlign: 'center',
        maxWidth: 240,
        lineHeight: 18,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#1B4FD8',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginTop: 8,
    },
    retryButtonText: {
        color: '#F0F4FF',
        fontSize: 14,
        fontWeight: '600',
    },
    overviewCard: {
        backgroundColor: '#132240',
        borderWidth: 1.5,
        borderRadius: 16,
        padding: 18,
        marginBottom: 14,
    },
    overviewTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    riskPill: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    riskPillText: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    scoreCircle: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 2,
    },
    scoreValue: {
        fontSize: 28,
        fontWeight: '800',
    },
    scoreLabel: {
        color: '#8A9BBF',
        fontSize: 13,
    },
    docTitle: {
        color: '#F0F4FF',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
        lineHeight: 24,
    },
    metaRow: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    metaChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#0A1628',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    metaChipText: {
        color: '#8A9BBF',
        fontSize: 11,
    },
    card: {
        backgroundColor: '#132240',
        borderColor: '#2A4470',
        borderWidth: 1,
        borderRadius: 14,
        padding: 16,
        marginBottom: 14,
    },
    translationCard: {
        borderColor: '#2A4470',
    },
    flaggedCard: {
        borderColor: 'rgba(239,68,68,0.3)',
        borderLeftWidth: 3,
        borderLeftColor: '#EF4444',
    },
    cardLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 10,
    },
    cardLabel: {
        color: '#8A9BBF',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
    },
    cardText: {
        color: '#F0F4FF',
        fontSize: 15,
        lineHeight: 23,
    },
    flaggedItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 8,
    },
    flaggedDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#EF4444',
        marginTop: 7,
    },
    flaggedText: {
        flex: 1,
        color: '#F0F4FF',
        fontSize: 14,
        lineHeight: 20,
    },
});