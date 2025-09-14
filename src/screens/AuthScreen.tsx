import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, SIZES, ANIMATIONS } from '../constants/theme';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';

const { width } = Dimensions.get('window');

const AuthScreen: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.8)).current;
  const formSlideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: ANIMATIONS.slow,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        ...ANIMATIONS.springGentle,
      }),
      Animated.spring(logoScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        ...ANIMATIONS.springBouncy,
      }),
      Animated.timing(formSlideAnim, {
        toValue: 0,
        duration: ANIMATIONS.slow + 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle pulse animation for logo
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin && !name.trim()) {
      newErrors.name = 'Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrors({}); // Clear previous errors

    try {
      if (isLogin) {
        await signIn(email, password);
        // If sign in is successful, the auth state change will handle navigation
      } else {
        await signUp(email, password, name);
        // After signup, clear the form and show success message
        setEmail('');
        setPassword('');
        setName('');
        // Don't switch to login mode automatically - let user choose
      }
    } catch (error: unknown) {
      console.error('Auth error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred. Please try again.';

      // Set specific field errors if possible
      if (errorMessage.includes('email')) {
        setErrors({ email: errorMessage });
      } else if (errorMessage.includes('password')) {
        setErrors({ password: errorMessage });
      } else {
        setErrors({ general: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setEmail('');
    setPassword('');
    setName('');
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
          <View style={[styles.decorationCircle, styles.decorationCircle1]} />
          <View style={[styles.decorationCircle, styles.decorationCircle2]} />
          <View style={[styles.decorationCircle, styles.decorationCircle3]} />
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
            {/* Logo Section */}
            <Animated.View
              style={[
                styles.logoSection,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateY: slideAnim },
                    { scale: logoScaleAnim },
                  ],
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.logoContainer,
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
                  <Ionicons name="car" size={52} color={COLORS.textInverse} />
                </LinearGradient>
                {/* Logo glow effect */}
                <View style={styles.logoGlow} />
              </Animated.View>
              <Text style={styles.appTitle}>Truck Fleet</Text>
              <Text style={styles.appSubtitle}>
                Manage your fleet with ease
              </Text>
            </Animated.View>

            {/* Form Section */}
            <Animated.View
              style={[
                styles.formSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: formSlideAnim }],
                },
              ]}
            >
              <View style={styles.formContainer}>
                <Text style={styles.formTitle}>
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </Text>
                <Text style={styles.formSubtitle}>
                  {isLogin
                    ? 'Sign in to continue to your dashboard'
                    : 'Sign up to start managing your fleet'}
                </Text>

                {!isLogin && (
                  <View style={styles.verificationHint}>
                    <Ionicons name="mail" size={16} color={COLORS.info} />
                    <Text style={styles.verificationText}>
                      You'll receive a verification email after signing up
                    </Text>
                  </View>
                )}

                {errors.general && (
                  <View style={styles.generalErrorContainer}>
                    <Ionicons name="alert-circle" size={16} color={COLORS.error} />
                    <Text style={styles.generalErrorText}>
                      {errors.general}
                    </Text>
                  </View>
                )}

                <View style={styles.inputContainer}>
                  {!isLogin && (
                    <CustomInput
                      label="Full Name"
                      value={name}
                      onChangeText={setName}
                      leftIcon="person"
                      error={errors.name}
                      placeholder="Enter your full name"
                      autoCapitalize="words"
                      textContentType="name"
                    />
                  )}

                  <CustomInput
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    leftIcon="mail"
                    error={errors.email}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    textContentType="emailAddress"
                  />

                  <CustomInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    leftIcon="lock-closed"
                    error={errors.password}
                    placeholder="Enter your password"
                    secureTextEntry
                    textContentType={isLogin ? 'password' : 'newPassword'}
                  />

                  <CustomButton
                    title={isLogin ? 'Sign In' : 'Create Account'}
                    onPress={handleSubmit}
                    loading={loading}
                    variant="primary"
                    size="large"
                    fullWidth
                    icon={isLogin ? 'log-in' : 'person-add'}
                    style={styles.submitButton}
                  />

                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>or</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <CustomButton
                    title={isLogin ? 'Create Account' : 'Already have an account?'}
                    onPress={toggleMode}
                    variant="ghost"
                    size="medium"
                    fullWidth
                    icon={isLogin ? 'person-add' : 'log-in'}
                    iconPosition="right"
                    style={styles.toggleButton}
                  />
                </View>
              </View>
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
    opacity: 0.1,
  },
  decorationCircle1: {
    width: 200,
    height: 200,
    backgroundColor: COLORS.textInverse,
    top: -100,
    right: -50,
  },
  decorationCircle2: {
    width: 150,
    height: 150,
    backgroundColor: COLORS.textInverse,
    bottom: -75,
    left: -75,
  },
  decorationCircle3: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.textInverse,
    top: '30%',
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
  logoSection: {
    alignItems: 'center',
    marginBottom: SIZES.spacingXxl,
  },
  logoContainer: {
    marginBottom: SIZES.spacingLg,
    position: 'relative',
  },
  logoGradient: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    ...SIZES.shadowLarge,
  },
  logoGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.textInverse,
    opacity: 0.2,
    top: -5,
    left: -5,
    zIndex: -1,
  },
  appTitle: {
    fontSize: SIZES.fontSizeDisplay,
    fontWeight: '800' as const,
    color: COLORS.textInverse,
    marginBottom: SIZES.spacingXs,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: SIZES.fontSizeLg,
    color: COLORS.textInverse,
    opacity: 0.9,
    fontWeight: '500' as const,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: SIZES.spacingXl,
  },
  formContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusXl,
    padding: SIZES.spacingXl,
    ...SIZES.shadowLarge,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  formTitle: {
    fontSize: SIZES.fontSizeXxl,
    fontWeight: '700' as const,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SIZES.spacingXs,
  },
  formSubtitle: {
    fontSize: SIZES.fontSizeMd,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.spacingMd,
    lineHeight: 22,
  },
  verificationHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.infoLight,
    padding: SIZES.spacingSm,
    borderRadius: SIZES.radiusMd,
    marginBottom: SIZES.spacingLg,
    borderWidth: 1,
    borderColor: COLORS.info,
  },
  verificationText: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.info,
    marginLeft: SIZES.spacingXs,
    textAlign: 'center',
  },
  generalErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    padding: SIZES.spacingSm,
    borderRadius: SIZES.radiusMd,
    marginBottom: SIZES.spacingLg,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  generalErrorText: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.error,
    marginLeft: SIZES.spacingXs,
    textAlign: 'center',
    fontWeight: '500' as const,
  },
  inputContainer: {
    gap: SIZES.spacingXs,
  },
  submitButton: {
    marginTop: SIZES.spacingXs,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SIZES.spacingXs,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.textTertiary,
    fontWeight: '600' as const,
    marginHorizontal: SIZES.spacingLg,
  },
  toggleButton: {
    marginTop: SIZES.spacingSm,
  },
  demoInfo: {
    alignItems: 'center',
  },
  demoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glassVeryLight,
    paddingHorizontal: SIZES.spacingLg,
    paddingVertical: SIZES.spacingMd,
    borderRadius: SIZES.radiusLg,
    maxWidth: width * 0.8,
  },
  demoText: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.textInverse,
    marginLeft: SIZES.spacingSm,
    fontWeight: '500' as const,
    textAlign: 'center',
    flex: 1,
  },
});

export default AuthScreen;
