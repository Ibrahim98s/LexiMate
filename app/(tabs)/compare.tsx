import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as documentService from '../../services/documentService';
import type { DocumentAnalysisResult } from '../../services/documentService';
import { useAuthStore } from '../../store/authStore';
import PremiumLock from '../../components/PremiumLock';
import ScreenBackground from '../../components/ScreenBackground';
import PremiumUnlockCelebration from '../../components/PremiumUnlockCelebration';

const riskColor = (level: DocumentAnalysisResult['riskLevel']) => {
    switch (level) {
        case 'low': return '#22C55E';
        case 'medium': return '#F59E0B';
        case 'high': return '#EF4444';
        default: return '#8A9BBF';
    }
};

const riskBg = (level: DocumentAnalysisResult['riskLevel']) => {
    switch (level) {
        case 'low': return 'rgba(34,197,94,0.12)';
        case 'medium': return 'rgba(245,158,11,0.12)';
        case 'high': return 'rgba(239,68,68,0.12)';
        default: return 'rgba(138,155,191,0.12)';
    }
};

const compareOrbs = [
    { color: '#1B4FD8', size: 220, opacity: 0.12, top: -50, left: -70 },
    { color: '#2DD4BF', size: 220, opacity: 0.12, top: -50, right: -70 },
];

