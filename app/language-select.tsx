import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguageStore } from '../store/languageStore';

type Language = {
    code: string;
    name: string;
};

const languages: Language[] = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'ar', name: 'Arabic' },
    { code: 'zh', name: 'Chinese' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'hi', name: 'Hindi' },
    { code: 'sw', name: 'Swahili' },
];

export default function LanguageSelectScreen() {
    const router = useRouter();
    const selectedLanguage = useLanguageStore((state) => state.selectedLanguage);
    const setSelectedLanguage = useLanguageStore((state) => state.setSelectedLanguage);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Select Language</Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="close" size={26} color="#F0F4FF" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={languages}
                keyExtractor={(item) => item.code}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => setSelectedLanguage(item.code)}
                    >
                        <Text style={styles.rowLabel}>{item.name}</Text>
                        {selectedLanguage === item.code ? (
                            <Ionicons name="checkmark-circle" size={22} color="#1B4FD8" />
                        ) : null}
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A1628',
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#F0F4FF',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#132240',
        borderWidth: 1,
        borderColor: '#2A4470',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    rowLabel: {
        color: '#F0F4FF',
        fontSize: 15,
        fontWeight: '500',
    },
});