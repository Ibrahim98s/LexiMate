import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as documentService from '../../services/documentService';
import type { DocumentAnalysisResult } from '../../services/documentService';

const riskColor = (level: DocumentAnalysisResult['riskLevel']) => {
    switch (level) {
        case 'low':
            return '#22C55E';
        case 'medium':
            return '#F59E0B';
        case 'high':
            return '#EF4444';
        default:
            return '#8A9BBF';
    }
};

export default function CompareScreen() {
    const [documents, setDocuments] = useState<DocumentAnalysisResult[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(true);
    const [docA, setDocA] = useState<DocumentAnalysisResult | null>(null);
    const [docB, setDocB] = useState<DocumentAnalysisResult | null>(null);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const history = await documentService.getDocumentHistory();
            setDocuments(history);
        } catch (e) {
            console.log('Failed to load document history:', e);
        } finally {
            setLoadingDocs(false);
        }
    };

    const reset = () => {
        setDocA(null);
        setDocB(null);
    };

    const handlePick = (doc: DocumentAnalysisResult) => {
        if (docA?.id === doc.id) {
            setDocA(null);
            return;
        }
        if (docB?.id === doc.id) {
            setDocB(null);
            return;
        }
        if (!docA) {
            setDocA(doc);
        } else if (!docB) {
            setDocB(doc);
        }
    };

    // Picker view — shown until two documents are selected
    if (!docA || !docB) {
        return (
            <LinearGradient colors={['#0A1628', '#0F1F3A']} style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.heading}>Compare Documents</Text>
                    <Text style={styles.subheading}>
                        Pick two documents to see what changed in risk and terms
                    </Text>

                    {loadingDocs ? (
                        <ActivityIndicator color="#2DD4BF" style={{ marginTop: 20 }} />
                    ) : documents.length < 2 ? (
                        <Text style={styles.noDocsText}>
                            You need at least two scanned documents to compare. Scan another document to get started.
                        </Text>
                    ) : (
                        <FlatList
                            data={documents}
                            keyExtractor={(item) => item.id.toString()}
                            scrollEnabled={false}
                            renderItem={({ item }) => {
                                const isA = docA?.id === item.id;
                                const isB = docB?.id === item.id;
                                const isSelected = isA || isB;
                                return (
                                    <TouchableOpacity
                                        style={[styles.pickRow, isSelected && styles.pickRowSelected]}
                                        onPress={() => handlePick(item)}
                                    >
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.pickTitle} numberOfLines={1}>
                                                {item.title}
                                            </Text>
                                            <Text style={styles.pickDate}>
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </Text>
                                        </View>
                                        {item.riskLevel && (
                                            <View
                                                style={[
                                                    styles.riskPillSmall,
                                                    { backgroundColor: riskColor(item.riskLevel) },
                                                ]}
                                            >
                                                <Text style={styles.riskPillText}>
                                                    {item.riskLevel.toUpperCase()}
                                                </Text>
                                            </View>
                                        )}
                                        {isSelected && (
                                            <View style={styles.badge}>
                                                <Text style={styles.badgeText}>{isA ? 'A' : 'B'}</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    )}

                    {(docA || docB) && (
                        <TouchableOpacity style={styles.clearButton} onPress={reset}>
                            <Text style={styles.clearButtonText}>Clear selection</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </LinearGradient>
        );
    }

    // Comparison view — shown once two documents are picked
    const scoreA = docA.riskScore ?? 0;
    const scoreB = docB.riskScore ?? 0;
    const scoreDelta = scoreB - scoreA;

    const pointsA = docA.flaggedPoints ?? [];
    const pointsB = docB.flaggedPoints ?? [];
    const newPoints = pointsB.filter((p) => !pointsA.includes(p));
    const resolvedPoints = pointsA.filter((p) => !pointsB.includes(p));

    return (
        <LinearGradient colors={['#0A1628', '#0F1F3A']} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.heading}>Compare Documents</Text>
                <Text style={styles.subheading}>
                    Here's what changed in risk and terms between these two
                </Text>

                <View style={styles.compareRow}>
                    <View style={[styles.docCard, { borderColor: riskColor(docA.riskLevel) }]}>
                        <Text style={styles.docTitle} numberOfLines={2}>{docA.title}</Text>
                        <Text style={styles.docDate}>{new Date(docA.createdAt).toLocaleDateString()}</Text>
                        {docA.riskLevel && (
                            <View style={[styles.riskPill, { backgroundColor: riskColor(docA.riskLevel) }]}>
                                <Text style={styles.riskPillText}>{docA.riskLevel.toUpperCase()}</Text>
                            </View>
                        )}
                        <Text style={styles.scoreText}>{scoreA}/100</Text>
                    </View>

                    <View style={styles.vsContainer}>
                        <Ionicons name="git-compare-outline" size={28} color="#2DD4BF" />
                    </View>

                    <View style={[styles.docCard, { borderColor: riskColor(docB.riskLevel) }]}>
                        <Text style={styles.docTitle} numberOfLines={2}>{docB.title}</Text>
                        <Text style={styles.docDate}>{new Date(docB.createdAt).toLocaleDateString()}</Text>
                        {docB.riskLevel && (
                            <View style={[styles.riskPill, { backgroundColor: riskColor(docB.riskLevel) }]}>
                                <Text style={styles.riskPillText}>{docB.riskLevel.toUpperCase()}</Text>
                            </View>
                        )}
                        <Text style={styles.scoreText}>{scoreB}/100</Text>
                    </View>
                </View>

                <View style={styles.deltaCard}>
                    <Text style={styles.deltaLabel}>RISK CHANGE</Text>
                    <Text
                        style={[
                            styles.deltaValue,
                            { color: scoreDelta < 0 ? '#22C55E' : scoreDelta > 0 ? '#EF4444' : '#8A9BBF' },
                        ]}
                    >
                        {scoreDelta > 0 ? '+' : ''}
                        {scoreDelta} points
                    </Text>
                    <Text style={styles.deltaSub}>
                        {scoreDelta < 0
                            ? 'The second document has lower overall risk.'
                            : scoreDelta > 0
                                ? 'The second document has higher overall risk.'
                                : 'Risk score is unchanged between these documents.'}
                    </Text>
                </View>

                {newPoints.length > 0 && (
                    <View style={styles.pointsCard}>
                        <Text style={[styles.pointsLabel, { color: '#EF4444' }]}>NEW FLAGGED POINTS</Text>
                        {newPoints.map((p, i) => (
                            <Text key={i} style={styles.pointText}>• {p}</Text>
                        ))}
                    </View>
                )}

                {resolvedPoints.length > 0 && (
                    <View style={styles.pointsCard}>
                        <Text style={[styles.pointsLabel, { color: '#22C55E' }]}>RESOLVED POINTS</Text>
                        {resolvedPoints.map((p, i) => (
                            <Text key={i} style={styles.pointText}>• {p}</Text>
                        ))}
                    </View>
                )}

                {newPoints.length === 0 && resolvedPoints.length === 0 && (
                    <Text style={styles.noDocsText}>No changes in flagged points between these documents.</Text>
                )}

                <TouchableOpacity style={styles.selectButton} onPress={reset}>
                    <Text style={styles.selectButtonText}>Select Different Documents</Text>
                </TouchableOpacity>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 20, paddingTop: 24 },
    heading: {
        color: '#F0F4FF',
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 4,
    },
    subheading: {
        color: '#8A9BBF',
        fontSize: 14,
        marginBottom: 24,
    },
    noDocsText: {
        color: '#8A9BBF',
        fontSize: 14,
        marginTop: 12,
        lineHeight: 20,
    },
    pickRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#132240',
        borderColor: '#2A4470',
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
    },
    pickRowSelected: {
        borderColor: '#1B4FD8',
        borderWidth: 1.5,
    },
    pickTitle: {
        color: '#F0F4FF',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    pickDate: {
        color: '#8A9BBF',
        fontSize: 12,
    },
    riskPillSmall: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        marginLeft: 8,
    },
    badge: {
        backgroundColor: '#1B4FD8',
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    badgeText: {
        color: '#F0F4FF',
        fontSize: 12,
        fontWeight: '700',
    },
    clearButton: {
        alignItems: 'center',
        paddingVertical: 12,
        marginTop: 4,
    },
    clearButtonText: {
        color: '#8A9BBF',
        fontSize: 13,
    },
    compareRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    docCard: {
        flex: 1,
        backgroundColor: '#132240',
        borderWidth: 1.5,
        borderRadius: 14,
        padding: 14,
        alignItems: 'center',
    },
    vsContainer: {
        width: 40,
        alignItems: 'center',
    },
    docTitle: {
        color: '#F0F4FF',
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 4,
    },
    docDate: {
        color: '#8A9BBF',
        fontSize: 12,
        marginBottom: 10,
    },
    riskPill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 8,
    },
    riskPillText: {
        color: '#0A1628',
        fontSize: 11,
        fontWeight: '700',
    },
    scoreText: {
        color: '#F0F4FF',
        fontSize: 16,
        fontWeight: '700',
    },
    deltaCard: {
        backgroundColor: '#132240',
        borderColor: '#2DD4BF',
        borderLeftWidth: 3,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    deltaLabel: {
        color: '#8A9BBF',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
        marginBottom: 6,
    },
    deltaValue: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    deltaSub: {
        color: '#8A9BBF',
        fontSize: 13,
    },
    pointsCard: {
        backgroundColor: '#132240',
        borderColor: '#2A4470',
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    pointsLabel: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 8,
    },
    pointText: {
        color: '#F0F4FF',
        fontSize: 14,
        lineHeight: 21,
        marginBottom: 4,
    },
    selectButton: {
        backgroundColor: '#1B4FD8',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 4,
    },
    selectButtonText: {
        color: '#F0F4FF',
        fontSize: 15,
        fontWeight: '600',
    },
});