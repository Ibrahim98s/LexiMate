import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, ViewStyle, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Line, Circle } from 'react-native-svg';

type Orb = {
    color: string;
    size: number;
    opacity: number;
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
};

type LawIcon = {
    type: 'scale' | 'gavel';
    size: number;
    opacity: number;
    color: string;
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    rotate?: string; // e.g. '-15deg'
};

type ScreenBackgroundProps = {
    orbs?: Orb[];
    lawIcons?: LawIcon[];
    vignette?: boolean;
    children: React.ReactNode;
    style?: ViewStyle;
};

function DriftingOrb({ orb, index }: { orb: Orb; index: number }) {
    const drift = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const duration = 4500 + index * 1200; // faster, still staggered
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(drift, {
                    toValue: 1,
                    duration,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(drift, {
                    toValue: 0,
                    duration,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, []);

    const driftX = index % 2 === 0 ? 70 : -70;
    const driftY = index % 2 === 0 ? -55 : 55;

    const translateX = drift.interpolate({ inputRange: [0, 1], outputRange: [0, driftX] });
    const translateY = drift.interpolate({ inputRange: [0, 1], outputRange: [0, driftY] });

    return (
        <Animated.View
            pointerEvents="none"
            style={[
                styles.orb,
                {
                    width: orb.size,
                    height: orb.size,
                    borderRadius: orb.size / 2,
                    backgroundColor: orb.color,
                    opacity: orb.opacity,
                    top: orb.top,
                    bottom: orb.bottom,
                    left: orb.left,
                    right: orb.right,
                    transform: [{ translateX }, { translateY }],
                },
            ]}
        />
    );
}

// Scale of justice — simplified outline, drawn on a 100x100 viewBox
function ScaleGlyph({ size, color }: { size: number; color: string }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
            <Line x1="50" y1="10" x2="50" y2="82" stroke={color} strokeWidth="3" strokeLinecap="round" />
            <Line x1="18" y1="24" x2="82" y2="24" stroke={color} strokeWidth="3" strokeLinecap="round" />
            <Line x1="50" y1="86" x2="34" y2="94" stroke={color} strokeWidth="3" strokeLinecap="round" />
            <Line x1="50" y1="86" x2="66" y2="94" stroke={color} strokeWidth="3" strokeLinecap="round" />
            <Line x1="30" y1="94" x2="70" y2="94" stroke={color} strokeWidth="3" strokeLinecap="round" />

            {/* left pan */}
            <Line x1="18" y1="24" x2="8" y2="50" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            <Line x1="18" y1="24" x2="28" y2="50" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            <Path d="M6 50 Q18 64 30 50" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />

            {/* right pan */}
            <Line x1="82" y1="24" x2="72" y2="50" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            <Line x1="82" y1="24" x2="92" y2="50" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            <Path d="M70 50 Q82 64 94 50" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />

            <Circle cx="50" cy="14" r="5" stroke={color} strokeWidth="3" fill="none" />
        </Svg>
    );
}

// Gavel — simplified outline, drawn on a 100x100 viewBox
function GavelGlyph({ size, color }: { size: number; color: string }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
            <Path
                d="M34 18 L52 36 L44 44 L26 26 Z"
                stroke={color}
                strokeWidth="3"
                strokeLinejoin="round"
                fill="none"
            />
            <Path
                d="M48 32 L66 50 L58 58 L40 40 Z"
                stroke={color}
                strokeWidth="3"
                strokeLinejoin="round"
                fill="none"
            />
            <Line x1="42" y1="46" x2="16" y2="72" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
            <Line x1="14" y1="86" x2="46" y2="86" stroke={color} strokeWidth="3" strokeLinecap="round" />
            <Line x1="58" y1="66" x2="86" y2="66" stroke={color} strokeWidth="3" strokeLinecap="round" />
            <Line x1="72" y1="52" x2="72" y2="80" stroke={color} strokeWidth="3" strokeLinecap="round" />
        </Svg>
    );
}

function DriftingLawIcon({ icon, index }: { icon: LawIcon; index: number }) {
    const drift = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const duration = 6000 + index * 1500;
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(drift, {
                    toValue: 1,
                    duration,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(drift, {
                    toValue: 0,
                    duration,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, []);

    const driftY = index % 2 === 0 ? -14 : 14;
    const translateY = drift.interpolate({ inputRange: [0, 1], outputRange: [0, driftY] });

    return (
        <Animated.View
            pointerEvents="none"
            style={[
                styles.lawIcon,
                {
                    opacity: icon.opacity,
                    top: icon.top,
                    bottom: icon.bottom,
                    left: icon.left,
                    right: icon.right,
                    transform: [
                        { translateY },
                        ...(icon.rotate ? [{ rotate: icon.rotate }] : []),
                    ],
                },
            ]}
        >
            {icon.type === 'scale' ? (
                <ScaleGlyph size={icon.size} color={icon.color} />
            ) : (
                <GavelGlyph size={icon.size} color={icon.color} />
            )}
        </Animated.View>
    );
}

export default function ScreenBackground({
                                             orbs = [],
                                             lawIcons = [],
                                             vignette = true,
                                             children,
                                             style,
                                         }: ScreenBackgroundProps) {
    return (
        <LinearGradient colors={['#0A1628', '#0F1F3A']} style={[styles.gradient, style]}>
            {orbs.map((orb, index) => (
                <DriftingOrb key={index} orb={orb} index={index} />
            ))}

            {lawIcons.map((icon, index) => (
                <DriftingLawIcon key={index} icon={icon} index={index} />
            ))}

            {vignette && (
                <LinearGradient
                    pointerEvents="none"
                    colors={['rgba(0,0,0,0.28)', 'rgba(0,0,0,0)']}
                    style={styles.topVignette}
                />
            )}

            {children}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: { flex: 1 },
    orb: {
        position: 'absolute',
    },
    lawIcon: {
        position: 'absolute',
    },
    topVignette: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 160,
    },
});