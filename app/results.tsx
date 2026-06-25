import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import RiskBadge from '../components/RiskBadge';

// Replace this with your real data fetch from documentService
const MOCK_RESULT = {
    riskLevel: 'medium' as 'low' | 'medium' | 'high',
    summary:
        'This agreement includes a non-standard indemnification clause that shifts liability disproportionately to one party. Review section 4 before signing.',
    translation:
        'Este acuerdo incluye una cláusula de indemnización no estándar que traslada la responsabilidad de manera desproporcionada a una de las partes. Revise la sección 4 antes de firmar.',
};

export default function ResultsScreen() {
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<typeof MOCK_RESULT | null>(null);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        const timer = setTimeout(() => {
            setResult(MOCK_RESULT);
            setLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!loading && result) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [loading, result]);

    return (
        <LinearGradient
            colors={['#0A1628', '#0F1F3A']}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Analyzing document...</Text>
                    </View>
                ) : (
                    result && (
                        <Animated.View
                            style={{
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            }}
                        >
                            <View style={styles.riskRow}>
                                <RiskBadge level={result.riskLevel} />
                            </View>

                            <View style={styles.card}>
                                <Text style={styles.cardLabel}>SUMMARY</Text>
                                <Text style={styles.cardText}>{result.summary}</Text>
                            </View>

                            <View style={[styles.card, styles.translationCard]}>
                                <Text style={[styles.cardLabel, styles.translationLabel]}>
                                    TRANSLATION
                                </Text>
                                <Text style={styles.cardText}>{result.translation}</Text>
                            </View>
                        </Animated.View>
                    )
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
    cardText: {
        color: '#F0F4FF',
        fontSize: 15,
        lineHeight: 22,
    },
});