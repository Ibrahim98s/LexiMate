import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

type PremiumUnlockCelebrationProps = {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle: string;
    onFinish: () => void;
};

export default function PremiumUnlockCelebration({
                                                     icon,
                                                     title,
                                                     subtitle,
                                                     onFinish,
                                                 }: PremiumUnlockCelebrationProps) {
    const glowScale = useRef(new Animated.Value(0.5)).current;
    const glowOpacity = useRef(new Animated.Value(0)).current;

    const iconScale = useRef(new Animated.Value(0.4)).current;
    const iconRotate = useRef(new Animated.Value(1)).current;
    const iconOpacity = useRef(new Animated.Value(0)).current;

    const textOpacity = useRef(new Animated.Value(0)).current;
    const textTranslateY = useRef(new Animated.Value(12)).current;

    const overlayOpacity = useRef(new Animated.Value(1)).current;
    const overlayScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.timing(glowOpacity, {
                    toValue: 0.22,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(glowScale, {
                    toValue: 1.8,
                    duration: 900,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.spring(iconScale, {
                    toValue: 1,
                    friction: 4,
                    tension: 60,
                    useNativeDriver: true,
                }),
                Animated.spring(iconRotate, {
                    toValue: 0,
                    friction: 5,
                    tension: 40,
                    useNativeDriver: true,
                }),
                Animated.timing(iconOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]),
            Animated.parallel([
                Animated.timing(textOpacity, {
                    toValue: 1,
                    duration: 350,
                    useNativeDriver: true,
                }),
                Animated.timing(textTranslateY, {
                    toValue: 0,
                    duration: 350,
                    useNativeDriver: true,
                }),
            ]),
            Animated.delay(900),
            Animated.parallel([
                Animated.timing(overlayScale, {
                    toValue: 1.1,
                    duration: 400,
                    easing: Easing.in(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(overlayOpacity, {
                    toValue: 0,
                    duration: 380,
                    easing: Easing.in(Easing.quad),
                    useNativeDriver: true,
                }),
            ]),
        ]).start(() => onFinish());
    }, []);

    const rotateInterpolate = iconRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '-25deg'],
    });

    return (
        <Animated.View
            style={[
                styles.overlay,
                {
                    opacity: overlayOpacity,
                    transform: [{ scale: overlayScale }],
                },
            ]}
        >
            <LinearGradient colors={['#0A1628', '#0F1F3A']} style={styles.container}>
                <View style={styles.centerStack}>
                    <Animated.View
                        style={[
                            styles.glow,
                            {
                                opacity: glowOpacity,
                                transform: [{ scale: glowScale }],
                            },
                        ]}
                    />

                    <Animated.View
                        style={[
                            styles.iconCircle,
                            {
                                opacity: iconOpacity,
                                transform: [
                                    { scale: iconScale },
                                    { rotate: rotateInterpolate },
                                ],
                            },
                        ]}
                    >
                        <LinearGradient
                            colors={['#1B4FD8', '#2DD4BF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.iconGradient}
                        >
                            <Ionicons name={icon} size={30} color="#FFFFFF" />
                        </LinearGradient>
                    </Animated.View>

                    <Animated.View
                        style={{
                            opacity: textOpacity,
                            transform: [{ translateY: textTranslateY }],
                            alignItems: 'center',
                        }}
                    >
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.subtitle}>{subtitle}</Text>
                    </Animated.View>
                </View>
            </LinearGradient>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 20,
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerStack: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    glow: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: '#2DD4BF',
    },
    iconCircle: {
        width: 76,
        height: 76,
        borderRadius: 38,
        overflow: 'hidden',
        shadowColor: '#2DD4BF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 14,
        elevation: 8,
    },
    iconGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        color: '#F0F4FF',
        fontSize: 22,
        fontWeight: '800',
        textAlign: 'center',
    },
    subtitle: {
        color: '#8A9BBF',
        fontSize: 13,
        marginTop: 4,
        textAlign: 'center',
        maxWidth: 240,
    },
});