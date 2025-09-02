import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';

interface AuthScreenProps {
  navigation: any;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ navigation }) => {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          Alert.alert('Error', error.message);
        }
      } else {
        const { error } = await signUp(email, password, name);
        if (error) {
          Alert.alert('Error', error.message);
        } else {
          Alert.alert(
            'Success!',
            'Account created successfully. Please check your email to verify your account.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          {/* Logo and Title */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="car-sport" size={88} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Truck Fleet Manager</Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'Welcome back!' : 'Create your account'}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {!isLogin && (
              <CustomInput
                label="Full Name"
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                required
              />
            )}
            
            <CustomInput
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              required
            />
            
            <CustomInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              required
            />

            <CustomButton
              title={isLogin ? 'Sign In' : 'Sign Up'}
              onPress={handleSubmit}
              variant="primary"
              size="large"
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
            />
          </View>

          {/* Toggle Mode */}
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </Text>
            <TouchableOpacity onPress={toggleMode} activeOpacity={0.7}>
              <Text style={styles.toggleButton}>
                {isLogin ? 'Sign Up' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SIZES.spacingXl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES.spacingXxl,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.spacingLg,
    ...SIZES.shadow,
  },
  title: {
    fontSize: SIZES.fontSizeXxl,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacingSm,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  form: {
    marginBottom: SIZES.spacingXl,
  },
  submitButton: {
    marginTop: SIZES.spacingLg,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.spacingLg,
  },
  toggleText: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  toggleButton: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  demoInfo: {
    alignItems: 'center',
    paddingHorizontal: SIZES.spacingLg,
  },
  demoText: {
    fontSize: SIZES.fontSizeXs,
    color: COLORS.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
  },
});

export default AuthScreen;
