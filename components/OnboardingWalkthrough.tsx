import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface OnboardingStep {
    ref: React.RefObject<View | null>;
    title: string;
    description: string;
}

interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface Props {
    steps: OnboardingStep[];
    onComplete: () => void;
}

export default function OnboardingWalkthrough({ steps, onComplete }: Props) {
    const [stepIndex, setStepIndex] = useState(0);
    const [rect, setRect] = useState<Rect | null>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const currentStep = steps[stepIndex];
    const isLastStep = stepIndex === steps.length - 1;

    useEffect(() => {
        if (!currentStep?.ref?.current) {
            setRect(null);
            return;
        }

        const frame = requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                currentStep.ref.current?.measureInWindow((x, y, width, height) => {
                    setRect({ x, y, width, height });
                });
            });
        });

        return () => cancelAnimationFrame(frame);
    }, [stepIndex]);

    useEffect(() => {
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
        }).start();
    }, [stepIndex]);

    function handleNext() {
        if (isLastStep) {
            onComplete();
        } else {
            setStepIndex((prev) => prev + 1);
        }
    }

    function handleSkip() {
        onComplete();
    }

    if (!rect) return null;

    const padding = 8;
    const spotlight = {
        left: rect.x - padding,
        top: rect.y - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
    };

    const tooltipBelow = spotlight.top < SCREEN_HEIGHT * 0.5;
    const tooltipTop = tooltipBelow
        ? spotlight.top + spotlight.height + 16
        : undefined;
    const tooltipBottom = !tooltipBelow
        ? SCREEN_HEIGHT - spotlight.top + 16
        : undefined;

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            <View style={styles.overlayTop} pointerEvents="auto" />
            <View style={[styles.overlaySide, { top: spotlight.top, height: spotlight.height, left: 0, width: spotlight.left }]} pointerEvents="auto" />
            <View style={[styles.overlaySide, { top: spotlight.top, height: spotlight.height, left: spotlight.left + spotlight.width, right: 0 }]} pointerEvents="auto" />
            <View style={[styles.overlayBottom, { top: spotlight.top + spotlight.height }]} pointerEvents="auto" />

            <View
                style={[
                    styles.spotlightBorder,
                    {
                        left: spotlight.left,
                        top: spotlight.top,
                        width: spotlight.width,
                        height: spotlight.height,
                    },
                ]}
                pointerEvents="none"
            />

            <Animated.View
                style={[
                    styles.tooltip,
                    tooltipTop !== undefined ? { top: tooltipTop } : { bottom: tooltipBottom },
                    { opacity: fadeAnim },
                ]}
            >
                <View style={styles.tooltipHeader}>
                    <Text style={styles.tooltipTitle}>{currentStep.title}</Text>
                    <TouchableOpacity onPress={handleSkip} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.tooltipDescription}>{currentStep.description}</Text>

                <View style={styles.tooltipFooter}>
                    <View style={styles.dotsRow}>
                        {steps.map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.dot,
                                    i === stepIndex && styles.dotActive,
                                ]}
                            />
                        ))}
                    </View>
                    <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.85}>
                        <Text style={styles.nextButtonText}>{isLastStep ? 'Done' : 'Next'}</Text>
                        <Ionicons name={isLastStep ? 'checkmark' : 'arrow-forward'} size={16} color="#0A1628" />
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlayTop: {
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 0,
        backgroundColor: 'rgba(10,22,40,0.82)',
    },
    overlaySide: {
        position: 'absolute',
        backgroundColor: 'rgba(10,22,40,0.82)',
    },
    overlayBottom: {
        position: 'absolute',
        left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(10,22,40,0.82)',
    },
    spotlightBorder: {
        position: 'absolute',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#2DD4BF',
    },
    tooltip: {
        position: 'absolute',
        left: 24,
        right: 24,
        backgroundColor: '#132240',
        borderColor: '#2A4470',
        borderWidth: 1,
        borderRadius: 16,
        padding: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 14,
        elevation: 10,
    },
    tooltipHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    tooltipTitle: {
        color: '#F0F4FF',
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
    },
    skipText: {
        color: '#8A9BBF',
        fontSize: 13,
        fontWeight: '600',
    },
    tooltipDescription: {
        color: '#8A9BBF',
        fontSize: 13,
        lineHeight: 19,
        marginBottom: 16,
    },
    tooltipFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dotsRow: {
        flexDirection: 'row',
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#2A4470',
    },
    dotActive: {
        backgroundColor: '#2DD4BF',
        width: 18,
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#2DD4BF',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    nextButtonText: {
        color: '#0A1628',
        fontSize: 13,
        fontWeight: '700',
    },
});