export default function CompareScreen() {
    const isPremium = useAuthStore((state) => state.isPremium);
    const userEmail = useAuthStore((state) => state.userEmail);

    const [documents, setDocuments] = useState<DocumentAnalysisResult[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(true);
    const [docA, setDocA] = useState<DocumentAnalysisResult | null>(null);
    const [docB, setDocB] = useState<DocumentAnalysisResult | null>(null);
    const [showCelebration, setShowCelebration] = useState(false);

    useEffect(() => {
        if (!isPremium) return;
        loadHistory();
    }, [isPremium]);

    useEffect(() => {
        if (!isPremium) return;
        (async () => {
            const key = `leximate_compare_unlocked_${userEmail || 'anon'}`;
            const seen = await AsyncStorage.getItem(key);
            if (!seen) {
                setShowCelebration(true);
                await AsyncStorage.setItem(key, 'true');
            }
        })();
    }, [isPremium, userEmail]);

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

    if (!isPremium) {
        return (
            <PremiumLock
                icon="git-compare-outline"
                title="Compare is a Premium Feature"
                description="Compare two document versions side by side to see exactly what changed in risk score and flagged clauses."
                orbs={compareOrbs}
            />
        );
    }

    const reset = () => {
        setDocA(null);
        setDocB(null);
    };

    const handlePick = (doc: DocumentAnalysisResult) => {
        if (docA?.id === doc.id) { setDocA(null); return; }
        if (docB?.id === doc.id) { setDocB(null); return; }
        if (!docA) { setDocA(doc); }
        else if (!docB) { setDocB(doc); }
    };

    const celebrationOverlay = showCelebration ? (
        <PremiumUnlockCelebration
            icon="git-compare"
            title="Compare Unlocked!"
            subtitle="See exactly what changed between any two documents."
            onFinish={() => setShowCelebration(false)}
        />
    ) : null;

    if (!docA || !docB) {
        return (
            <ScreenBackground style={styles.container} orbs={compareOrbs}>
                <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                    <View style={styles.header}>
                        <View style={styles.headerTop}>
                            <Text style={styles.heading}>Compare</Text>
                            <View style={styles.proChip}>
                                <Ionicons name="star" size={11} color="#F59E0B" />
                                <Text style={styles.proChipText}>PRO</Text>
                            </View>
                        </View>
                        <Text style={styles.subheading}>Pick two documents to compare risk and terms</Text>
                    </View>

                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        {loadingDocs ? (
                            <ActivityIndicator color="#2DD4BF" style={{ marginTop: 32 }} />
                        ) : documents.length < 2 ? (
                            <View style={styles.emptyState}>
                                <View style={styles.emptyIconCircle}>
                                    <Ionicons name="git-compare-outline" size={28} color="#4A5A7A" />
                                </View>
                                <Text style={styles.emptyTitle}>Not enough documents</Text>
                                <Text style={styles.emptySubtitle}>
                                    You need at least two scanned documents to compare.
                                </Text>
                            </View>
                        ) : (
                            <>
                                <View style={styles.selectionRow}>
                                    <View style={[styles.selectionSlot, docA && styles.selectionSlotFilled]}>
                                        <Text style={styles.slotLabel}>A</Text>
                                        <Text style={styles.slotTitle} numberOfLines={1}>
                                            {docA ? docA.title : 'Not selected'}
                                        </Text>
                                    </View>
                                    <Ionicons name="swap-horizontal" size={20} color="#2DD4BF" />
                                    <View style={[styles.selectionSlot, docB && styles.selectionSlotFilled]}>
                                        <Text style={styles.slotLabel}>B</Text>
                                        <Text style={styles.slotTitle} numberOfLines={1}>
                                            {docB ? docB.title : 'Not selected'}
                                        </Text>
                                    </View>
                                </View>

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
                                                activeOpacity={0.75}
                                            >
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.pickTitle} numberOfLines={1}>
                                                        {item.title}
                                                    </Text>
                                                    <Text style={styles.pickDate}>
                                                        {new Date(item.createdAt).toLocaleDateString()}
                                                        {item.riskScore != null ? ` · Risk ${item.riskScore}/100` : ''}
                                                    </Text>
                                                </View>
                                                {item.riskLevel && (
                                                    <View style={[styles.riskPillSmall, { backgroundColor: riskBg(item.riskLevel) }]}>
                                                        <Text style={[styles.riskPillSmallText, { color: riskColor(item.riskLevel) }]}>
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

                                {(docA || docB) && (
                                    <TouchableOpacity style={styles.clearButton} onPress={reset}>
                                        <Ionicons name="close-circle-outline" size={15} color="#8A9BBF" />
                                        <Text style={styles.clearButtonText}>Clear selection</Text>
                                    </TouchableOpacity>
                                )}
                            </>
                        )}
                    </ScrollView>
                </SafeAreaView>

                {celebrationOverlay}
            </ScreenBackground>
        );
    }

    const scoreA = docA.riskScore ?? 0;
    const scoreB = docB.riskScore ?? 0;
    const scoreDelta = scoreB - scoreA;
    const pointsA = docA.flaggedPoints ?? [];
    const pointsB = docB.flaggedPoints ?? [];
    const newPoints = pointsB.filter((p) => !pointsA.includes(p));
    const resolvedPoints = pointsA.filter((p) => !pointsB.includes(p));

    return (
        <ScreenBackground style={styles.container} orbs={compareOrbs}>
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <Text style={styles.heading}>Compare</Text>
                        <View style={styles.proChip}>
                            <Ionicons name="star" size={11} color="#F59E0B" />
                            <Text style={styles.proChipText}>PRO</Text>
                        </View>
                    </View>
                    <Text style={styles.subheading}>Risk and clause changes between two documents</Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.compareRow}>
                        <View style={[styles.docCard, { borderColor: riskColor(docA.riskLevel) }]}>
                            <LinearGradient
                                colors={['#1B4FD8', '#2DD4BF']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.docCardStripe}
                            />
                            <View style={styles.docCardBadge}>
                                <Text style={styles.docCardBadgeText}>A</Text>
                            </View>
                            <Text style={styles.docTitle} numberOfLines={2}>{docA.title}</Text>
                            <Text style={styles.docDate}>{new Date(docA.createdAt).toLocaleDateString()}</Text>
                            {docA.riskLevel && (
                                <View style={[styles.riskPill, { backgroundColor: riskBg(docA.riskLevel) }]}>
                                    <Text style={[styles.riskPillText, { color: riskColor(docA.riskLevel) }]}>
                                        {docA.riskLevel.toUpperCase()}
                                    </Text>
                                </View>
                            )}
                            <Text style={styles.scoreText}>{scoreA}<Text style={styles.scoreUnit}>/100</Text></Text>
                        </View>

                        <View style={styles.vsContainer}>
                            <LinearGradient
                                colors={['#1B4FD8', '#2DD4BF']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.vsCircle}
                            >
                                <Ionicons name="git-compare-outline" size={20} color="#FFFFFF" />
                            </LinearGradient>
                        </View>

                        <View style={[styles.docCard, { borderColor: riskColor(docB.riskLevel) }]}>
                            <LinearGradient
                                colors={['#2DD4BF', '#1B4FD8']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.docCardStripe}
                            />
                            <View style={styles.docCardBadge}>
                                <Text style={styles.docCardBadgeText}>B</Text>
                            </View>
                            <Text style={styles.docTitle} numberOfLines={2}>{docB.title}</Text>
                            <Text style={styles.docDate}>{new Date(docB.createdAt).toLocaleDateString()}</Text>
                            {docB.riskLevel && (
                                <View style={[styles.riskPill, { backgroundColor: riskBg(docB.riskLevel) }]}>
                                    <Text style={[styles.riskPillText, { color: riskColor(docB.riskLevel) }]}>
                                        {docB.riskLevel.toUpperCase()}
                                    </Text>
                                </View>
                            )}
                            <Text style={styles.scoreText}>{scoreB}<Text style={styles.scoreUnit}>/100</Text></Text>
                        </View>
                    </View>

                    <View style={[styles.deltaCard, {
                        borderLeftColor: scoreDelta < 0 ? '#22C55E' : scoreDelta > 0 ? '#EF4444' : '#2DD4BF'
                    }]}>
                        <View style={styles.deltaHeaderRow}>
                            <View style={[
                                styles.deltaIconCircle,
                                { backgroundColor: scoreDelta < 0 ? 'rgba(34,197,94,0.15)' : scoreDelta > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(45,212,191,0.15)' }
                            ]}>
                                <Ionicons
                                    name={scoreDelta < 0 ? 'trending-down' : scoreDelta > 0 ? 'trending-up' : 'remove'}
                                    size={16}
                                    color={scoreDelta < 0 ? '#22C55E' : scoreDelta > 0 ? '#EF4444' : '#2DD4BF'}
                                />
                            </View>
                            <Text style={styles.deltaLabel}>RISK CHANGE</Text>
                        </View>
                        <Text style={[styles.deltaValue, {
                            color: scoreDelta < 0 ? '#22C55E' : scoreDelta > 0 ? '#EF4444' : '#8A9BBF'
                        }]}>
                            {scoreDelta > 0 ? '+' : ''}{scoreDelta} points
                        </Text>
                        <Text style={styles.deltaSub}>
                            {scoreDelta < 0
                                ? '✓ The second document has lower overall risk.'
                                : scoreDelta > 0
                                    ? '⚠ The second document has higher overall risk.'
                                    : 'Risk score is unchanged between these documents.'}
                        </Text>
                    </View>

                    {newPoints.length > 0 && (
                        <View style={styles.pointsCard}>
                            <View style={styles.pointsLabelRow}>
                                <Ionicons name="alert-circle" size={14} color="#EF4444" />
                                <Text style={[styles.pointsLabel, { color: '#EF4444' }]}>NEW FLAGGED POINTS</Text>
                            </View>
                            {newPoints.map((p, i) => (
                                <Text key={i} style={styles.pointText}>• {p}</Text>
                            ))}
                        </View>
                    )}

                    {resolvedPoints.length > 0 && (
                        <View style={styles.pointsCard}>
                            <View style={styles.pointsLabelRow}>
                                <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
                                <Text style={[styles.pointsLabel, { color: '#22C55E' }]}>RESOLVED POINTS</Text>
                            </View>
                            {resolvedPoints.map((p, i) => (
                                <Text key={i} style={styles.pointText}>• {p}</Text>
                            ))}
                        </View>
                    )}

                    {newPoints.length === 0 && resolvedPoints.length === 0 && (
                        <View style={styles.noChangeCard}>
                            <Ionicons name="checkmark-done-circle" size={20} color="#2DD4BF" />
                            <Text style={styles.noChangeText}>No changes in flagged points between these documents.</Text>
                        </View>
                    )}

                    <TouchableOpacity onPress={reset}>
                        <LinearGradient
                            colors={['#1B4FD8', '#2DD4BF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.selectButton}
                        >
                            <Ionicons name="swap-horizontal" size={18} color="#F0F4FF" />
                            <Text style={styles.selectButtonText}>Compare Different Documents</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>

            {celebrationOverlay}
        </ScreenBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 14,
        borderBottomColor: '#2A4470',
        borderBottomWidth: 1,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    heading: {
        color: '#F0F4FF',
        fontSize: 22,
        fontWeight: '800',
    },
    proChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: 'rgba(245,158,11,0.12)',
        borderColor: 'rgba(245,158,11,0.3)',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    proChipText: {
        color: '#F59E0B',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    subheading: {
        color: '#8A9BBF',
        fontSize: 12,
        marginTop: 3,
    },
    scrollContent: { padding: 20, paddingBottom: 48 },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 48,
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
    emptySubtitle: {
        color: '#8A9BBF',
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 18,
        maxWidth: 240,
    },
    selectionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
    },
    selectionSlot: {
        flex: 1,
        backgroundColor: '#132240',
        borderColor: '#2A4470',
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
    },
    selectionSlotFilled: {
        borderColor: '#1B4FD8',
    },
    slotLabel: {
        color: '#2DD4BF',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 2,
    },
    slotTitle: {
        color: '#F0F4FF',
        fontSize: 12,
        fontWeight: '600',
    },
    pickRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#132240',
        borderColor: '#2A4470',
        borderWidth: 1,
        borderRadius: 14,
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
        borderRadius: 8,
        marginLeft: 8,
    },
    riskPillSmallText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    badge: {
        backgroundColor: '#1B4FD8',
        width: 26,
        height: 26,
        borderRadius: 13,
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 14,
    },
    clearButtonText: {
        color: '#8A9BBF',
        fontSize: 13,
    },
    compareRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    docCard: {
        flex: 1,
        backgroundColor: '#132240',
        borderWidth: 1.5,
        borderRadius: 14,
        padding: 14,
        paddingTop: 17,
        alignItems: 'center',
        overflow: 'hidden',
    },
    docCardStripe: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
    },
    docCardBadge: {
        backgroundColor: '#1B4FD8',
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    docCardBadgeText: {
        color: '#F0F4FF',
        fontSize: 11,
        fontWeight: '700',
    },
    vsContainer: {
        width: 44,
        alignItems: 'center',
    },
    vsCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#2DD4BF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 5,
    },
    docTitle: {
        color: '#F0F4FF',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 4,
    },
    docDate: {
        color: '#8A9BBF',
        fontSize: 11,
        marginBottom: 8,
    },
    riskPill: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        marginBottom: 6,
    },
    riskPillText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    scoreText: {
        color: '#F0F4FF',
        fontSize: 18,
        fontWeight: '700',
    },
    scoreUnit: {
        fontSize: 12,
        color: '#8A9BBF',
        fontWeight: '400',
    },
    deltaCard: {
        backgroundColor: '#132240',
        borderLeftWidth: 3,
        borderRadius: 12,
        padding: 16,
        marginBottom: 14,
    },
    deltaHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    deltaIconCircle: {
        width: 26,
        height: 26,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deltaLabel: {
        color: '#8A9BBF',
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 1,
    },
    deltaValue: {
        fontSize: 26,
        fontWeight: '800',
        marginBottom: 4,
    },
    deltaSub: {
        color: '#8A9BBF',
        fontSize: 13,
        lineHeight: 18,
    },
    pointsCard: {
        backgroundColor: '#132240',
        borderColor: '#2A4470',
        borderWidth: 1,
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
    },
    pointsLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 10,
    },
    pointsLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
    },
    pointText: {
        color: '#F0F4FF',
        fontSize: 14,
        lineHeight: 21,
        marginBottom: 4,
    },
    noChangeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#132240',
        borderColor: '#2A4470',
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
    },
    noChangeText: {
        color: '#8A9BBF',
        fontSize: 13,
        flex: 1,
        lineHeight: 18,
    },
    selectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: 14,
        paddingVertical: 14,
        marginTop: 4,
        shadowColor: '#2DD4BF',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    selectButtonText: {
        color: '#F0F4FF',
        fontSize: 15,
        fontWeight: '600',
    },
});