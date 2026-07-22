import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ScreenBackground from '../components/ScreenBackground';

const faqs = [
    {
        question: 'What happens to my document after I scan it?',
        answer: 'Your document is analyzed to produce a translation, summary, and risk score. It is stored securely under your account so you can revisit it in History.',
    },
    {
        question: 'What languages are supported?',
        answer: 'You can choose your target language from the language picker before scanning. LexiMate translates into your selected language.',
    },
    {
        question: 'How is my risk score calculated?',
        answer: 'LexiMate reviews your document for common red-flag clauses (illegal deductions, unfair terms, missed deadlines) and produces a score from 0 to 100, along with specific flagged points.',
    },
    {
        question: 'What does Premium include?',
        answer: 'Premium unlocks unlimited scans, the Ask feature for asking questions about your documents, and Compare for comparing two documents side by side.',
    },
];

export default function HelpScreen() {
    const router = useRouter();

    return (
        <ScreenBackground
            orbs={[
                { color: '#2DD4BF', size: 220, opacity: 0.08, top: -60, right: -60 },
            ]}
        >
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={20} color="#F0F4FF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Help & Support</Text>
                    <View style={{ width: 36 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

                    {faqs.map((faq, index) => (
                        <View key={index} style={styles.faqCard}>
                            <Text style={styles.faqQuestion}>{faq.question}</Text>
                            <Text style={styles.faqAnswer}>{faq.answer}</Text>
                        </View>
                    ))}

                    <View style={styles.contactCard}>
                        <View style={styles.contactIconCircle}>
                            <Ionicons name="mail-outline" size={24} color="#2DD4BF" />
                        </View>
                        <Text style={styles.contactTitle}>Still need help?</Text>
                        <Text style={styles.contactSubtitle}>
                            Reach out and we'll get back to you as soon as we can.
                        </Text>
                        <TouchableOpacity
                            style={styles.contactButton}
                            onPress={() => Linking.openURL('mailto:leximate.support@gmail.com')}
                        >
                            <Ionicons name="mail" size={16} color="#F0F4FF" />
                            <Text style={styles.contactButtonText}>Email Support</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </ScreenBackground>
    );
}

const styles = StyleSheet.create({
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
    content: {
        padding: 20,
        paddingBottom: 48,
    },
    sectionTitle: {
        color: '#8A9BBF',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 2,
    },
    faqCard: {
        backgroundColor: '#132240',
        borderColor: '#2A4470',
        borderWidth: 1,
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
    },
    faqQuestion: {
        color: '#F0F4FF',
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 8,
    },
    faqAnswer: {
        color: '#8A9BBF',
        fontSize: 14,
        lineHeight: 20,
    },
    contactCard: {
        backgroundColor: '#132240',
        borderColor: '#2DD4BF',
        borderWidth: 1.5,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginTop: 8,
    },
    contactIconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(45,212,191,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    contactTitle: {
        color: '#F0F4FF',
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 6,
    },
    contactSubtitle: {
        color: '#8A9BBF',
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 18,
        maxWidth: 240,
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#1B4FD8',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    contactButtonText: {
        color: '#F0F4FF',
        fontSize: 14,
        fontWeight: '600',
    },
});