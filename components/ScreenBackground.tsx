import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
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

export default function ScreenBackground({
                                             orbs = [],
                                             vignette = true,
                                             children,
                                             style,
                                         }: ScreenBackgroundProps) {
    return (
        <LinearGradient colors={['#0A1628', '#0F1F3A']} style={[styles.gradient, style]}>
            {orbs.map((orb, index) => (
                <View
                    key={index}
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
                        },
                    ]}
                />
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