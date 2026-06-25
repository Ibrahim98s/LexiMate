import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

type MockDoc = {
    id: string;
    title: string;
    riskLevel: 'low' | 'medium' | 'high';
    riskScore: number;
    date: string;
};

const MOCK_DOCS: MockDoc[] = [
    { id: '1', title: 'Lease Agreement (Draft)', riskLevel: 'high', riskScore: 78, date: 'Jun 10' },
    { id: '2', title: 'Lease Agreement (Revised)', riskLevel: 'medium', riskScore: 45, date: 'Jun 22' },
];

const riskColor = (level: MockDoc['riskLevel']) => {
    switch (level) {
        case 'low':
            return '#22C55E';
        case 'medium':
            return '#F59E0B';
        case 'high':
            return '#EF4444';
    }
};

export default function CompareScreen() {
    const [docA] = useState(MOCK_DOCS[0]);
    const [docB] = useState(MOCK_DOCS[1]);

    const scoreDelta = docB.riskScore - docA.riskScore;

    return (
        <LinearGradient colors={['#0A1628', '#0F1F3A']} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.heading}>Compare Documents</Text>
                <Text style={styles.subheading}>
                    Select two versions to see what changed in risk and terms
                </Text>

                <View style={styles.compareRow}>
                    <View style={[styles.docCard, { borderColor: riskColor(docA.riskLevel) }]}>
                        <Text style={styles.docTitle}>{docA.title}</Text>
                        <Text style={styles.docDate}>{docA.date}</Text>
                        <View style={[styles.riskPill, { backgroundColor: riskColor(docA.riskLevel) }]}>
                            <Text style={styles.riskPillText}>{docA.riskLevel.toUpperCase()}</Text>
                        </View>
                        <Text style={styles.scoreText}>{docA.riskScore}/100</Text>
                    </View>

                    <View style={styles.vsContainer}>
                        <Ionicons name="git-compare-outline" size={28} color="#2DD4BF" />
                    </View>

                    <View style={[styles.docCard, { borderColor: riskColor(docB.riskLevel) }]}>
                        <Text style={styles.docTitle}>{docB.title}</Text>
                        <Text style={styles.docDate}>{docB.date}</Text>
                        <View style={[styles.riskPill, { backgroundColor: riskColor(docB.riskLevel) }]}>
                            <Text style={styles.riskPillText}>{docB.riskLevel.toUpperCase()}</Text>
                        </View>
                        <Text style={styles.scoreText}>{docB.riskScore}/100</Text>
                    </View>
                </View>

                <View style={styles.deltaCard}>
                    <Text style={styles.deltaLabel}>RISK CHANGE</Text>
                    <Text
                        style={[
                            styles.deltaValue,
                            { color: scoreDelta < 0 ? '#22C55E' : '#EF4444' },
                        ]}
                    >
                        {scoreDelta > 0 ? '+' : ''}
                        {scoreDelta} points
                    </Text>
                    <Text style={styles.deltaSub}>
                        {scoreDelta < 0
                            ? 'The revised version reduced overall risk.'
                            : 'The revised version increased overall risk.'}
                    </Text>
                </View>

                <TouchableOpacity style={styles.selectButton}>
                    <Text style={styles.selectButtonText}>Select Different Documents</Text>
                </TouchableOpacity>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 20, paddingTop: 24 },
    heading: {
        color: '#F0F4FF',
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 4,
    },
    subheading: {
        color: '#8A9BBF',
        fontSize: 14,
        marginBottom: 24,
    },
    compareRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    docCard: {
        flex: 1,
        backgroundColor: '#132240',
        borderWidth: 1.5,
        borderRadius: 14,
        padding: 14,
        alignItems: 'center',
    },
    vsContainer: {
        width: 40,
        alignItems: 'center',
    },
    docTitle: {
        color: '#F0F4FF',
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 4,
    },
    docDate: {
        color: '#8A9BBF',
        fontSize: 12,
        marginBottom: 10,
    },
    riskPill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 8,
    },
    riskPillText: {
        color: '#0A1628',
        fontSize: 11,
        fontWeight: '700',
    },
    scoreText: {
        color: '#F0F4FF',
        fontSize: 16,
        fontWeight: '700',
    },
    deltaCard: {
        backgroundColor: '#132240',
        borderColor: '#2DD4BF',
        borderLeftWidth: 3,
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    deltaLabel: {
        color: '#8A9BBF',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
        marginBottom: 6,
    },
    deltaValue: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    deltaSub: {
        color: '#8A9BBF',
        fontSize: 13,
    },
    selectButton: {
        backgroundColor: '#1B4FD8',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    selectButtonText: {
        color: '#F0F4FF',
        fontSize: 15,
        fontWeight: '600',
    },
});