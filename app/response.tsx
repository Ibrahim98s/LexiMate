import React, { useEffect, useState } from 'react';
import {
    View, Text, ScrollView, StyleSheet,
    TouchableOpacity, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { generateResponse, ResponseGenerationResult } from '../services/documentService';

type Tab = 'letter' | 'talkingPoints' | 'nextSteps';

export default function ResponseScreen() {
    const { documentId } = useLocalSearchParams<{ documentId?: string }>();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [result, setResult] = useState<ResponseGenerationResult | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('letter');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        async function load() {
            if (!documentId) {
                setError(true);
                setLoading(false);
                return;
            }
            try {
                const data = await generateResponse(Number(documentId));
                setResult(data);
            } catch (e) {
                console.log('Failed to generate response:', e);
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [documentId]);

    async function handleCopy() {
        if (!result) return;
        let textToCopy = '';
        if (activeTab === 'letter') textToCopy = result.letter;
        else if (activeTab === 'talkingPoints') textToCopy = result.talkingPoints.map((p) => `• ${p}`).join('\n');
        else textToCopy = result.nextSteps.map((s, i) => `${i + 1}. ${s}`).join('\n');

        await Clipboard.setStringAsync(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <LinearGradient colors={['#0A1628', '#0F1F3A']} style={styles.container}>
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={20} color="#F0F4FF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Get Legal Help</Text>
                    <View style={{ width: 36 }} />
                </View>

                {loading ? (
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" color="#2DD4BF" />
                        <Text style={styles.loadingText}>Drafting your response...</Text>
                    </View>
                ) : error || !result ? (
                    <View style={styles.centered}>
                        <View style={styles.emptyIconCircle}>
                            <Ionicons name="alert-circle-outline" size={28} color="#EF4444" />
                        </View>
                        <Text style={styles.errorTitle}>Couldn't generate a response</Text>
                        <Text style={styles.errorText}>Please try again in a moment.</Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.tabRow}>
                            <TouchableOpacity
                                style={[styles.tabButton, activeTab === 'letter' && styles.tabButtonActive]}
                                onPress={() => setActiveTab('letter')}
                            >
                                <Text style={[styles.tabText, activeTab === 'letter' && styles.tabTextActive]}>Letter</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tabButton, activeTab === 'talkingPoints' && styles.tabButtonActive]}
                                onPress={() => setActiveTab('talkingPoints')}
                            >
                                <Text style={[styles.tabText, activeTab === 'talkingPoints' && styles.tabTextActive]}>Talking Points</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tabButton, activeTab === 'nextSteps' && styles.tabButtonActive]}
                                onPress={() => setActiveTab('nextSteps')}
                            >
                                <Text style={[styles.tabText, activeTab === 'nextSteps' && styles.tabTextActive]}>Next Steps</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                            <View style={styles.card}>
                                {activeTab === 'letter' && (
                                    <Text style={styles.letterText}>{result.letter}</Text>
                                )}
                                {activeTab === 'talkingPoints' && (
                                    result.talkingPoints.map((point, idx) => (
                                        <View key={idx} style={styles.listItem}>
                                            <View style={styles.listDot} />
                                            <Text style={styles.listText}>{point}</Text>
                                        </View>
                                    ))
                                )}
                                {activeTab === 'nextSteps' && (
                                    result.nextSteps.map((step, idx) => (
                                        <View key={idx} style={styles.listItem}>
                                            <View style={styles.numberCircle}>
                                                <Text style={styles.numberText}>{idx + 1}</Text>
                                            </View>
                                            <Text style={styles.listText}>{step}</Text>
                                        </View>
                                    ))
                                )}
                            </View>

                            <Text style={styles.disclaimer}>
                                This is AI-generated guidance, not legal advice. For serious matters, consider consulting a licensed attorney or legal aid organization.
                            </Text>
                        </ScrollView>

                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={styles.legalAidLink}
                                onPress={() => router.push('/legal-aid')}
                                activeOpacity={0.85}
                            >
                                <Ionicons name="location-outline" size={16} color="#2DD4BF" />
                                <Text style={styles.legalAidLinkText}>Find legal aid offices near me</Text>
                                <Ionicons name="chevron-forward" size={16} color="#2DD4BF" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.copyButton} onPress={handleCopy} activeOpacity={0.85}>
                                <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={18} color="#F0F4FF" />
                                <Text style={styles.copyButtonText}>{copied ? 'Copied!' : 'Copy to Clipboard'}</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomColor: '#2A4470',
        borderBottomWidth: 1,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#132240',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        flex: 1,
        color: '#F0F4FF',
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
        marginHorizontal: 8,
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingHorizontal: 40,
    },
    loadingText: {
        color: '#8A9BBF',
        fontSize: 14,
        marginTop: 12,
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
    errorTitle: {
        color: '#F0F4FF',
        fontSize: 16,
        fontWeight: '600',
    },
    errorText: {
        color: '#8A9BBF',
        fontSize: 13,
        textAlign: 'center',
    },
    tabRow: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 4,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#132240',
        borderColor: '#2A4470',
        borderWidth: 1,
        alignItems: 'center',
    },
    tabButtonActive: {
        backgroundColor: '#1B4FD8',
        borderColor: '#1B4FD8',
    },
    tabText: {
        color: '#8A9BBF',
        fontSize: 12,
        fontWeight: '600',
    },
    tabTextActive: {
        color: '#F0F4FF',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#132240',
        borderColor: '#2A4470',
        borderWidth: 1,
        borderRadius: 14,
        padding: 18,
        marginBottom: 14,
    },
    letterText: {
        color: '#F0F4FF',
        fontSize: 14,
        lineHeight: 22,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 14,
    },
    listDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#2DD4BF',
        marginTop: 7,
    },
    listText: {
        flex: 1,
        color: '#F0F4FF',
        fontSize: 14,
        lineHeight: 20,
    },
    numberCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: 'rgba(45,212,191,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    numberText: {
        color: '#2DD4BF',
        fontSize: 11,
        fontWeight: '700',
    },
    disclaimer: {
        color: '#4A5A7A',
        fontSize: 11,
        textAlign: 'center',
        lineHeight: 16,
        paddingHorizontal: 10,
    },
    footer: {
        padding: 20,
        paddingTop: 8,
        borderTopColor: '#2A4470',
        borderTopWidth: 1,
    },
    legalAidLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
        marginBottom: 10,
    },
    legalAidLinkText: {
        color: '#2DD4BF',
        fontSize: 13,
        fontWeight: '600',
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#1B4FD8',
        borderRadius: 12,
        paddingVertical: 14,
    },
    copyButtonText: {
        color: '#F0F4FF',
        fontSize: 14,
        fontWeight: '600',
    },
});