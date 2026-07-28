import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
    Defs,
    LinearGradient as SvgLinearGradient,
    Stop,
    Rect,
    Path,
} from 'react-native-svg';

type AnimatedSplashScreenProps = {
    onFinish: () => void;
};

// Perimeter of the front document rect (100x130, rx=16) — straight edges + 4 rounded corners.
// Used as the stroke-dasharray length for the "drawing" reveal.
const FRONT_RECT_PERIMETER = 440;

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedPath = Animated.createAnimatedComponent(Path);

const BRAND_NAME = 'LexiMate';

export default function AnimatedSplashScreen({ onFinish }: AnimatedSplashScreenProps) {
    // Logo group entrance
    const logoGroupOpacity = useRef(new Animated.Value(0)).current;
    const logoGroupScale = useRef(new Animated.Value(1)).current;

    // Back accent rect (the tilted rect behind the document)
    const backAccentOpacity = useRef(new Animated.Value(0)).current;

    // Front document — stroke draw + fill
    const frontDashOffset = useRef(new Animated.Value(FRONT_RECT_PERIMETER)).current;
    const frontFillOpacity = useRef(new Animated.Value(0)).current;

    // One-time light sweep across the document once it's filled
    const beamOpacity = useRef(new Animated.Value(0)).current;

    // Folded corner accent
    const cornerOpacity = useRef(new Animated.Value(0)).current;

    // "L" mark — drawn like two highlighter strokes
    const barHeight = useRef(new Animated.Value(0)).current; // vertical stroke, grows top-down
    const barWidth = useRef(new Animated.Value(0)).current; // horizontal stroke, grows left-right

    // Wordmark — per-letter focus-settle
    const letters = useRef(
        BRAND_NAME.split('').map(() => ({
            opacity: new Animated.Value(0),
            translateY: new Animated.Value(8),
            scale: new Animated.Value(1.15),
        }))
    ).current;

    const taglineOpacity = useRef(new Animated.Value(0)).current;
    const taglineTranslateY = useRef(new Animated.Value(6)).current;

    const overlayOpacity = useRef(new Animated.Value(1)).current;
    const overlayScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.sequence([
            // Logo group fades up, back accent settles in behind it
            Animated.parallel([
                Animated.timing(logoGroupOpacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(backAccentOpacity, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]),

            // The document outline draws itself on, stroke by stroke
            Animated.timing(frontDashOffset, {
                toValue: 0,
                duration: 750,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }),

            // Fill lands, folded corner appears, one light sweep passes across
            Animated.parallel([
                Animated.timing(frontFillOpacity, {
                    toValue: 1,
                    duration: 280,
                    useNativeDriver: false,
                }),
                Animated.timing(cornerOpacity, {
                    toValue: 1,
                    duration: 220,
                    useNativeDriver: true,
                }),
                Animated.sequence([
                    Animated.timing(beamOpacity, {
                        toValue: 0.9,
                        duration: 130,
                        useNativeDriver: true,
                    }),
                    Animated.timing(beamOpacity, {
                        toValue: 0,
                        duration: 240,
                        useNativeDriver: true,
                    }),
                ]),
            ]),

            // The "L" mark draws in like two highlighter strokes
            Animated.parallel([
                Animated.timing(barHeight, {
                    toValue: 58,
                    duration: 260,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: false,
                }),
                Animated.timing(barWidth, {
                    toValue: 46,
                    duration: 240,
                    delay: 130,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: false,
                }),
            ]),

            // Wordmark settles in letter by letter, blur-to-sharp via scale/opacity
            Animated.stagger(
                55,
                letters.map((letter) =>
                    Animated.parallel([
                        Animated.timing(letter.opacity, {
                            toValue: 1,
                            duration: 240,
                            useNativeDriver: true,
                        }),
                        Animated.timing(letter.translateY, {
                            toValue: 0,
                            duration: 240,
                            easing: Easing.out(Easing.quad),
                            useNativeDriver: true,
                        }),
                        Animated.timing(letter.scale, {
                            toValue: 1,
                            duration: 240,
                            easing: Easing.out(Easing.quad),
                            useNativeDriver: true,
                        }),
                    ])
                )
            ),

            Animated.parallel([
                Animated.timing(taglineOpacity, {
                    toValue: 1,
                    duration: 260,
                    useNativeDriver: true,
                }),
                Animated.timing(taglineTranslateY, {
                    toValue: 0,
                    duration: 260,
                    useNativeDriver: true,
                }),
            ]),

            Animated.delay(260),

            // Exit
            Animated.parallel([
                Animated.timing(overlayScale, {
                    toValue: 1.15,
                    duration: 420,
                    easing: Easing.in(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(overlayOpacity, {
                    toValue: 0,
                    duration: 380,
                    easing: Easing.in(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.timing(logoGroupScale, {
                    toValue: 1.2,
                    duration: 380,
                    useNativeDriver: true,
                }),
            ]),
        ]).start(() => onFinish());
    }, []);

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
                        style={{
                            opacity: logoGroupOpacity,
                            transform: [{ scale: logoGroupScale }],
                        }}
                    >
                        <Svg width={104} height={104} viewBox="0 0 200 200">
                            <Defs>
                                <SvgLinearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <Stop offset="0%" stopColor="#2DD4BF" />
                                    <Stop offset="100%" stopColor="#1B4FD8" />
                                </SvgLinearGradient>
                                <SvgLinearGradient id="lGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <Stop offset="0%" stopColor="#2DD4BF" />
                                    <Stop offset="100%" stopColor="#1B4FD8" />
                                </SvgLinearGradient>
                                <SvgLinearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <Stop offset="0%" stopColor="#2DD4BF" stopOpacity={0.35} />
                                    <Stop offset="100%" stopColor="#2DD4BF" stopOpacity={0} />
                                </SvgLinearGradient>
                            </Defs>

                            {/* Back accent rect — fades in behind, no longer a pulsing circle */}
                            <AnimatedRect
                                x="50"
                                y="40"
                                width="100"
                                height="130"
                                rx="16"
                                fill="none"
                                stroke="#2A4470"
                                strokeWidth="3"
                                transform="rotate(-10 100 100)"
                                opacity={backAccentOpacity}
                            />

                            {/* Front document — stroke draws on, then fill lands */}
                            <AnimatedRect
                                x="58"
                                y="42"
                                width="100"
                                height="130"
                                rx="16"
                                fill="#132240"
                                fillOpacity={frontFillOpacity}
                                stroke="url(#edgeGrad)"
                                strokeWidth="3"
                                strokeDasharray={[FRONT_RECT_PERIMETER, FRONT_RECT_PERIMETER]}
                                strokeDashoffset={frontDashOffset}
                            />

                            {/* One-time light sweep across the filled document */}
                            <AnimatedPath
                                d="M 58 90 L 158 55 L 158 90 L 58 125 Z"
                                fill="url(#beamGrad)"
                                opacity={beamOpacity}
                            />

                            {/* Folded corner */}
                            <AnimatedPath
                                d="M 138 42 L 158 42 L 158 62 Z"
                                fill="url(#edgeGrad)"
                                opacity={cornerOpacity}
                            />

                            {/* "L" mark — two highlighter strokes, top-down then left-right */}
                            <AnimatedRect x="80" y="78" width="14" height={barHeight} rx="7" fill="url(#lGrad)" />
                            <AnimatedRect x="80" y="122" width={barWidth} height="14" rx="7" fill="url(#lGrad)" />
                        </Svg>
                    </Animated.View>

                    <View style={styles.wordmarkRow}>
                        {BRAND_NAME.split('').map((char, i) => (
                            <Animated.Text
                                key={i}
                                style={[
                                    styles.brandName,
                                    {
                                        opacity: letters[i].opacity,
                                        transform: [
                                            { translateY: letters[i].translateY },
                                            { scale: letters[i].scale },
                                        ],
                                    },
                                ]}
                            >
                                {char}
                            </Animated.Text>
                        ))}
                    </View>

                    <Animated.Text
                        style={[
                            styles.brandTagline,
                            {
                                opacity: taglineOpacity,
                                transform: [{ translateY: taglineTranslateY }],
                            },
                        ]}
                    >
                        Legal documents, simplified
                    </Animated.Text>
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
    wordmarkRow: {
        flexDirection: 'row',
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