import { StyleSheet, Text, View } from 'react-native';

type RiskLevel = 'low' | 'medium' | 'high';

type RiskBadgeProps = {
    level: RiskLevel;
    label?: string;
};

const riskConfig: Record<RiskLevel, { color: string; background: string; defaultLabel: string }> = {
    low: { color: '#22C55E', background: 'rgba(34,197,94,0.15)', defaultLabel: 'Low Risk' },
    medium: { color: '#F59E0B', background: 'rgba(245,158,11,0.15)', defaultLabel: 'Medium Risk' },
    high: { color: '#EF4444', background: 'rgba(239,68,68,0.15)', defaultLabel: 'High Risk' },
};

export default function RiskBadge({ level, label }: RiskBadgeProps) {
    const config = riskConfig[level];

    return (
        <View style={[styles.badge, { backgroundColor: config.background }]}>
            <View style={[styles.dot, { backgroundColor: config.color }]} />
            <Text style={[styles.text, { color: config.color }]}>
                {label ?? config.defaultLabel}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    text: {
        fontSize: 13,
        fontWeight: '600',
    },
});