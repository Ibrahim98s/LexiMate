import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';

type SettingItem = {
    id: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
};

const settings: SettingItem[] = [
    { id: '1', label: 'Language Preference', icon: 'language-outline' },
    { id: '2', label: 'Notifications', icon: 'notifications-outline' },
    { id: '3', label: 'Account Settings', icon: 'settings-outline' },
    { id: '4', label: 'Help & Support', icon: 'help-circle-outline' },
];

export default function ProfileScreen() {
    const router = useRouter();
    const logout = useAuthStore((state) => state.logout);
    const userName = useAuthStore((state) => state.userName);
    const userEmail = useAuthStore((state) => state.userEmail);

    const initials = userName
        ? userName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
        : '?';

    async function handleLogout() {
        await logout();
        router.replace('/(auth)/login');
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.profileHeader}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                    <Text style={styles.name}>{userName || 'Account'}</Text>
                    <Text style={styles.email}>{userEmail || ''}</Text>
                </View>

                <View style={styles.settingsGroup}>
                    {settings.map((item) => (
                        <TouchableOpacity key={item.id} style={styles.settingRow}>
                            <Ionicons name={item.icon} size={20} color="#8A9BBF" />
                            <Text style={styles.settingLabel}>{item.label}</Text>
                            <Ionicons name="chevron-forward" size={18} color="#4A5A7A" />
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
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
    profileHeader: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#1B4FD8',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '700',
    },
    name: {
        color: '#F0F4FF',
        fontSize: 20,
        fontWeight: '700',
    },
    email: {
        color: '#8A9BBF',
        fontSize: 14,
        marginTop: 4,
    },
    settingsGroup: {
        backgroundColor: '#132240',
        borderWidth: 1,
        borderColor: '#2A4470',
        borderRadius: 12,
        marginBottom: 24,
        overflow: 'hidden',
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#2A4470',
    },
    settingLabel: {
        flex: 1,
        color: '#F0F4FF',
        fontSize: 15,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EF4444',
    },
    logoutText: {
        color: '#EF4444',
        fontSize: 15,
        fontWeight: '600',
    },
});