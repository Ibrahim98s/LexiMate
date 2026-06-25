import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import RiskBadge from '../components/RiskBadge';
import { api } from '../services/api';
import type { DocumentAnalysisResult } from '../services/documentService';

export default function ResultsScreen() {
    const { documentId } = useLocalSearchParams<{ documentId?: string }>();
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<DocumentAnalysisResult | null>(null);
    const [error, setError] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

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
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Analyzing document...</Text>
                    </View>
                ) : error || !result ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>
                            Couldn't load this document. Please try scanning again.
                        </Text>
                    </View>
                ) : (
                    <Animated.View
                        style={{
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        }}
                    >
                        <Text style={styles.docTitle}>{result.title}</Text>

                        <View style={styles.riskRow}>
                            <RiskBadge level={result.riskLevel ?? 'medium'} />
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.cardLabel}>SUMMARY</Text>
                            <Text style={styles.cardText}>{result.summary || 'No summary available.'}</Text>
                        </View>

                        <View style={[styles.card, styles.translationCard]}>
                            <Text style={[styles.cardLabel, styles.translationLabel]}>
                                TRANSLATION
                            </Text>
                            <Text style={styles.cardText}>{result.translation || 'No translation available.'}</Text>
                        </View>

                        {result.flaggedPoints && result.flaggedPoints.length > 0 && (
                            <View style={[styles.card, styles.flaggedCard]}>
                                <Text style={[styles.cardLabel, styles.flaggedLabel]}>FLAGGED POINTS</Text>
                                {result.flaggedPoints.map((point, idx) => (
                                    <Text key={idx} style={styles.flaggedItem}>• {point}</Text>
                                ))}
                            </View>
                        )}
                    </Animated.View>
                )}
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingTop: 40,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    },
    loadingText: {
        color: '#8A9BBF',
        fontSize: 16,
        textAlign: 'center',
    },
    docTitle: {
        color: '#F0F4FF',
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 16,
    },
    riskRow: {
        marginBottom: 20,
        alignItems: 'flex-start',
    },
    card: {
        backgroundColor: '#132240',
        borderColor: '#2A4470',
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    translationCard: {
        borderColor: '#2DD4BF',
        borderLeftWidth: 3,
    },
    flaggedCard: {
        borderColor: '#EF4444',
        borderLeftWidth: 3,
    },
    cardLabel: {
        color: '#8A9BBF',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
        marginBottom: 8,
    },
    translationLabel: {
        color: '#2DD4BF',
    },
    flaggedLabel: {
        color: '#EF4444',
    },
    cardText: {
        color: '#F0F4FF',
        fontSize: 15,
        lineHeight: 22,
    },
    flaggedItem: {
        color: '#F0F4FF',
        fontSize: 14,
        lineHeight: 20,
        marginTop: 4,
    },
});