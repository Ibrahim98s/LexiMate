import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
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

type Message = {
    id: string;
    role: 'user' | 'assistant';
    text: string;
};

const askOrbs = [
    { color: '#2DD4BF', size: 260, opacity: 0.10, top: -60, right: -80 },
    { color: '#2DD4BF', size: 160, opacity: 0.08, bottom: 120, left: -60 },
];

function greetingFor(doc: DocumentAnalysisResult): Message {
    return {
        id: 'greeting',
        role: 'assistant',
        text: `Ask anything about "${doc.title}" — deadlines, clauses, or words you don't understand.`,
    };
}

export default function AskScreen() {
    const isPremium = useAuthStore((state) => state.isPremium);
    const userEmail = useAuthStore((state) => state.userEmail);

    const [documents, setDocuments] = useState<DocumentAnalysisResult[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(true);
    const [selectedDoc, setSelectedDoc] = useState<DocumentAnalysisResult | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isAsking, setIsAsking] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const listRef = useRef<FlatList>(null);

    useEffect(() => {
        if (!isPremium) return;
        (async () => {
            try {
                const history = await documentService.getDocumentHistory();
                setDocuments(history);
            } catch (e) {
                console.log('Failed to load document history:', e);
            } finally {
                setLoadingDocs(false);
            }
        })();
    }, [isPremium]);

    useEffect(() => {
        if (!isPremium) return;
        (async () => {
            const key = `leximate_ask_unlocked_${userEmail || 'anon'}`;
            const seen = await AsyncStorage.getItem(key);
            if (!seen) {
                setShowCelebration(true);
                await AsyncStorage.setItem(key, 'true');
            }
        })();
    }, [isPremium, userEmail]);

    if (!isPremium) {
        return (
            <PremiumLock
                icon="chatbubble-ellipses-outline"
                title="Ask is a Premium Feature"
                description="Ask anything about your scanned documents — deadlines, clauses, or words you don't understand — and get instant plain-language answers."
                orbs={askOrbs}
            />
        );
    }

    const selectDocument = (doc: DocumentAnalysisResult) => {
        setSelectedDoc(doc);
        setMessages([greetingFor(doc)]);
    };

    const sendMessage = async () => {
        if (!input.trim() || !selectedDoc || isAsking) return;

        const questionText = input.trim();
        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: questionText,
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsAsking(true);

        try {
            const answer = await documentService.askQuestion(selectedDoc.id, questionText);
            const reply: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                text: answer,
            };
            setMessages((prev) => [...prev, reply]);
        } catch (e: any) {
            const errorText =
                e?.response?.data?.error ||
                "Something went wrong getting an answer. Please try again.";
            const reply: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                text: errorText,
            };
            setMessages((prev) => [...prev, reply]);
        } finally {
            setIsAsking(false);
        }
    };

    return (
        <ScreenBackground style={styles.container} orbs={askOrbs}>
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'android' ? 80 : 0}
                >
                    <View style={styles.header}>
                        <View style={styles.headerTop}>
                            <Text style={styles.title}>Ask</Text>
                            <View style={styles.proChip}>
                                <Ionicons name="star" size={11} color="#F59E0B" />
                                <Text style={styles.proChipText}>PRO</Text>
                            </View>
                        </View>
                        <Text style={styles.subtitle}>
                            {selectedDoc ? selectedDoc.title : 'Select a document to get started'}
                        </Text>
                    </View>

                    <View style={styles.pickerSection}>
                        {loadingDocs ? (
                            <ActivityIndicator color="#2DD4BF" style={{ paddingVertical: 12 }} />
                        ) : documents.length === 0 ? (
                            <Text style={styles.noDocsText}>
                                Scan a document first to start asking questions.
                            </Text>
                        ) : (
                            <FlatList
                                data={documents}
                                keyExtractor={(item) => item.id.toString()}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.pickerList}
                                renderItem={({ item }) => {
                                    const isSelected = selectedDoc?.id === item.id;
                                    if (isSelected) {
                                        return (
                                            <TouchableOpacity onPress={() => selectDocument(item)}>
                                                <LinearGradient
                                                    colors={['#1B4FD8', '#2DD4BF']}
                                                    start={{ x: 0, y: 0 }}
                                                    end={{ x: 1, y: 0 }}
                                                    style={[styles.docChip, styles.docChipSelected]}
                                                >
                                                    <Ionicons name="checkmark-circle" size={14} color="#F0F4FF" style={{ marginRight: 4 }} />
                                                    <Text style={[styles.docChipText, styles.docChipTextSelected]} numberOfLines={1}>
                                                        {item.title}
                                                    </Text>
                                                </LinearGradient>
                                            </TouchableOpacity>
                                        );
                                    }
                                    return (
                                        <TouchableOpacity
                                            style={styles.docChip}
                                            onPress={() => selectDocument(item)}
                                        >
                                            <Text style={styles.docChipText} numberOfLines={1}>
                                                {item.title}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        )}
                    </View>

                    {!selectedDoc ? (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconCircle}>
                                <Ionicons name="chatbubble-ellipses-outline" size={28} color="#4A5A7A" />
                            </View>
                            <Text style={styles.emptyTitle}>No document selected</Text>
                            <Text style={styles.emptyStateText}>
                                Pick a document from the chips above to start asking questions
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            ref={listRef}
                            data={messages}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.listContent}
                            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <View
                                    style={[
                                        styles.bubble,
                                        item.role === 'user' ? styles.userBubble : styles.assistantBubble,
                                    ]}
                                >
                                    {item.role === 'assistant' && (
                                        <View style={styles.assistantLabel}>
                                            <LinearGradient
                                                colors={['#1B4FD8', '#2DD4BF']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 1 }}
                                                style={styles.assistantIconCircle}
                                            >
                                                <Ionicons name="sparkles" size={10} color="#FFFFFF" />
                                            </LinearGradient>
                                            <Text style={styles.assistantLabelText}>LexiMate</Text>
                                        </View>
                                    )}
                                    <Text style={styles.bubbleText}>{item.text}</Text>
                                </View>
                            )}
                            ListFooterComponent={
                                isAsking ? (
                                    <View style={[styles.bubble, styles.assistantBubble]}>
                                        <View style={styles.assistantLabel}>
                                            <LinearGradient
                                                colors={['#1B4FD8', '#2DD4BF']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 1 }}
                                                style={styles.assistantIconCircle}
                                            >
                                                <Ionicons name="sparkles" size={10} color="#FFFFFF" />
                                            </LinearGradient>
                                            <Text style={styles.assistantLabelText}>LexiMate</Text>
                                        </View>
                                        <ActivityIndicator color="#8A9BBF" size="small" />
                                    </View>
                                ) : null
                            }
                        />
                    )}

                    <View style={styles.inputRow}>
                        <TextInput
                            style={[styles.input, !selectedDoc && styles.inputDisabled]}
                            placeholder={
                                selectedDoc ? 'Ask about this document...' : 'Select a document first...'
                            }
                            placeholderTextColor="#4A5A7A"
                            value={input}
                            onChangeText={setInput}
                            onSubmitEditing={sendMessage}
                            editable={!!selectedDoc && !isAsking}
                            multiline
                        />
                        <TouchableOpacity
                            onPress={sendMessage}
                            disabled={!selectedDoc || isAsking || !input.trim()}
                            style={[
                                styles.sendButtonWrapper,
                                (!selectedDoc || isAsking || !input.trim()) && styles.sendButtonDisabled,
                            ]}
                        >
                            <LinearGradient
                                colors={['#1B4FD8', '#2DD4BF']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.sendButton}
                            >
                                <Ionicons name="send" size={18} color="#F0F4FF" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>

            {showCelebration && (
                <PremiumUnlockCelebration
                    icon="chatbubble-ellipses"
                    title="Ask Unlocked!"
                    subtitle="Ask anything about your documents, anytime."
                    onFinish={() => setShowCelebration(false)}
                />
            )}
        </ScreenBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 12,
        borderBottomColor: '#2A4470',
        borderBottomWidth: 1,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
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
    subtitle: {
        color: '#8A9BBF',
        fontSize: 12,
        marginTop: 2,
    },
    pickerSection: {
        borderBottomColor: '#2A4470',
        borderBottomWidth: 1,
        paddingVertical: 10,
    },
    pickerList: {
        paddingHorizontal: 16,
        gap: 8,
    },
    noDocsText: {
        color: '#8A9BBF',
        fontSize: 13,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    docChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#132240',
        borderColor: '#2A4470',
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 8,
        marginRight: 8,
        maxWidth: 180,
    },
    docChipSelected: {
        borderColor: 'transparent',
    },
    docChipText: {
        color: '#8A9BBF',
        fontSize: 13,
    },
    docChipTextSelected: {
        color: '#F0F4FF',
        fontWeight: '600',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
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
    emptyStateText: {
        color: '#8A9BBF',
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 18,
    },
    listContent: { padding: 16, paddingTop: 20, paddingBottom: 8 },
    bubble: {
        maxWidth: '82%',
        borderRadius: 16,
        padding: 12,
        marginBottom: 10,
    },
    assistantBubble: {
        backgroundColor: '#132240',
        borderColor: '#2A4470',
        borderWidth: 1,
        alignSelf: 'flex-start',
        borderTopLeftRadius: 4,
    },
    userBubble: {
        backgroundColor: '#1B4FD8',
        alignSelf: 'flex-end',
        borderTopRightRadius: 4,
    },
    assistantLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
    },
    assistantIconCircle: {
        width: 16,
        height: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    assistantLabelText: {
        color: '#2DD4BF',
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    bubbleText: {
        color: '#F0F4FF',
        fontSize: 15,
        lineHeight: 21,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 12,
        borderTopColor: '#2A4470',
        borderTopWidth: 1,
        gap: 10,
    },
    input: {
        flex: 1,
        backgroundColor: '#132240',
        borderColor: '#2A4470',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        color: '#F0F4FF',
        fontSize: 15,
        maxHeight: 100,
    },
    inputDisabled: {
        opacity: 0.5,
    },
    sendButtonWrapper: {
        borderRadius: 20,
        shadowColor: '#2DD4BF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 5,
    },
    sendButton: {
        borderRadius: 20,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.4,
        shadowOpacity: 0,
    },
});