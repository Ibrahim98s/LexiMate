import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

type Message = {
    id: string;
    role: 'user' | 'assistant';
    text: string;
};

const INITIAL_MESSAGES: Message[] = [
    {
        id: '1',
        role: 'assistant',
        text: "Hi! Scan a document, then ask me anything about it — clauses, risks, or what specific terms mean.",
    },
];

export default function AskScreen() {
    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
    const [input, setInput] = useState('');
    const listRef = useRef<FlatList>(null);

    const sendMessage = () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: input.trim(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput('');

        // Placeholder response — will call Claude API via backend later
        setTimeout(() => {
            const reply: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                text: "I'll be able to answer that once I'm connected to a real document and the backend. For now this is just a UI preview.",
            };
            setMessages((prev) => [...prev, reply]);
        }, 800);
    };

    return (
        <LinearGradient colors={['#0A1628', '#0F1F3A']} style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
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
                />

                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.input}
                        placeholder="Ask about this document..."
                        placeholderTextColor="#4A5A7A"
                        value={input}
                        onChangeText={setInput}
                        onSubmitEditing={sendMessage}
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                        <Ionicons name="send" size={20} color="#F0F4FF" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
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
    sendButton: {
        backgroundColor: '#1B4FD8',
        borderRadius: 20,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
});