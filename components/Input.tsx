import { StyleSheet, Text, TextInput, View, TextInputProps } from 'react-native';

type InputProps = TextInputProps & {
    label?: string;
    error?: string;
};

export default function Input({ label, error, style, ...rest }: InputProps) {
    return (
        <View style={styles.wrapper}>
            {label ? <Text style={styles.label}>{label}</Text> : null}
            <TextInput
                style={[styles.input, error ? styles.inputError : null, style]}
                placeholderTextColor="#4A5A7A"
                {...rest}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 16,
    },
    label: {
        color: '#8A9BBF',
        fontSize: 13,
        marginBottom: 6,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#132240',
        borderWidth: 1,
        borderColor: '#2A4470',
        borderRadius: 12,
        padding: 16,
        color: '#F0F4FF',
        fontSize: 15,
    },
    inputError: {
        borderColor: '#EF4444',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: 4,
    },
});