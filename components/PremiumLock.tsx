import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ScreenBackground from './ScreenBackground';

type Orb = {
    color: string;
    size: number;
    opacity: number;
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
};

type PremiumLockProps = {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
    orbs?: Orb[];
};

const defaultOrbs: Orb[] = [
    { color: '#2DD4BF', size: 220, opacity: 0.10, top: -60, right: -60 },
];

export default function PremiumLock({ icon, title, description, orbs }: PremiumLockProps) {
    const router = useRouter();

    return (
        <ScreenBackground style={styles.container} orbs={orbs ?? defaultOrbs}>
            <View style={styles.content}>
                <View style={styles.iconCircle}>
                    <Ionicons name={icon} size={32} color="#2DD4BF" />
                </View>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{description}</Text>

                <TouchableOpacity
                    style={styles.upgradeButton}
                    onPress={() => router.push('/profile')}
                >
                    <Ionicons name="star" size={16} color="#0A1628" />
                    <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
                </TouchableOpacity>

                <Text style={styles.priceHint}>₵50/month · cancel anytime</Text>
            </View>
        </ScreenBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#132240',
        borderColor: '#2DD4BF',
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    title: {
        color: '#F0F4FF',
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    description: {
        color: '#8A9BBF',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 28,
        maxWidth: 280,
    },
    upgradeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#2DD4BF',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 28,
    },
    upgradeButtonText: {
        color: '#0A1628',
        fontSize: 15,
        fontWeight: '700',
    },
    priceHint: {
        color: '#4A5A7A',
        fontSize: 12,
        marginTop: 14,
    },
});