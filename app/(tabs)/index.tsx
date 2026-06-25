import React, { useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type RecentDoc = {
    id: string;
    title: string;
    riskLevel: 'low' | 'medium' | 'high';
    date: string;
};

const RECENT_DOCS: RecentDoc[] = [
    { id: '1', title: 'Apartment Lease Agreement', riskLevel: 'high', date: 'Jun 22' },
    { id: '2', title: 'Freelance Contract', riskLevel: 'medium', date: 'Jun 18' },
    { id: '3', title: 'NDA - Project Falcon', riskLevel: 'low', date: 'Jun 12' },
];

const riskColor = (level: RecentDoc['riskLevel']) => {
    switch (level) {
        case 'low':
            return '#22C55E';
        case 'medium':
            return '#F59E0B';
        case 'high':
            return '#EF4444';
    }
};

export default function HomeScreen() {
    const router = useRouter();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(16)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();
    }, []);

    return (
        <LinearGradient colors={['#0A1628', '#0F1F3A']} style={styles.gradient}>
            <SafeAreaView style={styles.gradient} edges={['top']}>
                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.greeting}>Welcome back 👋</Text>
                    <Text style={styles.subtitle}>Let's make sense of your documents</Text>

                    <TouchableOpacity style={styles.scanButton} onPress={() => router.push('/scan')}>
                        <Ionicons name="camera-outline" size={22} color="#FFFFFF" />
                        <Text style={styles.scanButtonText}>Scan New Document</Text>
                    </TouchableOpacity>

                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        <View style={styles.statsRow}>
                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>{RECENT_DOCS.length}</Text>
                                <Text style={styles.statLabel}>Scanned</Text>
                            </View>
                            <View style={[styles.statCard, styles.statCardAccent]}>
                                <Text style={[styles.statValue, { color: '#EF4444' }]}>
                                    {RECENT_DOCS.filter((d) => d.riskLevel === 'high').length}
                                </Text>
                                <Text style={styles.statLabel}>High Risk</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>2</Text>
                                <Text style={styles.statLabel}>Languages</Text>
                            </View>
                        </View>

                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Recent Documents</Text>
                            <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
                                <Text style={styles.sectionLink}>See all</Text>
                            </TouchableOpacity>
                        </View>

                        {RECENT_DOCS.map((doc) => (
                            <TouchableOpacity key={doc.id} style={styles.docCard}>
                                <View style={[styles.riskDot, { backgroundColor: riskColor(doc.riskLevel) }]} />
                                <View style={styles.docInfo}>
                                    <Text style={styles.docTitle}>{doc.title}</Text>
                                    <Text style={styles.docDate}>{doc.date}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color="#4A5A7A" />
                            </TouchableOpacity>
                        ))}
                    </Animated.View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: { flex: 1 },
    content: { padding: 24, paddingBottom: 40 },
    greeting: {
        fontSize: 26,
        fontWeight: '800',
        color: '#F0F4FF',
    },
    subtitle: {
        fontSize: 15,
        color: '#8A9BBF',
        marginTop: 4,
        marginBottom: 24,
    },
    scanButton: {
        backgroundColor: '#1B4FD8',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 28,
    },
    scanButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 28,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#132240',
        borderColor: '#2A4470',
        borderWidth: 1,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    statCardAccent: {
        borderColor: '#EF4444',
    },
    statValue: {
        color: '#F0F4FF',
        fontSize: 20,
        fontWeight: '700',
    },
    statLabel: {
        color: '#8A9BBF',
        fontSize: 12,
        marginTop: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        color: '#F0F4FF',
        fontSize: 16,
        fontWeight: '700',
    },
    sectionLink: {
        color: '#2DD4BF',
        fontSize: 13,
        fontWeight: '600',
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