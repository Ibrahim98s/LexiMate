import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LogoMark from './LogoMark';

type AnimatedSplashScreenProps = {
    onFinish: () => void;
};

export default function AnimatedSplashScreen({ onFinish }: AnimatedSplashScreenProps) {
    const logoScale = useRef(new Animated.Value(0.7)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const logoTilt = useRef(new Animated.Value(1)).current;

    const glowScale = useRef(new Animated.Value(0.6)).current;
    const glowOpacity = useRef(new Animated.Value(0)).current;

    const wordmarkOpacity = useRef(new Animated.Value(0)).current;
    const wordmarkTranslateY = useRef(new Animated.Value(10)).current;

    const overlayOpacity = useRef(new Animated.Value(1)).current;
    const overlayScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.spring(logoScale, {
                    toValue: 1,
                    friction: 5,
                    tension: 50,
                    useNativeDriver: true,
                }),
                Animated.timing(logoOpacity, {
                    toValue: 1,
                    duration: 350,
                    useNativeDriver: true,
                }),
                Animated.spring(logoTilt, {
                    toValue: 0,
                    friction: 6,
                    tension: 40,
                    useNativeDriver: true,
                }),
                Animated.timing(glowOpacity, {
                    toValue: 0.16,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(glowScale, {
                    toValue: 1.6,
                    duration: 900,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),
            ]),
            Animated.parallel([
                Animated.timing(wordmarkOpacity, {
                    toValue: 1,
                    duration: 350,
                    useNativeDriver: true,
                }),
                Animated.timing(wordmarkTranslateY, {
                    toValue: 0,
                    duration: 350,
                    useNativeDriver: true,
                }),
            ]),
            Animated.delay(400),
            Animated.parallel([
                Animated.timing(overlayScale, {
                    toValue: 1.15,
                    duration: 450,
                    easing: Easing.in(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(overlayOpacity, {
                    toValue: 0,
                    duration: 400,
                    easing: Easing.in(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.timing(logoScale, {
                    toValue: 1.25,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]),
        ]).start(() => onFinish());
    }, []);

    const tiltInterpolate = logoTilt.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '18deg'],
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
                        style={{
                            opacity: logoOpacity,
                            transform: [
                                { perspective: 600 },
                                { rotateX: tiltInterpolate },
                                { scale: logoScale },
                            ],
                        }}
                    >
                        <LogoMark size={104} />
                    </Animated.View>

                    <Animated.View
                        style={{
                            opacity: wordmarkOpacity,
                            transform: [{ translateY: wordmarkTranslateY }],
                        }}
                    >
                        <Text style={styles.brandName}>LexiMate</Text>
                        <Text style={styles.brandTagline}>Legal documents, simplified</Text>
                    </Animated.View>
                </View>
            </LinearGradient>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 10,
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
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: '#2DD4BF',
    },
    brandName: {
        color: '#F0F4FF',
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: 0.5,
        textAlign: 'center',
    },
    brandTagline: {
        color: '#8A9BBF',
        fontSize: 13,
        marginTop: 4,
        textAlign: 'center',
    },
});