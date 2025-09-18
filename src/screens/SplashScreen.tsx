import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, ANIMATIONS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
    onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const logoScaleAnim = useRef(new Animated.Value(0.5)).current;
    const logoRotateAnim = useRef(new Animated.Value(0)).current;
    const textSlideAnim = useRef(new Animated.Value(50)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Sequence of animations
        const animationSequence = Animated.sequence([
            // 1. Logo entrance with scale and rotation
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.spring(logoScaleAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                    ...ANIMATIONS.springBouncy,
                }),
                Animated.timing(logoRotateAnim, {
                    toValue: 1,
                    duration: 1200,
                    useNativeDriver: true,
                }),
            ]),

            // 2. Text entrance
            Animated.parallel([
                Animated.spring(textSlideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    ...ANIMATIONS.springGentle,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ]),

            // 3. Progress bar animation
            Animated.timing(progressAnim, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: false,
            }),

            // 4. Final pulse and fade out
            Animated.parallel([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]),
        ]);

        // Start the animation sequence
        animationSequence.start();

        // Call onFinish after total duration
        const timer = setTimeout(() => {
            onFinish();
        }, 4500); // Total animation duration

        return () => clearTimeout(timer);
    }, []);

    const logoRotation = logoRotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, width * 0.6],
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            <LinearGradient
                colors={COLORS.primaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.background}
            >
                {/* Background decorative elements */}
                <View style={styles.backgroundDecorations}>
                    <View style={[styles.decorationCircle, styles.circle1]} />
                    <View style={[styles.decorationCircle, styles.circle2]} />
                    <View style={[styles.decorationCircle, styles.circle3]} />
                    <View style={[styles.decorationCircle, styles.circle4]} />
                </View>

                {/* Main content */}
                <Animated.View
                    style={[
                        styles.content,
                        {
                            opacity: fadeAnim,
                        },
                    ]}
                >
                    {/* Logo Section */}
                    <View style={styles.logoSection}>
                        <Animated.View
                            style={[
                                styles.logoContainer,
                                {
                                    transform: [
                                        { scale: logoScaleAnim },
                                        { rotate: logoRotation },
                                    ],
                                },
                            ]}
                        >
                            <Animated.View
                                style={[
                                    styles.logoInner,
                                    {
                                        transform: [{ scale: pulseAnim }],
                                    },
                                ]}
                            >
                                <LinearGradient
                                    colors={COLORS.secondaryGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.logoGradient}
                                >
                                    <Ionicons name="car" size={60} color={COLORS.textInverse} />
                                </LinearGradient>

                                {/* Logo glow effects */}
                                <View style={styles.logoGlow1} />
                                <View style={styles.logoGlow2} />
                            </Animated.View>
                        </Animated.View>

                        {/* App Title */}
                        <Animated.View
                            style={[
                                styles.titleContainer,
                                {
                                    transform: [{ translateY: textSlideAnim }],
                                },
                            ]}
                        >
                            <Text style={styles.appTitle}>Trip Treker</Text>
                            <Text style={styles.appSubtitle}>Manage your fleet with ease</Text>
                        </Animated.View>
                    </View>

                    {/* Progress Section */}
                    <View style={styles.progressSection}>
                        <View style={styles.progressBarContainer}>
                            <Animated.View
                                style={[
                                    styles.progressBar,
                                    {
                                        width: progressWidth,
                                    },
                                ]}
                            />
                        </View>
                        <Text style={styles.loadingText}>Loading...</Text>
                    </View>
                </Animated.View>

                {/* Floating particles */}
                <View style={styles.particles}>
                    <View style={[styles.particle, styles.particle1]} />
                    <View style={[styles.particle, styles.particle2]} />
                    <View style={[styles.particle, styles.particle3]} />
                    <View style={[styles.particle, styles.particle4]} />
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
    },
    backgroundDecorations: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    decorationCircle: {
        position: 'absolute',
        borderRadius: 9999,
        opacity: 0.06,
    },
    circle1: {
        width: 300,
        height: 300,
        backgroundColor: COLORS.textInverse,
        top: -150,
        right: -100,
    },
    circle2: {
        width: 200,
        height: 200,
        backgroundColor: COLORS.textInverse,
        bottom: -100,
        left: -100,
    },
    circle3: {
        width: 150,
        height: 150,
        backgroundColor: COLORS.textInverse,
        top: '40%',
        right: -50,
    },
    circle4: {
        width: 100,
        height: 100,
        backgroundColor: COLORS.textInverse,
        top: '20%',
        left: -30,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SIZES.spacingXl,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: SIZES.spacingXxl,
    },
    logoContainer: {
        marginBottom: SIZES.spacingXl,
        position: 'relative',
    },
    logoInner: {
        position: 'relative',
    },
    logoGradient: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        ...SIZES.shadowLarge,
    },
    logoGlow1: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: COLORS.textInverse,
        opacity: 0.1,
        top: -10,
        left: -10,
        zIndex: -1,
    },
    logoGlow2: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: COLORS.textInverse,
        opacity: 0.05,
        top: -20,
        left: -20,
        zIndex: -2,
    },
    titleContainer: {
        alignItems: 'center',
    },
    appTitle: {
        fontSize: SIZES.fontSizeDisplay + 8,
        fontWeight: '900' as const,
        color: COLORS.textInverse,
        marginBottom: SIZES.spacingSm,
        textAlign: 'center',
        letterSpacing: 2,
    },
    appSubtitle: {
        fontSize: SIZES.fontSizeLg + 2,
        color: COLORS.textInverse,
        opacity: 0.9,
        fontWeight: '500' as const,
        textAlign: 'center',
        letterSpacing: 1,
    },
    progressSection: {
        alignItems: 'center',
        width: '100%',
    },
    progressBarContainer: {
        width: width * 0.6,
        height: 4,
        backgroundColor: COLORS.glassVeryLight,
        borderRadius: 2,
        marginBottom: SIZES.spacingLg,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: COLORS.textInverse,
        borderRadius: 2,
        opacity: 0.8,
    },
    loadingText: {
        fontSize: SIZES.fontSizeMd,
        color: COLORS.textInverse,
        opacity: 0.8,
        fontWeight: '500' as const,
        letterSpacing: 1,
    },
    particles: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    particle: {
        position: 'absolute',
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.textInverse,
        opacity: 0.3,
    },
    particle1: {
        top: '20%',
        left: '10%',
    },
    particle2: {
        top: '60%',
        right: '15%',
    },
    particle3: {
        top: '80%',
        left: '20%',
    },
    particle4: {
        top: '30%',
        right: '25%',
    },
});

export default SplashScreen;
