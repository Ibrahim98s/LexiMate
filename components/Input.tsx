import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TextInputProps, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type InputProps = TextInputProps & {
    label?: string;
    error?: string;
    isPassword?: boolean;
};

export default function Input({ label, error, style, isPassword = false, ...rest }: InputProps) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <View style={styles.wrapper}>
            {label ? <Text style={styles.label}>{label}</Text> : null}
            <View style={styles.inputRow}>
                <TextInput
                    style={[styles.input, error ? styles.inputError : null, isPassword && styles.inputWithIcon, style]}
                    placeholderTextColor="#4A5A7A"
                    secureTextEntry={isPassword && !isVisible}
                    {...rest}
                />
                {isPassword ? (
                    <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setIsVisible((prev) => !prev)}
                    >
                        <Ionicons
                            name={isVisible ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color="#8A9BBF"
                        />
                    </TouchableOpacity>
                ) : null}
            </View>
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
    inputRow: {
        position: 'relative',
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
    inputWithIcon: {
        paddingRight: 48,
    },
    inputError: {
        borderColor: '#EF4444',
    },
    eyeButton: {
        position: 'absolute',
        right: 16,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: 4,
    },
});