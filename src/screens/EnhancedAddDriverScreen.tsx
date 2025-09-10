import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { mockDriverService } from '../services/mockService';
import { COLORS, SIZES, ANIMATIONS } from '../constants/theme';
import EnhancedCustomInput from '../components/EnhancedCustomInput';
import EnhancedCustomButton from '../components/EnhancedCustomButton';
import { Driver } from '../types';

const EnhancedAddDriverScreen: React.FC = () => {
  const [formData, setFormData] = useState<Omit<Driver, 'id' | 'created_at' | 'updated_at' | 'user_id'>>({
    name: '',
    age: 0,
    phone: '',
    license_number: '',
    license_image_url: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: ANIMATIONS.normal,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        ...ANIMATIONS.springGentle,
      }),
    ]).start();
  }, []);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Driver name is required';
    }
    if (!formData.age || formData.age < 18) {
      newErrors.age = 'Driver must be at least 18 years old';
    }
    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+91-\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid format. Use: +91-XXXXXXXXXX';
    }
    if (!formData.license_number?.trim()) {
      newErrors.license_number = 'License number is required';
    } else if (!/^[A-Z]{2}-\d{10}$/.test(formData.license_number)) {
      newErrors.license_number = 'Invalid format. Use: XX-XXXXXXXXXX';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await mockDriverService.createDriver({
        ...formData,
        user_id: 'user-1', // Mock user ID
      });
      
      Alert.alert(
        'Success',
        'Driver added successfully!',
        [{ text: 'OK', onPress: () => {} }]
      );
      
      // Reset form
      setFormData({
        name: '',
        age: 0,
        phone: '',
        license_number: '',
        license_image_url: '',
      });
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Failed to add driver. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      age: 0,
      phone: '',
      license_number: '',
      license_image_url: '',
    });
    setErrors({});
  };

  const formatPhoneNumber = (text: string) => {
    // Remove all non-digits
    const digits = text.replace(/\D/g, '');
    
    // Format as +91-XXXXXXXXXX
    if (digits.length <= 2) {
      return digits;
    } else if (digits.length <= 12) {
      return `+91-${digits.slice(2)}`;
    } else {
      return `+91-${digits.slice(2, 12)}`;
    }
  };

  const formatLicenseNumber = (text: string) => {
    // Remove all non-alphanumeric characters
    const cleaned = text.replace(/[^A-Z0-9]/g, '');
    
    // Format as XX-XXXXXXXXXX
    if (cleaned.length <= 2) {
      return cleaned;
    } else if (cleaned.length <= 12) {
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
    } else {
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 12)}`;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={COLORS.accentGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Add New Driver</Text>
            <Text style={styles.headerSubtitle}>
              Add a new driver to your team
            </Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="person-add" size={28} color={COLORS.textInverse} />
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Personal Information */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <Ionicons name="person" size={24} color={COLORS.accent} />
                </View>
                <Text style={styles.sectionTitle}>Personal Information</Text>
              </View>
              
              <EnhancedCustomInput
                label="Full Name"
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                leftIcon="person"
                error={errors.name}
                placeholder="Enter driver's full name"
                autoCapitalize="words"
              />

              <EnhancedCustomInput
                label="Age"
                value={(formData.age || 0).toString()}
                onChangeText={(text) => setFormData(prev => ({ ...prev, age: parseInt(text) || 0 }))}
                leftIcon="calendar"
                error={errors.age}
                placeholder="Enter driver's age"
                keyboardType="numeric"
              />

              <EnhancedCustomInput
                label="Phone Number"
                value={formData.phone || ''}
                onChangeText={(text) => setFormData(prev => ({ ...prev, phone: formatPhoneNumber(text) }))}
                leftIcon="call"
                error={errors.phone}
                placeholder="Enter phone number (+91-XXXXXXXXXX)"
                keyboardType="phone-pad"
                maxLength={14}
              />
            </View>

            {/* License Information */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <Ionicons name="card" size={24} color={COLORS.info} />
                </View>
                <Text style={styles.sectionTitle}>License Information</Text>
              </View>
              
              <EnhancedCustomInput
                label="License Number"
                value={formData.license_number || ''}
                onChangeText={(text) => setFormData(prev => ({ ...prev, license_number: formatLicenseNumber(text.toUpperCase()) }))}
                leftIcon="card"
                error={errors.license_number}
                placeholder="Enter license number (XX-XXXXXXXXXX)"
                autoCapitalize="characters"
                maxLength={13}
              />

              <EnhancedCustomInput
                label="License Image URL"
                value={formData.license_image_url || ''}
                onChangeText={(text) => setFormData(prev => ({ ...prev, license_image_url: text }))}
                leftIcon="image"
                placeholder="Enter license image URL (optional)"
                keyboardType="url"
              />
            </View>

            {/* Preview Card */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Preview</Text>
              <View style={styles.previewCard}>
                <LinearGradient
                  colors={COLORS.accentGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.previewHeader}
                >
                  <View style={styles.previewAvatar}>
                    <Ionicons name="person" size={24} color={COLORS.textInverse} />
                  </View>
                  <View style={styles.previewInfo}>
                    <Text style={styles.previewName}>
                      {formData.name || 'Driver Name'}
                    </Text>
                    <Text style={styles.previewLicense}>
                      {formData.license_number || 'XX-XXXXXXXXXX'}
                    </Text>
                  </View>
                </LinearGradient>
                
                <View style={styles.previewContent}>
                  <View style={styles.previewDetail}>
                    <Ionicons name="calendar" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.previewLabel}>Age:</Text>
                    <Text style={styles.previewValue}>
                      {formData.age || 0} years
                    </Text>
                  </View>
                  
                  <View style={styles.previewDetail}>
                    <Ionicons name="call" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.previewLabel}>Phone:</Text>
                    <Text style={styles.previewValue}>
                      {formData.phone || '+91-XXXXXXXXXX'}
                    </Text>
                  </View>
                  
                  <View style={styles.previewDetail}>
                    <Ionicons name="time" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.previewLabel}>Experience:</Text>
                    <Text style={styles.previewValue}>
                      {Math.max(0, (formData.age || 0) - 18)} years
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <EnhancedCustomButton
                title="Reset Form"
                onPress={handleReset}
                variant="outline"
                size="large"
                icon="refresh"
                style={styles.resetButton}
              />
              
              <EnhancedCustomButton
                title="Add Driver"
                onPress={handleSubmit}
                loading={loading}
                variant="primary"
                size="large"
                fullWidth
                icon="checkmark-circle"
                style={styles.submitButton}
              />
            </View>

            {/* Help Text */}
            <View style={styles.helpContainer}>
              <View style={styles.helpIcon}>
                <Ionicons name="information-circle" size={20} color={COLORS.info} />
              </View>
              <Text style={styles.helpText}>
                Make sure all information is accurate. The driver must be at least 18 years old and have a valid driving license.
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SIZES.spacingLg,
    paddingVertical: SIZES.spacingXl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: SIZES.fontSizeXxl,
    fontWeight: '700',
    color: COLORS.textInverse,
    marginBottom: SIZES.spacingXs,
  },
  headerSubtitle: {
    fontSize: SIZES.fontSizeMd,
    color: COLORS.textInverse,
    opacity: 0.9,
    fontWeight: '500',
  },
  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.glassLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SIZES.spacingLg,
    paddingBottom: SIZES.spacingXl,
  },
  formContainer: {
    marginTop: -SIZES.spacingLg,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.spacingLg,
    marginBottom: SIZES.spacingLg,
    ...SIZES.shadow,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacingLg,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.spacingMd,
  },
  sectionTitle: {
    fontSize: SIZES.fontSizeLg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  previewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
    ...SIZES.shadowMedium,
  },
  previewHeader: {
    padding: SIZES.spacingLg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.glassLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.spacingMd,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: SIZES.fontSizeLg,
    fontWeight: '700',
    color: COLORS.textInverse,
    marginBottom: SIZES.spacingXs,
  },
  previewLicense: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.textInverse,
    opacity: 0.9,
    fontWeight: '500',
  },
  previewContent: {
    padding: SIZES.spacingLg,
  },
  previewDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacingSm,
  },
  previewLabel: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginLeft: SIZES.spacingSm,
    marginRight: SIZES.spacingSm,
    minWidth: 80,
  },
  previewValue: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: SIZES.spacingMd,
    marginBottom: SIZES.spacingLg,
  },
  resetButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.infoLight,
    padding: SIZES.spacingLg,
    borderRadius: SIZES.radiusLg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info,
  },
  helpIcon: {
    marginRight: SIZES.spacingMd,
    marginTop: 2,
  },
  helpText: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    flex: 1,
  },
});

export default EnhancedAddDriverScreen;
