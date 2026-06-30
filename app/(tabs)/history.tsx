import { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { getDocumentHistory, DocumentAnalysisResult } from '../../services/documentService';

const riskColor = (level: string | null) => {
    switch (level) {
        case 'low':
            return '#22C55E';
        case 'medium':
            return '#F59E0B';
        case 'high':
            return '#EF4444';
        default:
            return '#4A5A7A';
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

    if (isLoading) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Document History</Text>
                <View style={styles.emptyState}>
                    <ActivityIndicator size="large" color="#1B4FD8" />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Document History</Text>

            {documents.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="document-text-outline" size={48} color="#4A5A7A" />
                    <Text style={styles.emptyTitle}>No documents yet</Text>
                    <Text style={styles.emptySubtitle}>
                        Scanned and translated documents will show up here
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={documents}
                    keyExtractor={(item) => item.id.toString()}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#1B4FD8" />
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.docCard}
                            onPress={() => router.push({ pathname: '/results', params: { documentId: item.id.toString() } })}
                        >
                            <View style={[styles.riskDot, { backgroundColor: riskColor(item.riskLevel) }]} />
                            <View style={styles.docInfo}>
                                <Text style={styles.docTitle}>{item.title}</Text>
                                <Text style={styles.docDate}>
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#4A5A7A" />
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A1628',
        padding: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#F0F4FF',
        marginBottom: 24,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingBottom: 80,
    },
    emptyTitle: {
        color: '#F0F4FF',
        fontSize: 17,
        fontWeight: '600',
        marginTop: 8,
    },
    emptySubtitle: {
        color: '#8A9BBF',
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 32,
    },
    docCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#132240',
        borderColor: '#2A4470',
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        gap: 12,
    },
    riskDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    docInfo: {
        flex: 1,
    },
    docTitle: {
        color: '#F0F4FF',
        fontSize: 14,
        fontWeight: '600',
    },
    docDate: {
        color: '#8A9BBF',
        fontSize: 12,
        marginTop: 2,
    },
});