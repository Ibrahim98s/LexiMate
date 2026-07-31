import React, { useEffect, useState } from 'react';
import {
    View, Text, ScrollView, StyleSheet,
    TouchableOpacity, ActivityIndicator, Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { getNearbyLegalAid, LegalAidOffice } from '../services/legalAidService';

type ScreenState = 'loading' | 'permission-denied' | 'error' | 'ready';

export default function LegalAidScreen() {
    const router = useRouter();
    const [state, setState] = useState<ScreenState>('loading');
    const [offices, setOffices] = useState<LegalAidOffice[]>([]);

    useEffect(() => {
        load();
    }, []);

    async function load() {
        setState('loading');
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setState('permission-denied');
                return;
            }

            const position = await Location.getCurrentPositionAsync({});
            const results = await getNearbyLegalAid(
                position.coords.latitude,
                position.coords.longitude
            );
            setOffices(results);
            setState('ready');
        } catch (e) {
            console.log('Failed to load nearby legal aid:', e);
            setState('error');
        }
    }

    function handleCall(phone: string) {
        if (!phone) return;
        Linking.openURL(`tel:${phone}`);
    }

    function handleDirections(office: LegalAidOffice) {
        const query = encodeURIComponent(office.address || office.name);
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    }

    return (
        <LinearGradient colors={['#0A1628', '#0F1F3A']} style={styles.container}>
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={20} color="#F0F4FF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Legal Aid Near You</Text>
                    <View style={{ width: 36 }} />
                </View>

                {state === 'loading' && (
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" color="#2DD4BF" />
                        <Text style={styles.loadingText}>Finding offices near you...</Text>
                    </View>
                )}

                {state === 'permission-denied' && (
                    <View style={styles.centered}>
                        <View style={styles.emptyIconCircle}>
                            <Ionicons name="location-outline" size={28} color="#F59E0B" />
                        </View>
                        <Text style={styles.errorTitle}>Location access needed</Text>
                        <Text style={styles.errorText}>
                            We need your location to find legal aid offices near you.
                        </Text>
                        <TouchableOpacity style={styles.retryButton} onPress={load} activeOpacity={0.85}>
                            <Text style={styles.retryButtonText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {state === 'error' && (
                    <View style={styles.centered}>
                        <View style={styles.emptyIconCircle}>
                            <Ionicons name="alert-circle-outline" size={28} color="#EF4444" />
                        </View>
                        <Text style={styles.errorTitle}>Couldn't load nearby offices</Text>
                        <Text style={styles.errorText}>Please check your connection and try again.</Text>
                        <TouchableOpacity style={styles.retryButton} onPress={load} activeOpacity={0.85}>
                            <Text style={styles.retryButtonText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {state === 'ready' && (
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        {offices.length === 0 ? (
                            <View style={styles.centered}>
                                <View style={styles.emptyIconCircle}>
                                    <Ionicons name="search-outline" size={28} color="#8A9BBF" />
                                </View>
                                <Text style={styles.errorTitle}>No offices found nearby</Text>
                                <Text style={styles.errorText}>Try again later or search a different area.</Text>
                            </View>
                        ) : (
                            offices.map((office, idx) => (
                                <View key={idx} style={styles.card}>
                                    <Text style={styles.officeName}>{office.name}</Text>
                                    {!!office.address && (
                                        <Text style={styles.officeAddress}>{office.address}</Text>
                                    )}
                                    <View style={styles.actionRow}>
                                        {!!office.phone && (
                                            <TouchableOpacity
                                                style={styles.actionButton}
                                                onPress={() => handleCall(office.phone)}
                                                activeOpacity={0.85}
                                            >
                                                <Ionicons name="call-outline" size={16} color="#2DD4BF" />
                                                <Text style={styles.actionButtonText}>Call</Text>
                                            </TouchableOpacity>
                                        )}
                                        <TouchableOpacity
                                            style={styles.actionButton}
                                            onPress={() => handleDirections(office)}
                                            activeOpacity={0.85}
                                        >
                                            <Ionicons name="navigate-outline" size={16} color="#2DD4BF" />
                                            <Text style={styles.actionButtonText}>Directions</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}

                        <Text style={styles.disclaimer}>
                            Listings are pulled from Google Places and may not reflect current hours or availability. Call ahead when possible.
                        </Text>
                    </ScrollView>
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
        paddingTop: 60,
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
    retryButton: {
        marginTop: 10,
        backgroundColor: '#1B4FD8',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    retryButtonText: {
        color: '#F0F4FF',
        fontSize: 14,
        fontWeight: '600',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 30,
    },
    card: {
        backgroundColor: '#132240',
        borderColor: '#2A4470',
        borderWidth: 1,
        borderRadius: 14,
        padding: 16,
        marginBottom: 14,
    },
    officeName: {
        color: '#F0F4FF',
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 6,
    },
    officeAddress: {
        color: '#8A9BBF',
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 12,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 10,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(45,212,191,0.12)',
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 14,
    },
    actionButtonText: {
        color: '#2DD4BF',
        fontSize: 13,
        fontWeight: '600',
    },
    disclaimer: {
        color: '#4A5A7A',
        fontSize: 11,
        textAlign: 'center',
        lineHeight: 16,
        paddingHorizontal: 10,
        marginTop: 4,
    },
});