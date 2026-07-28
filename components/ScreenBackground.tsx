import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, ViewStyle, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Orb = {
    color: string;
    size: number;
    opacity: number;
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
};

type ScreenBackgroundProps = {
    orbs?: Orb[];
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

export default function ScreenBackground({
                                             orbs = [],
                                             vignette = true,
                                             children,
                                             style,
                                         }: ScreenBackgroundProps) {
    return (
        <LinearGradient colors={['#0A1628', '#0F1F3A']} style={[styles.gradient, style]}>
            {orbs.map((orb, index) => (
                <DriftingOrb key={index} orb={orb} index={index} />
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
    topVignette: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 160,
    },
});