import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import RiskBadge from '../components/RiskBadge';

export default function ResultsScreen() {
    const router = useRouter();
    const [isAnalyzing, setIsAnalyzing] = useState(true);

    useEffect(() => {
        // Simulated async analysis — will be replaced with real backend polling later
        const timer = setTimeout(() => setIsAnalyzing(false), 2500);
        return () => clearTimeout(timer);
    }, []);

    if (isAnalyzing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1B4FD8" />
                <Text style={styles.loadingText}>Analyzing your document...</Text>
                <Text style={styles.loadingSubtext}>This usually takes a few seconds</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.title}>Document Analysis</Text>
                <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
                    <Ionicons name="close" size={26} color="#F0F4FF" />
                </TouchableOpacity>
            </View>

            <RiskBadge level="medium" />

            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.bodyText}>
                This is a placeholder summary. Once connected to the backend, this section will
                show an AI-generated plain-language summary of the scanned legal document.
            </Text>

            <Text style={styles.sectionTitle}>Translation</Text>
            <Text style={styles.bodyText}>
                Placeholder translated text will appear here once the document has been processed
                by the translation service.
            </Text>

            <Text style={styles.sectionTitle}>Key Points to Review</Text>
            <View style={styles.pointRow}>
                <Ionicons name="alert-circle-outline" size={18} color="#F59E0B" />
                <Text style={styles.pointText}>Placeholder flagged clause #1</Text>
            </View>
            <View style={styles.pointRow}>
                <Ionicons name="alert-circle-outline" size={18} color="#F59E0B" />
                <Text style={styles.pointText}>Placeholder flagged clause #2</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A1628',
    },
    content: {
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#F0F4FF',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#F0F4FF',
        marginTop: 24,
        marginBottom: 8,
    },
    bodyText: {
        fontSize: 14,
        color: '#8A9BBF',
        lineHeight: 20,
    },
    pointRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    pointText: {
        color: '#F0F4FF',
        fontSize: 14,
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#0A1628',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    loadingText: {
        color: '#F0F4FF',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 8,
    },
    loadingSubtext: {
        color: '#8A9BBF',
        fontSize: 13,
    },
});