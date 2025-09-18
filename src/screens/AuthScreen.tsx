import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Animated,
    Dimensions,
    StatusBar,
    TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, SIZES, ANIMATIONS } from '../constants/theme';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';

const { width, height } = Dimensions.get('window');

interface FormData {
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
}

interface FormErrors {
    email?: string;
    password?: string;
    confirmPassword?: string;
    fullName?: string;
    general?: string;
}

const AuthScreen: React.FC = () => {
    const { signIn, signUp } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});

    // Animation values
    const formOpacityAnim = useRef(new Animated.Value(0)).current;
    const formTranslateAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        // Form entrance animations
        const entranceAnimation = Animated.parallel([
            Animated.timing(formOpacityAnim, {
                toValue: 1,
                duration: ANIMATIONS.slow,
                useNativeDriver: true,
            }),
            Animated.timing(formTranslateAnim, {
                toValue: 0,
                duration: ANIMATIONS.slow,
                useNativeDriver: true,
            }),
        ]);

        entranceAnimation.start();
    }, []);

    const updateFormData = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!formData.password.trim()) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        // Signup specific validations
        if (!isLogin) {
            if (!formData.fullName.trim()) {
                newErrors.fullName = 'Full name is required';
            } else if (formData.fullName.trim().length < 2) {
                newErrors.fullName = 'Name must be at least 2 characters';
            }

            if (!formData.confirmPassword.trim()) {
                newErrors.confirmPassword = 'Please confirm your password';
            } else if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setErrors({});

        try {
            if (isLogin) {
                await signIn(formData.email, formData.password);
            } else {
                await signUp(formData.email, formData.password, formData.fullName);
                // Clear form after successful signup
                setFormData({
                    email: '',
                    password: '',
                    confirmPassword: '',
                    fullName: '',
                });
            }
        } catch (error: unknown) {
            console.error('Auth error:', error);
            const errorMessage = error instanceof Error ? error.message : 'An error occurred. Please try again.';

            // Set specific field errors if possible
            if (errorMessage.toLowerCase().includes('email')) {
                setErrors({ email: errorMessage });
            } else if (errorMessage.toLowerCase().includes('password')) {
                setErrors({ password: errorMessage });
            } else {
                setErrors({ general: errorMessage });
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
        setErrors({});
        setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            fullName: '',
        });

        // Animate form transition
        Animated.sequence([
            Animated.timing(formOpacityAnim, {
                toValue: 0.3,
                duration: ANIMATIONS.fast,
                useNativeDriver: true,
            }),
            Animated.timing(formOpacityAnim, {
                toValue: 1,
                duration: ANIMATIONS.fast,
                useNativeDriver: true,
            }),
        ]).start();
    };

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
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardAvoidingView}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >

                        {/* Form Section */}
                        <Animated.View
                            style={[
                                styles.formSection,
                                {
                                    opacity: formOpacityAnim,
                                    transform: [{ translateY: formTranslateAnim }],
                                },
                            ]}
                        >
                            <View style={styles.formHeader}>
                                <Text style={styles.formTitle}>
                                    {isLogin ? 'Welcome Back' : 'Create Account'}
                                </Text>
                                <Text style={styles.formSubtitle}>
                                    {isLogin
                                        ? 'Sign in to continue to your dashboard'
                                        : 'Join us to start managing your fleet'}
                                </Text>
                            </View>

                            {/* General Error Display */}
                            {errors.general && (
                                <View style={styles.errorContainer}>
                                    <Ionicons name="alert-circle" size={20} color={COLORS.error} />
                                    <Text style={styles.errorText}>{errors.general}</Text>
                                </View>
                            )}

                            {/* Form Fields */}
                            <View style={styles.formFields}>
                                {!isLogin && (
                                    <CustomInput
                                        label="Full Name"
                                        value={formData.fullName}
                                        onChangeText={(value) => updateFormData('fullName', value)}
                                        leftIcon="person"
                                        error={errors.fullName}
                                        placeholder="Enter your full name"
                                        autoCapitalize="words"
                                        textContentType="name"
                                        containerStyle={styles.inputContainer}
                                    />
                                )}

                                <CustomInput
                                    label="Email"
                                    value={formData.email}
                                    onChangeText={(value) => updateFormData('email', value)}
                                    leftIcon="mail"
                                    error={errors.email}
                                    placeholder="Enter your email"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    textContentType="emailAddress"
                                    containerStyle={styles.inputContainer}
                                />

                                <CustomInput
                                    label="Password"
                                    value={formData.password}
                                    onChangeText={(value) => updateFormData('password', value)}
                                    leftIcon="lock-closed"
                                    error={errors.password}
                                    placeholder="Enter your password"
                                    secureTextEntry
                                    textContentType={isLogin ? 'password' : 'newPassword'}
                                    containerStyle={styles.inputContainer}
                                />

                                {!isLogin && (
                                    <CustomInput
                                        label="Confirm Password"
                                        value={formData.confirmPassword}
                                        onChangeText={(value) => updateFormData('confirmPassword', value)}
                                        leftIcon="lock-closed"
                                        error={errors.confirmPassword}
                                        placeholder="Confirm your password"
                                        secureTextEntry
                                        textContentType="newPassword"
                                        containerStyle={styles.inputContainer}
                                    />
                                )}
                            </View>

                            {/* Submit Button */}
                            <CustomButton
                                title={isLogin ? 'Sign In' : 'Create Account'}
                                onPress={handleSubmit}
                                loading={loading}
                                variant="secondary"
                                size="medium"
                                fullWidth
                                icon={isLogin ? 'log-in' : 'person-add'}
                                shape="pill"
                                uppercase
                                style={styles.submitButton}
                            />

                            {/* Divider */}
                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>or</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            {/* Toggle Text */}
                            <TouchableOpacity onPress={toggleAuthMode} style={styles.toggleTextContainer}>
                                <Text style={styles.toggleText}>
                                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                                    <Text style={styles.toggleTextAction}>
                                        {isLogin ? 'Sign up' : 'Log in'}
                                    </Text>
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </ScrollView>
                </KeyboardAvoidingView>
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
        opacity: 0.08,
    },
    circle1: {
        width: 200,
        height: 200,
        backgroundColor: COLORS.textInverse,
        top: -100,
        right: -50,
    },
    circle2: {
        width: 150,
        height: 150,
        backgroundColor: COLORS.textInverse,
        bottom: -75,
        left: -75,
    },
    circle3: {
        width: 100,
        height: 100,
        backgroundColor: COLORS.textInverse,
        top: '35%',
        right: -25,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: SIZES.spacingLg,
        paddingVertical: SIZES.spacingXl,
    },
    formSection: {
        marginBottom: SIZES.spacingLg,
    },
    formHeader: {
        marginBottom: SIZES.spacingXl,
    },
    formTitle: {
        fontSize: SIZES.fontSizeXxl,
        fontWeight: '700' as const,
        color: COLORS.textInverse,
        textAlign: 'center',
        marginBottom: SIZES.spacingXs,
    },
    formSubtitle: {
        fontSize: SIZES.fontSizeMd,
        color: COLORS.textInverse,
        opacity: 0.9,
        textAlign: 'center',
        lineHeight: 22,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.glassVeryLight,
        padding: SIZES.spacingMd,
        borderRadius: SIZES.radiusMd,
        marginBottom: SIZES.spacingLg,
        borderWidth: 1,
        borderColor: COLORS.error,
    },
    errorText: {
        fontSize: SIZES.fontSizeSm,
        color: COLORS.error,
        marginLeft: SIZES.spacingSm,
        fontWeight: '500' as const,
        textAlign: 'center',
        flex: 1,
    },
    formFields: {
        marginBottom: SIZES.spacingLg,
    },
    inputContainer: {
        marginBottom: SIZES.spacingMd,
    },
    submitButton: {
        marginBottom: SIZES.spacingLg,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: SIZES.spacingLg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.glassLight,
    },
    dividerText: {
        fontSize: SIZES.fontSizeSm,
        color: COLORS.textInverse,
        fontWeight: '600' as const,
        marginHorizontal: SIZES.spacingLg,
        opacity: 0.8,
    },
    toggleTextContainer: {
        alignItems: 'center',
        marginTop: SIZES.spacingLg,
    },
    toggleText: {
        fontSize: SIZES.fontSizeMd,
        color: COLORS.textInverse,
        opacity: 0.9,
        textAlign: 'center',
    },
    toggleTextAction: {
        color: COLORS.accent,
        fontWeight: '600' as const,
    },
});

export default AuthScreen;
