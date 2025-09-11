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
import { mockTruckService } from '../services/mockService';
import { COLORS, SIZES, ANIMATIONS } from '../constants/theme';
import EnhancedCustomInput from '../components/EnhancedCustomInput';
import EnhancedCustomButton from '../components/EnhancedCustomButton';
import { Truck, EnhancedEditTruckScreenProps } from '../types';

const EnhancedEditTruckScreen: React.FC<EnhancedEditTruckScreenProps> = ({ route, navigation }) => {
  const { truck } = route.params;
  
  const [formData, setFormData] = useState<Omit<Truck, 'id' | 'created_at' | 'updated_at' | 'user_id'>>({
    name: truck.name,
    truck_number: truck.truck_number,
    model: truck.model,
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
      newErrors.name = 'Truck name is required';
    }
    if (!formData.truck_number.trim()) {
      newErrors.truck_number = 'Truck number is required';
    } else if (!/^[A-Z]{2}-\d{2}-[A-Z]{2}-\d{4}$/.test(formData.truck_number)) {
      newErrors.truck_number = 'Invalid format. Use: XX-XX-XX-XXXX';
    }
    if (!formData.model.trim()) {
      newErrors.model = 'Truck model is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await mockTruckService.updateTruck(truck.id, formData);
      
      Alert.alert(
        'Success',
        'Truck updated successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: unknown) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to update truck. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: truck.name,
      truck_number: truck.truck_number,
      model: truck.model,
    });
    setErrors({});
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={COLORS.secondaryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Edit Truck</Text>
            <Text style={styles.headerSubtitle}>
              {truck.name} - {truck.truck_number}
            </Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="pencil" size={28} color={COLORS.textInverse} />
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
            {/* Current Information */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <Ionicons name="information-circle" size={24} color={COLORS.info} />
                </View>
                <Text style={styles.sectionTitle}>Current Information</Text>
              </View>
              
              <View style={styles.currentInfoCard}>
                <View style={styles.currentInfoRow}>
                  <Text style={styles.currentInfoLabel}>Name:</Text>
                  <Text style={styles.currentInfoValue}>{truck.name}</Text>
                </View>
                <View style={styles.currentInfoRow}>
                  <Text style={styles.currentInfoLabel}>Number:</Text>
                  <Text style={styles.currentInfoValue}>{truck.truck_number}</Text>
                </View>
                <View style={styles.currentInfoRow}>
                  <Text style={styles.currentInfoLabel}>Model:</Text>
                  <Text style={styles.currentInfoValue}>{truck.model}</Text>
                </View>
                <View style={styles.currentInfoRow}>
                  <Text style={styles.currentInfoLabel}>Created:</Text>
                  <Text style={styles.currentInfoValue}>
                    {new Date(truck.created_at).toLocaleDateString('en-IN')}
                  </Text>
                </View>
              </View>
            </View>

            {/* Edit Information */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <Ionicons name="car-sport" size={24} color={COLORS.secondary} />
                </View>
                <Text style={styles.sectionTitle}>Edit Information</Text>
              </View>
              
              <EnhancedCustomInput
                label="Truck Name"
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                leftIcon="car"
                error={errors.name}
                placeholder="Enter truck name (e.g., Mahindra Bolero)"
                autoCapitalize="words"
              />

              <EnhancedCustomInput
                label="Truck Number"
                value={formData.truck_number}
                onChangeText={(text) => setFormData(prev => ({ ...prev, truck_number: text.toUpperCase() }))}
                leftIcon="card"
                error={errors.truck_number}
                placeholder="Enter truck number (e.g., MH-12-AB-1234)"
                autoCapitalize="characters"
                maxLength={13}
              />

              <EnhancedCustomInput
                label="Model"
                value={formData.model}
                onChangeText={(text) => setFormData(prev => ({ ...prev, model: text }))}
                leftIcon="construct"
                error={errors.model}
                placeholder="Enter truck model (e.g., Bolero Pickup)"
                autoCapitalize="words"
              />
            </View>

            {/* Preview Card */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Preview</Text>
              <View style={styles.previewCard}>
                <LinearGradient
                  colors={COLORS.secondaryGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.previewHeader}
                >
                  <View style={styles.previewIcon}>
                    <Ionicons name="car-sport" size={24} color={COLORS.textInverse} />
                  </View>
                  <View style={styles.previewInfo}>
                    <Text style={styles.previewName}>
                      {formData.name || 'Truck Name'}
                    </Text>
                    <Text style={styles.previewNumber}>
                      {formData.truck_number || 'XX-XX-XX-XXXX'}
                    </Text>
                  </View>
                </LinearGradient>
                
                <View style={styles.previewContent}>
                  <View style={styles.previewDetail}>
                    <Ionicons name="construct" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.previewLabel}>Model:</Text>
                    <Text style={styles.previewValue}>
                      {formData.model || 'Truck Model'}
                    </Text>
                  </View>
                  
                  <View style={styles.previewDetail}>
                    <Ionicons name="time" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.previewLabel}>Status:</Text>
                    <Text style={styles.previewValue}>Updated</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <EnhancedCustomButton
                title="Cancel"
                onPress={() => navigation.goBack()}
                variant="outline"
                size="large"
                icon="close"
                style={styles.cancelButton}
              />
              
              <EnhancedCustomButton
                title="Reset"
                onPress={handleReset}
                variant="ghost"
                size="large"
                icon="refresh"
                style={styles.resetButton}
              />
              
              <EnhancedCustomButton
                title="Update Truck"
                onPress={handleSubmit}
                loading={loading}
                variant="secondary"
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
                Make sure to enter accurate information as it will be used for trip tracking and reporting.
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
    paddingTop: SIZES.spacingXl + 20, // Add extra padding for status bar/notch
    paddingBottom: SIZES.spacingLg,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
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
    marginTop: 120, // Add margin to account for sticky header height
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SIZES.spacingLg,
    paddingBottom: SIZES.spacingXl,
  },
  formContainer: {
    marginTop: SIZES.spacingLg,
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
    backgroundColor: COLORS.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.spacingMd,
  },
  sectionTitle: {
    fontSize: SIZES.fontSizeLg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  currentInfoCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.spacingLg,
  },
  currentInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacingSm,
  },
  currentInfoLabel: {
    fontSize: SIZES.fontSizeMd,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  currentInfoValue: {
    fontSize: SIZES.fontSizeMd,
    color: COLORS.textPrimary,
    fontWeight: '700',
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
  previewIcon: {
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
  previewNumber: {
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
    minWidth: 60,
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
    paddingHorizontal: SIZES.spacingXs,
  },
  cancelButton: {
    flex: 1,
    minHeight: 48,
  },
  resetButton: {
    flex: 1,
    minHeight: 48,
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

export default EnhancedEditTruckScreen;
