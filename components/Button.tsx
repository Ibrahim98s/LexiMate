import { StyleSheet, Text, TouchableOpacity, ActivityIndicator, GestureResponderEvent } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

type ButtonProps = {
    label: string;
    onPress: (event: GestureResponderEvent) => void;
    variant?: ButtonVariant;
    loading?: boolean;
    disabled?: boolean;
};

export default function Button({ label, onPress, variant = 'primary', loading = false, disabled = false }: ButtonProps) {
    const isDisabled = disabled || loading;

    return (
        <TouchableOpacity
            style={[styles.base, variantStyles[variant], isDisabled && styles.disabled]}
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'secondary' ? '#1B4FD8' : '#FFFFFF'} />
            ) : (
                <Text style={[styles.label, variant === 'secondary' && styles.secondaryLabel]}>
                    {label}
                </Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryLabel: {
        color: '#1B4FD8',
    },
    disabled: {
        opacity: 0.5,
    },
});

const variantStyles = StyleSheet.create({
    primary: {
        backgroundColor: '#1B4FD8',
    },
    secondary: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#1B4FD8',
    },
    danger: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#EF4444',
    },
});