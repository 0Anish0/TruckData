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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/MockAuthContext';
import { COLORS, SIZES, ANIMATIONS } from '../constants/theme';
import EnhancedCustomInput from '../components/EnhancedCustomInput';
import EnhancedCustomButton from '../components/EnhancedCustomButton';

const { width } = Dimensions.get('window');

const EnhancedAuthScreen: React.FC = () => {
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
    ]).start();
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
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, name);
      }
    } catch (error: unknown) {
      Alert.alert(
        'Error',
        (error as Error).message || 'An error occurred. Please try again.',
        [{ text: 'OK' }]
      );
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
      <LinearGradient
        colors={COLORS.primaryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
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
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={COLORS.secondaryGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.logoGradient}
                >
                  <Ionicons name="car" size={48} color={COLORS.textInverse} />
                </LinearGradient>
              </View>
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
                  transform: [{ translateY: slideAnim }],
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

                <View style={styles.inputContainer}>
                  {!isLogin && (
                    <EnhancedCustomInput
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

                  <EnhancedCustomInput
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

                  <EnhancedCustomInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    leftIcon="lock-closed"
                    error={errors.password}
                    placeholder="Enter your password"
                    secureTextEntry
                    textContentType={isLogin ? 'password' : 'newPassword'}
                  />

                  <EnhancedCustomButton
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

                  <EnhancedCustomButton
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

            {/* Demo Info */}
            <Animated.View
              style={[
                styles.demoInfo,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.demoCard}>
                <Ionicons name="information-circle" size={20} color={COLORS.info} />
                <Text style={styles.demoText}>
                  Demo Mode: Use any email and password to sign in
                </Text>
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
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    ...SIZES.shadowLarge,
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
    marginBottom: SIZES.spacingXl,
    lineHeight: 22,
  },
  inputContainer: {
    gap: SIZES.spacingLg,
  },
  submitButton: {
    marginTop: SIZES.spacingMd,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SIZES.spacingLg,
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

export default EnhancedAuthScreen;
