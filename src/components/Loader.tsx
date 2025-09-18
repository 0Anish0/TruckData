import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    StatusBar,
    Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, ANIMATIONS } from '../constants/theme';

const { width } = Dimensions.get('window');

interface LoaderProps {
    message?: string;
    size?: 'small' | 'medium' | 'large';
    showProgress?: boolean;
    iconName?: keyof typeof Ionicons.glyphMap;
}

const Loader: React.FC<LoaderProps> = ({
    message = 'Loading...',
    size = 'medium',
    showProgress = true,
    iconName = 'car'
}) => {
    const insets = useSafeAreaInsets();
    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const logoScaleAnim = useRef(new Animated.Value(0.8)).current;
    const logoRotateAnim = useRef(new Animated.Value(0)).current;
    const textSlideAnim = useRef(new Animated.Value(20)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    // Size configurations
    const sizeConfig = {
        small: {
            logoSize: 60,
            iconSize: 30,
            fontSize: SIZES.fontSizeSm,
            spacing: SIZES.spacingMd,
        },
        medium: {
            logoSize: 80,
            iconSize: 40,
            fontSize: SIZES.fontSizeMd,
            spacing: SIZES.spacingLg,
        },
        large: {
            logoSize: 100,
            iconSize: 50,
            fontSize: SIZES.fontSizeLg,
            spacing: SIZES.spacingXl,
        },
    };

    const config = sizeConfig[size];

    useEffect(() => {
        // Start animations
        const animationSequence = Animated.sequence([
            // 1. Fade in and scale up
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.spring(logoScaleAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                    ...ANIMATIONS.springGentle,
                }),
            ]),

            // 2. Text slide in
            Animated.spring(textSlideAnim, {
                toValue: 0,
                useNativeDriver: true,
                ...ANIMATIONS.springGentle,
            }),

            // 3. Progress animation
            Animated.timing(progressAnim, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: false,
            }),
        ]);

        animationSequence.start();

        // Continuous rotation animation
        const rotationAnimation = Animated.loop(
            Animated.timing(logoRotateAnim, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
            })
        );

        // Pulse animation
        const pulseAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );

        rotationAnimation.start();
        pulseAnimation.start();

        return () => {
            rotationAnimation.stop();
            pulseAnimation.stop();
        };
    }, []);

    const logoRotation = logoRotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, width * 0.4],
    });

    return (
        <Modal
            visible={true}
            transparent={true}
            animationType="fade"
            statusBarTranslucent={true}
        >
            <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
                <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
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
                                    colors={COLORS.primaryGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={[
                                        styles.logoGradient,
                                        {
                                            width: config.logoSize,
                                            height: config.logoSize,
                                            borderRadius: config.logoSize / 2,
                                        },
                                    ]}
                                >
                                    <Ionicons
                                        name={iconName}
                                        size={config.iconSize}
                                        color={COLORS.textInverse}
                                    />
                                </LinearGradient>

                                {/* Logo glow effects */}
                                <View
                                    style={[
                                        styles.logoGlow1,
                                        {
                                            width: config.logoSize + 20,
                                            height: config.logoSize + 20,
                                            borderRadius: (config.logoSize + 20) / 2,
                                            top: -10,
                                            left: -10,
                                        },
                                    ]}
                                />
                                <View
                                    style={[
                                        styles.logoGlow2,
                                        {
                                            width: config.logoSize + 40,
                                            height: config.logoSize + 40,
                                            borderRadius: (config.logoSize + 40) / 2,
                                            top: -20,
                                            left: -20,
                                        },
                                    ]}
                                />
                            </Animated.View>
                        </Animated.View>

                        {/* Loading Text */}
                        <Animated.View
                            style={[
                                styles.textContainer,
                                {
                                    transform: [{ translateY: textSlideAnim }],
                                    marginTop: config.spacing,
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.loadingText,
                                    {
                                        fontSize: config.fontSize,
                                    },
                                ]}
                            >
                                {message}
                            </Text>
                        </Animated.View>
                    </View>

                    {/* Progress Section */}
                    {showProgress && (
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
                        </View>
                    )}
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: SIZES.spacingXl,
    },
    logoSection: {
        alignItems: 'center',
    },
    logoContainer: {
        position: 'relative',
    },
    logoInner: {
        position: 'relative',
    },
    logoGradient: {
        alignItems: 'center',
        justifyContent: 'center',
        ...SIZES.shadowMedium,
    },
    logoGlow1: {
        position: 'absolute',
        backgroundColor: COLORS.primary,
        opacity: 0.1,
        zIndex: -1,
    },
    logoGlow2: {
        position: 'absolute',
        backgroundColor: COLORS.primary,
        opacity: 0.05,
        zIndex: -2,
    },
    textContainer: {
        alignItems: 'center',
    },
    loadingText: {
        color: COLORS.textPrimary,
        fontWeight: '600' as const,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    progressSection: {
        alignItems: 'center',
        width: '100%',
        marginTop: SIZES.spacingLg,
    },
    progressBarContainer: {
        width: width * 0.4,
        height: 3,
        backgroundColor: COLORS.borderLight,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 2,
    },
});

export default Loader;