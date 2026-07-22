import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Linking, Alert, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/authStore';
import * as paymentService from '../services/paymentService';

function getAvatarKey(userEmail: string | null | undefined) {
    return `leximate_avatar_uri_${userEmail || 'anonymous'}`;
}

type SettingItem = {
    id: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    route?: string;
};

const settings: SettingItem[] = [
    { id: '1', label: 'Language Preference', icon: 'language-outline', route: '/language-select' },
    { id: '2', label: 'Notifications', icon: 'notifications-outline' },
    { id: '3', label: 'Account Settings', icon: 'settings-outline', route: '/account-settings' },
    { id: '4', label: 'Help & Support', icon: 'help-circle-outline', route: '/help' },
];

export default function ProfileScreen() {
    const router = useRouter();
    const logout = useAuthStore((state) => state.logout);
    const userName = useAuthStore((state) => state.userName);
    const userEmail = useAuthStore((state) => state.userEmail);
    const isPremium = useAuthStore((state) => state.isPremium);
    const premiumExpiresAt = useAuthStore((state) => state.premiumExpiresAt);
    const setPremiumStatus = useAuthStore((state) => state.setPremiumStatus);

    const [pendingReference, setPendingReference] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [justUpgraded, setJustUpgraded] = useState(false);
    const [avatarUri, setAvatarUri] = useState<string | null>(null);

    const initials = userName
        ? userName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
        : '?';

    useEffect(() => {
        setAvatarUri(null);
        AsyncStorage.getItem(getAvatarKey(userEmail)).then((uri) => {
            if (uri) setAvatarUri(uri);
        });
    }, [userEmail]);

    async function handlePickAvatar() {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please allow access to your photo library to set a profile picture.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled && result.assets[0]?.uri) {
            const uri = result.assets[0].uri;
            setAvatarUri(uri);
            await AsyncStorage.setItem(getAvatarKey(userEmail), uri);
        }
    }

    async function handleLogout() {
        await logout();
        router.replace('/(auth)/login');
    }

    async function handleUpgrade() {
        setIsProcessing(true);
        try {
            const { authorizationUrl, reference } = await paymentService.initializePayment();
            setPendingReference(reference);
            await Linking.openURL(authorizationUrl);
        } catch (error) {
            console.log('Payment init failed:', error);
            Alert.alert('Error', 'Could not start payment. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    }

    async function handleConfirmPayment() {
        if (!pendingReference) return;
        setIsProcessing(true);
        try {
            const result = await paymentService.verifyPayment(pendingReference);
            if (result.isPremium) {
                setPremiumStatus(true, result.premiumExpiresAt);
                setPendingReference(null);
                setJustUpgraded(true);
            } else {
                Alert.alert(
                    'Payment Not Confirmed',
                    'We could not confirm your payment yet. If you completed checkout, please wait a moment and try again.'
                );
            }
        } catch (error) {
            console.log('Payment verify failed:', error);
            Alert.alert('Payment Not Confirmed', 'We could not confirm your payment yet. If you completed checkout, please wait a moment and try again.');
        } finally {
            setIsProcessing(false);
        }
    }

    return (
        <LinearGradient colors={['#0A1628', '#0F1F3A']} style={styles.container}>
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Profile</Text>
                    {isPremium && (
                        <View style={styles.premiumChip}>
                            <Ionicons name="star" size={12} color="#F59E0B" />
                            <Text style={styles.premiumChipText}>PRO</Text>
                        </View>
                    )}
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    <View style={styles.profileHeader}>
                        <TouchableOpacity style={styles.avatarContainer} onPress={handlePickAvatar}>
                            {avatarUri ? (
                                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                            ) : (
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>{initials}</Text>
                                </View>
                            )}
                            <View style={styles.avatarEditBadge}>
                                <Ionicons name="camera" size={12} color="#F0F4FF" />
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.name}>{userName || 'Account'}</Text>
                        <Text style={styles.email}>{userEmail || ''}</Text>
                    </View>

                    {justUpgraded && (
                        <View style={styles.successCard}>
                            <View style={styles.successIconCircle}>
                                <Ionicons name="checkmark" size={28} color="#0A1628" />
                            </View>
                            <Text style={styles.successTitle}>You're Premium!</Text>
                            <Text style={styles.successSubtitle}>
                                Unlimited scans, Ask, and Compare are now unlocked.
                            </Text>
                            <TouchableOpacity
                                style={styles.successDismiss}
                                onPress={() => setJustUpgraded(false)}
                            >
                                <Text style={styles.successDismissText}>Continue</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {!justUpgraded && (
                        isPremium ? (
                            <View style={styles.premiumBadge}>
                                <View style={styles.premiumBadgeLeft}>
                                    <Ionicons name="star" size={20} color="#F59E0B" />
                                    <View>
                                        <Text style={styles.premiumBadgeTitle}>Premium Member</Text>
                                        {premiumExpiresAt && (
                                            <Text style={styles.premiumBadgeSub}>
                                                Expires {new Date(premiumExpiresAt).toLocaleDateString()}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                                <Ionicons name="checkmark-circle" size={20} color="#F59E0B" />
                            </View>
                        ) : (
                            <View style={styles.upgradeCard}>
                                <LinearGradient
                                    colors={['#1B4FD8', '#2DD4BF']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.upgradeGradientBar}
                                />
                                <View style={styles.upgradeCardContent}>
                                    <Ionicons name="star-outline" size={22} color="#2DD4BF" />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.upgradeTitle}>Upgrade to Premium</Text>
                                        <Text style={styles.upgradeSubtitle}>
                                            Unlimited scans · Ask · Compare — ₵50/month
                                        </Text>
                                    </View>
                                </View>
                                {!pendingReference ? (
                                    <TouchableOpacity
                                        style={styles.upgradeButton}
                                        onPress={handleUpgrade}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? (
                                            <ActivityIndicator color="#F0F4FF" />
                                        ) : (
                                            <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
                                        )}
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.upgradeButton}
                                        onPress={handleConfirmPayment}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? (
                                            <ActivityIndicator color="#F0F4FF" />
                                        ) : (
                                            <Text style={styles.upgradeButtonText}>I've Completed Payment</Text>
                                        )}
                                    </TouchableOpacity>
                                )}
                            </View>
                        )
                    )}

                    <Text style={styles.sectionTitle}>Settings</Text>
                    <View style={styles.settingsGroup}>
                        {settings.map((item, index) => (
                            <TouchableOpacity
                                key={item.id}
                                style={[
                                    styles.settingRow,
                                    index === settings.length - 1 && styles.settingRowLast
                                ]}
                                onPress={() => {
                                    if (item.route) {
                                        router.push(item.route as any);
                                    } else {
                                        Alert.alert('Coming Soon', `${item.label} isn't available yet.`);
                                    }
                                }}
                            >
                                <View style={styles.settingIconCircle}>
                                    <Ionicons name={item.icon} size={17} color="#8A9BBF" />
                                </View>
                                <Text style={styles.settingLabel}>{item.label}</Text>
                                <Ionicons name="chevron-forward" size={16} color="#4A5A7A" />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={18} color="#EF4444" />
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>

                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomColor: '#2A4470',
        borderBottomWidth: 1,
    },
    headerTitle: {
        color: '#F0F4FF',
        fontSize: 22,
        fontWeight: '800',
    },
    premiumChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(245,158,11,0.12)',
        borderColor: 'rgba(245,158,11,0.3)',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    premiumChipText: {
        color: '#F59E0B',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    content: { padding: 20, paddingBottom: 48 },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 12,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#1B4FD8',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#2A4470',
    },
    avatarImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: '#2DD4BF',
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 26,
        fontWeight: '700',
    },
    avatarEditBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#1B4FD8',
        borderWidth: 2,
        borderColor: '#0A1628',
        alignItems: 'center',
        justifyContent: 'center',
    },
    name: {
        color: '#F0F4FF',
        fontSize: 20,
        fontWeight: '700',
    },
    email: {
        color: '#8A9BBF',
        fontSize: 14,
        marginTop: 3,
    },
    successCard: {
        backgroundColor: '#132240',
        borderColor: '#2DD4BF',
        borderWidth: 1.5,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginBottom: 20,
    },
    successIconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#2DD4BF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    successTitle: {
        color: '#F0F4FF',
        fontSize: 19,
        fontWeight: '700',
        marginBottom: 6,
    },
    successSubtitle: {
        color: '#8A9BBF',
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 18,
    },
    successDismiss: {
        backgroundColor: '#2DD4BF',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 32,
    },
    successDismissText: {
        color: '#0A1628',
        fontSize: 14,
        fontWeight: '700',
    },
    premiumBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(245,158,11,0.08)',
        borderColor: 'rgba(245,158,11,0.3)',
        borderWidth: 1,
        borderRadius: 14,
        padding: 16,
        marginBottom: 20,
    },
    premiumBadgeLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    premiumBadgeTitle: {
        color: '#F0F4FF',
        fontSize: 14,
        fontWeight: '700',
    },
    premiumBadgeSub: {
        color: '#8A9BBF',
        fontSize: 12,
        marginTop: 2,
    },
    upgradeCard: {
        backgroundColor: '#132240',
        borderColor: '#2A4470',
        borderWidth: 1,
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 20,
    },
    upgradeGradientBar: {
        height: 3,
    },
    upgradeCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        paddingBottom: 12,
    },
    upgradeTitle: {
        color: '#F0F4FF',
        fontSize: 15,
        fontWeight: '700',
    },
    upgradeSubtitle: {
        color: '#8A9BBF',
        fontSize: 12,
        marginTop: 2,
    },
    upgradeButton: {
        backgroundColor: '#1B4FD8',
        margin: 16,
        marginTop: 4,
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
    },
    upgradeButtonText: {
        color: '#F0F4FF',
        fontSize: 14,
        fontWeight: '600',
    },
    sectionTitle: {
        color: '#8A9BBF',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 8,
        marginLeft: 4,
    },
    settingsGroup: {
        backgroundColor: '#132240',
        borderWidth: 1,
        borderColor: '#2A4470',
        borderRadius: 14,
        marginBottom: 20,
        overflow: 'hidden',
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#2A4470',
    },
    settingRowLast: {
        borderBottomWidth: 0,
    },
    settingIconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#0A1628',
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingLabel: {
        flex: 1,
        color: '#F0F4FF',
        fontSize: 14,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(239,68,68,0.4)',
        backgroundColor: 'rgba(239,68,68,0.06)',
    },
    logoutText: {
        color: '#EF4444',
        fontSize: 14,
        fontWeight: '600',
    },
});