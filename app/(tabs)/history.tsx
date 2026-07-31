import { useState, useCallback, useRef } from 'react';
import {
    StyleSheet, Text, View, FlatList, TouchableOpacity,
    ActivityIndicator, RefreshControl, Alert, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { Swipeable } from 'react-native-gesture-handler';
import { getDocumentHistory, deleteDocument, DocumentAnalysisResult } from '../../services/documentService';
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
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<DocumentAnalysisResult | null>(null);
    const swipeableRefs = useRef<Map<number, Swipeable>>(new Map());

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

    function confirmDelete(item: DocumentAnalysisResult) {
        setDeleteTarget(item);
    }

    function cancelDelete() {
        if (deleteTarget) {
            swipeableRefs.current.get(deleteTarget.id)?.close();
        }
        setDeleteTarget(null);
    }

    async function handleDelete() {
        if (!deleteTarget) return;
        const documentId = deleteTarget.id;
        setDeletingId(documentId);
        setDeleteTarget(null);
        try {
            await deleteDocument(documentId);
            swipeableRefs.current.delete(documentId);
            setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
        } catch (error) {
            console.log('Failed to delete document:', error);
            Alert.alert('Couldn\'t delete', 'Something went wrong. Please try again.');
            swipeableRefs.current.get(documentId)?.close();
        } finally {
            setDeletingId(null);
        }
    }

    function renderRightActions(item: DocumentAnalysisResult) {
        return (
            <TouchableOpacity
                style={styles.deleteAction}
                onPress={() => confirmDelete(item)}
                activeOpacity={0.8}
            >
                {deletingId === item.id ? (
                    <ActivityIndicator size="small" color="#F0F4FF" />
                ) : (
                    <>
                        <Ionicons name="trash-outline" size={20} color="#F0F4FF" />
                        <Text style={styles.deleteActionText}>Delete</Text>
                    </>
                )}
            </TouchableOpacity>
        );
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
                            <Swipeable
                                ref={(ref) => {
                                    if (ref) swipeableRefs.current.set(item.id, ref);
                                    else swipeableRefs.current.delete(item.id);
                                }}
                                renderRightActions={() => renderRightActions(item)}
                                overshootRight={false}
                            >
                                <TouchableOpacity
                                    style={styles.docCard}
                                    onPress={() => router.push({ pathname: '/results', params: { documentId: item.id.toString() } })}
                                    onLongPress={() => confirmDelete(item)}
                                    delayLongPress={400}
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
                            </Swipeable>
                        )}
                    />
                )}
            </SafeAreaView>

            <Modal
                visible={deleteTarget !== null}
                transparent
                animationType="fade"
                onRequestClose={cancelDelete}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalIconCircle}>
                            <Ionicons name="trash-outline" size={22} color="#EF4444" />
                        </View>
                        <Text style={styles.modalTitle}>Delete document?</Text>
                        <Text style={styles.modalMessage}>
                            "{deleteTarget?.title}" will be permanently removed. This can't be undone.
                        </Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.modalCancelButton} onPress={cancelDelete} activeOpacity={0.8}>
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalDeleteButton} onPress={handleDelete} activeOpacity={0.8}>
                                <Text style={styles.modalDeleteText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    deleteAction: {
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
        width: 84,
        borderRadius: 14,
        marginBottom: 10,
        marginLeft: 10,
        gap: 4,
    },
    deleteActionText: {
        color: '#F0F4FF',
        fontSize: 11,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(10,22,40,0.75)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    modalCard: {
        width: '100%',
        backgroundColor: '#132240',
        borderColor: '#2A4470',
        borderWidth: 1,
        borderRadius: 18,
        padding: 24,
        alignItems: 'center',
    },
    modalIconCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: 'rgba(239,68,68,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    modalTitle: {
        color: '#F0F4FF',
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 8,
    },
    modalMessage: {
        color: '#8A9BBF',
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 22,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 10,
        width: '100%',
    },
    modalCancelButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#1A2C4E',
        borderColor: '#2A4470',
        borderWidth: 1,
        alignItems: 'center',
    },
    modalCancelText: {
        color: '#F0F4FF',
        fontSize: 14,
        fontWeight: '600',
    },
    modalDeleteButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#EF4444',
        alignItems: 'center',
    },
    modalDeleteText: {
        color: '#F0F4FF',
        fontSize: 14,
        fontWeight: '600',
    },
});