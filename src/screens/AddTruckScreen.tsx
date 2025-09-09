import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { truckService } from '../services/truckService';

interface AddTruckScreenProps {
  navigation: {
    goBack: () => void;
  };
}

const AddTruckScreen: React.FC<AddTruckScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    truckNumber: '',
    model: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Truck name is required';
    }
    if (!formData.truckNumber.trim()) {
      newErrors.truckNumber = 'Truck number is required';
    }
    if (!formData.model.trim()) {
      newErrors.model = 'Truck model is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Check if truck number already exists
      const exists = await truckService.isTruckNumberExists(formData.truckNumber);
      if (exists) {
        setErrors({ truckNumber: 'Truck number already exists' });
        setLoading(false);
        return;
      }

      // Create truck
      await truckService.createTruck({
        name: formData.name.trim(),
        truck_number: formData.truckNumber.trim(),
        model: formData.model.trim(),
      });

      Alert.alert(
        'Success!',
        'Truck added successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add truck. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.backButton} onTouchEnd={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={28} color={COLORS.textPrimary} />
            </View>
            <Text style={styles.title}>Add New Truck</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <CustomInput
              label="Truck Name"
              placeholder="e.g., Truck 1"
              value={formData.name}
              onChangeText={(text) => updateFormData('name', text)}
              error={errors.name}
              required
            />

            <CustomInput
              label="Truck Number"
              placeholder="e.g., DL-01-AB-1234"
              value={formData.truckNumber}
              onChangeText={(text) => updateFormData('truckNumber', text)}
              error={errors.truckNumber}
              required
            />

            <CustomInput
              label="Truck Model"
              placeholder="e.g., Tata 407"
              value={formData.model}
              onChangeText={(text) => updateFormData('model', text)}
              error={errors.model}
              required
            />

            {/* Submit Button */}
            <View style={styles.submitContainer}>
              <CustomButton
                title="Add Truck"
                onPress={handleSubmit}
                variant="primary"
                size="large"
                loading={loading}
                disabled={loading}
              />
            </View>
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.spacingLg,
    paddingTop: SIZES.spacingLg,
    paddingBottom: SIZES.spacingLg,
    backgroundColor: COLORS.surface,
    ...SIZES.shadowSubtle,
  },
  backButton: {
    padding: SIZES.spacingSm,
    borderRadius: SIZES.radius,
  },
  title: {
    fontSize: SIZES.fontSizeXl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  formContainer: {
    padding: SIZES.spacingLg,
  },
  submitContainer: {
    marginTop: SIZES.spacingXl,
    marginBottom: SIZES.spacingXl,
  },
});

export default AddTruckScreen;
