import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HistoryScreen() {
    const documents: never[] = []; // will be populated from backend later

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Document History</Text>

            {documents.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="document-text-outline" size={48} color="#4A5A7A" />
                    <Text style={styles.emptyTitle}>No documents yet</Text>
                    <Text style={styles.emptySubtitle}>
                        Scanned and translated documents will show up here
                    </Text>
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A1628',
        padding: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#F0F4FF',
        marginBottom: 24,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingBottom: 80,
    },
    emptyTitle: {
        color: '#F0F4FF',
        fontSize: 17,
        fontWeight: '600',
        marginTop: 8,
    },
    emptySubtitle: {
        color: '#8A9BBF',
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 32,
    },
});