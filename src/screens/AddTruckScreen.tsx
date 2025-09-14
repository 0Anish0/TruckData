import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, ANIMATIONS } from '../constants/theme';
import EnhancedCustomInput from '../components/CustomInput';
import EnhancedCustomButton from '../components/CustomButton';
import { truckService } from '../services';
import { AddTruckScreenNavigationProp, Truck } from '../types';

interface EnhancedAddTruckScreenProps {
  route?: {
    params?: {
      truck?: Truck;
    };
  };
  navigation: AddTruckScreenNavigationProp;
}

const EnhancedAddTruckScreen: React.FC<EnhancedAddTruckScreenProps> = ({ route, navigation }) => {
  const truckToEdit = route?.params?.truck;
  const isEditMode = !!truckToEdit;
  const [formData, setFormData] = useState(() => {
    if (isEditMode && truckToEdit) {
      // Pre-fill form data for edit mode
      return {
        name: truckToEdit.name,
        truckNumber: truckToEdit.truck_number,
        model: truckToEdit.model,
        capacity: '',
        fuelType: '',
        year: '',
        color: '',
      };
    } else {
      // Default empty form for add mode
      return {
        name: '',
        truckNumber: '',
        model: '',
        capacity: '',
        fuelType: '',
        year: '',
        color: '',
      };
    }
  });
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Please enter truck name.');
      return false;
    }
    if (!formData.truckNumber.trim()) {
      Alert.alert('Validation Error', 'Please enter truck number.');
      return false;
    }
    if (!formData.model.trim()) {
      Alert.alert('Validation Error', 'Please enter truck model.');
      return false;
    }
    if (!formData.capacity.trim()) {
      Alert.alert('Validation Error', 'Please enter truck capacity.');
      return false;
    }
    if (!formData.year.trim()) {
      Alert.alert('Validation Error', 'Please enter manufacturing year.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (isEditMode && truckToEdit) {
        // Update existing truck
        const truckUpdateData = {
          name: formData.name,
          truck_number: formData.truckNumber,
          model: formData.model,
        };

        await truckService.updateTruck(truckToEdit.id, truckUpdateData);
        Alert.alert(
          'Success',
          'Truck updated successfully!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        // Create new truck
        const truckCreateData = {
          name: formData.name,
          truck_number: formData.truckNumber,
          model: formData.model,
          user_id: 'user-1', // TODO: Get from auth context
        };

        await truckService.createTruck(truckCreateData);
        Alert.alert(
          'Success',
          'Truck added successfully!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error: unknown) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} truck:`, error);
      Alert.alert(
        'Error',
        `Failed to ${isEditMode ? 'update' : 'add'} truck. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={COLORS.secondaryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textInverse} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Add New Truck</Text>
            <Text style={styles.headerSubtitle}>
              Add a new truck to your fleet
            </Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="car-sport" size={28} color={COLORS.textInverse} />
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
            {/* Basic Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>

              <EnhancedCustomInput
                label="Truck Name"
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                placeholder="Enter truck name (e.g., Ashok Leyland Dost)"
                leftIcon="car-sport"
              />

              <EnhancedCustomInput
                label="Registration Number"
                value={formData.truckNumber}
                onChangeText={(value) => handleInputChange('truckNumber', value)}
                placeholder="Enter registration number (e.g., KA-05-EF-9012)"
                leftIcon="card"
              />

              <EnhancedCustomInput
                label="Model"
                value={formData.model}
                onChangeText={(value) => handleInputChange('model', value)}
                placeholder="Enter truck model (e.g., Dost Plus)"
                leftIcon="construct"
              />

              <EnhancedCustomInput
                label="Manufacturing Year"
                value={formData.year}
                onChangeText={(value) => handleInputChange('year', value)}
                placeholder="Enter year (e.g., 2020)"
                leftIcon="calendar"
                keyboardType="numeric"
              />
            </View>

            {/* Specifications */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Specifications</Text>

              <EnhancedCustomInput
                label="Capacity"
                value={formData.capacity}
                onChangeText={(value) => handleInputChange('capacity', value)}
                placeholder="Enter capacity (e.g., 1000 kg)"
                leftIcon="cube"
              />

              <EnhancedCustomInput
                label="Fuel Type"
                value={formData.fuelType}
                onChangeText={(value) => handleInputChange('fuelType', value)}
                placeholder="Enter fuel type (e.g., Diesel)"
                leftIcon="flash"
              />

              <EnhancedCustomInput
                label="Color"
                value={formData.color}
                onChangeText={(value) => handleInputChange('color', value)}
                placeholder="Enter truck color (e.g., White)"
                leftIcon="color-palette"
              />
            </View>

            {/* Submit Button */}
            <View style={styles.submitContainer}>
              <EnhancedCustomButton
                title={isEditMode ? "Edit Truck" : "Add Truck"}
                onPress={handleSubmit}
                icon="car-sport"
                variant="primary"
                size="large"
                fullWidth
                loading={loading}
                disabled={loading}
              />
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
    paddingTop: SIZES.spacingXl + 20, // Align with other screens' header top padding
    paddingBottom: SIZES.spacingLg, // Align with other screens' header bottom padding
    height: 140, // Match other screens' header height
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.glassLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: SIZES.spacingMd,
  },
  headerTitle: {
    fontSize: SIZES.fontSizeXxl,
    fontWeight: '700' as const,
    color: COLORS.textInverse,
    marginBottom: SIZES.spacingXs,
  },
  headerSubtitle: {
    fontSize: SIZES.fontSizeMd,
    color: COLORS.textInverse,
    opacity: 0.9,
    fontWeight: '500' as const,
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
    marginTop: 140, // Add margin to account for sticky header height
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SIZES.spacingLg,
    paddingBottom: SIZES.spacingXl,
    paddingTop: SIZES.spacingSm,
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
  sectionTitle: {
    fontSize: SIZES.fontSizeLg,
    fontWeight: '700' as const,
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacingLg,
  },
  submitContainer: {
    marginTop: SIZES.spacingLg,
  },
});

export default EnhancedAddTruckScreen;