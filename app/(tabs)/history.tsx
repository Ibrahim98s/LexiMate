import { useState, useCallback } from 'react';
import {
    StyleSheet, Text, View, FlatList, TouchableOpacity,
    ActivityIndicator, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { getDocumentHistory, DocumentAnalysisResult } from '../../services/documentService';
import ScreenBackground from '../../components/ScreenBackground';

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

export default function HistoryScreen() {
    const router = useRouter();
    const [documents, setDocuments] = useState<DocumentAnalysisResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const loadHistory = useCallback(async () => {
        try {
            const data = await getDocumentHistory();
            setDocuments(data);
        } catch (error) {
            console.log('Failed to load history:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadHistory();
        }, [loadHistory])
    );

    function handleRefresh() {
        setIsRefreshing(true);
        loadHistory();
    }

    return (
        <ScreenBackground
            style={styles.gradient}
            vignette={false}
            orbs={[
                { color: '#4A5A7A', size: 240, opacity: 0.08, bottom: -80, right: -60 },
                { color: '#2A4470', size: 180, opacity: 0.10, top: 100, left: -70 },
            ]}
        >
            <SafeAreaView style={styles.gradient} edges={['top']}>
                <View style={styles.header}>
                    <Text style={styles.title}>Document History</Text>
                    <Text style={styles.subtitle}>
                        {documents.length > 0 ? `${documents.length} document${documents.length === 1 ? '' : 's'} scanned` : 'All your scanned documents'}
                    </Text>
                </View>

                {isLoading ? (
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" color="#2DD4BF" />
                    </View>
                ) : documents.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconCircle}>
                            <Ionicons name="document-text-outline" size={28} color="#4A5A7A" />
                        </View>
                        <Text style={styles.emptyTitle}>No documents yet</Text>
                        <Text style={styles.emptySubtitle}>
                            Scanned and translated documents will show up here
                        </Text>
                        <TouchableOpacity
                            style={styles.scanPromptButton}
                            onPress={() => router.push('/scan')}
                        >
                            <Ionicons name="camera-outline" size={16} color="#F0F4FF" />
                            <Text style={styles.scanPromptText}>Scan your first document</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={documents}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefreshing}
                                onRefresh={handleRefresh}
                                tintColor="#2DD4BF"
                            />
                        }
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.docCard}
                                onPress={() => router.push({ pathname: '/results', params: { documentId: item.id.toString() } })}
                                activeOpacity={0.75}
                            >
                                <View style={[styles.riskPill, { backgroundColor: riskBg(item.riskLevel) }]}>
                                    <Text style={[styles.riskPillText, { color: riskColor(item.riskLevel) }]}>
                                        {item.riskLevel ? item.riskLevel.toUpperCase() : '—'}
                                    </Text>
                                </View>
                                <View style={styles.docInfo}>
                                    <Text style={styles.docTitle} numberOfLines={1}>{item.title}</Text>
                                    <Text style={styles.docMeta}>
                                        {new Date(item.createdAt).toLocaleDateString()}
                                        {item.riskScore != null ? ` · Risk ${item.riskScore}/100` : ''}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color="#4A5A7A" />
                            </TouchableOpacity>
                        )}
                    />
                )}
            </SafeAreaView>
        </ScreenBackground>
    );
}

const styles = StyleSheet.create({
    gradient: { flex: 1 },
    header: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 16,
        borderBottomColor: '#2A4470',
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#F0F4FF',
    },
    subtitle: {
        fontSize: 13,
        color: '#8A9BBF',
        marginTop: 3,
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listContent: {
        padding: 20,
        paddingBottom: 48,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingBottom: 80,
        paddingHorizontal: 40,
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
        fontSize: 16,
        fontWeight: '600',
    },
    emptySubtitle: {
        color: '#8A9BBF',
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 18,
    },
    scanPromptButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#1B4FD8',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginTop: 8,
    },
    scanPromptText: {
        color: '#F0F4FF',
        fontSize: 14,
        fontWeight: '600',
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