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
import { Ionicons } from '@expo/vector-icons';
import * as documentService from '../../services/documentService';
import type { DocumentAnalysisResult } from '../../services/documentService';

type Message = {
    id: string;
    role: 'user' | 'assistant';
    text: string;
};

function greetingFor(doc: DocumentAnalysisResult): Message {
    return {
        id: 'greeting',
        role: 'assistant',
        text: `Ask anything about "${doc.title}" — deadlines, clauses, or words you don't understand.`,
    };
}

export default function AskScreen() {
    const [documents, setDocuments] = useState<DocumentAnalysisResult[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(true);
    const [selectedDoc, setSelectedDoc] = useState<DocumentAnalysisResult | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isAsking, setIsAsking] = useState(false);
    const listRef = useRef<FlatList>(null);

    useEffect(() => {
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
    }, []);

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
        <LinearGradient colors={['#0A1628', '#0F1F3A']} style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'android' ? 80 : 0}
            >
                {/* Document picker */}
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
                                return (
                                    <TouchableOpacity
                                        style={[styles.docChip, isSelected && styles.docChipSelected]}
                                        onPress={() => selectDocument(item)}
                                    >
                                        <Text
                                            style={[
                                                styles.docChipText,
                                                isSelected && styles.docChipTextSelected,
                                            ]}
                                            numberOfLines={1}
                                        >
                                            {item.title}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    )}
                </View>

                {/* Chat */}
                {!selectedDoc ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="chatbubble-ellipses-outline" size={40} color="#4A5A7A" />
                        <Text style={styles.emptyStateText}>
                            Select a document above to start asking questions
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        ref={listRef}
                        data={messages}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
                        renderItem={({ item }) => (
                            <View
                                style={[
                                    styles.bubble,
                                    item.role === 'user' ? styles.userBubble : styles.assistantBubble,
                                ]}
                            >
                                <Text style={styles.bubbleText}>{item.text}</Text>
                            </View>
                        )}
                        ListFooterComponent={
                            isAsking ? (
                                <View style={[styles.bubble, styles.assistantBubble]}>
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
                    />
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            (!selectedDoc || isAsking) && styles.sendButtonDisabled,
                        ]}
                        onPress={sendMessage}
                        disabled={!selectedDoc || isAsking}
                    >
                        <Ionicons name="send" size={20} color="#F0F4FF" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
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
        paddingVertical: 12,
    },
    docChip: {
        backgroundColor: '#132240',
        borderColor: '#2A4470',
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 8,
        marginRight: 8,
        maxWidth: 160,
    },
    docChipSelected: {
        backgroundColor: '#1B4FD8',
        borderColor: '#1B4FD8',
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
        gap: 12,
    },
    emptyStateText: {
        color: '#8A9BBF',
        fontSize: 14,
        textAlign: 'center',
    },
    listContent: { padding: 16, paddingTop: 24 },
    bubble: {
        maxWidth: '80%',
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
    bubbleText: {
        color: '#F0F4FF',
        fontSize: 15,
        lineHeight: 21,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderTopColor: '#2A4470',
        borderTopWidth: 1,
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
        marginRight: 10,
    },
    inputDisabled: {
        opacity: 0.5,
    },
    sendButton: {
        backgroundColor: '#1B4FD8',
        borderRadius: 20,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.4,
    },
});