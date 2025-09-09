import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { driverService } from '../services/driverService';
import * as ImagePicker from 'expo-image-picker';

interface AddDriverScreenProps {
  navigation: any;
}

const AddDriverScreen: React.FC<AddDriverScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    phone: '',
    licenseNumber: '',
  });
  
  const [licenseBase64, setLicenseBase64] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const requestMediaPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow photo library access to pick images.');
      return false;
    }
    return true;
  };

  const handlePickImage = async () => {
    const ok = await requestMediaPermission();
    if (!ok) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setLicenseBase64(asset.base64 || '');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Driver name is required';
    }
    
    if (formData.age && (isNaN(Number(formData.age)) || Number(formData.age) < 18 || Number(formData.age) > 70)) {
      newErrors.age = 'Age must be between 18 and 70';
    }

    if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
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
      await driverService.createDriver({
        name: formData.name.trim(),
        age: formData.age ? Number(formData.age) : undefined,
        phone: formData.phone || undefined,
        license_number: formData.licenseNumber || undefined,
        license_image_base64: licenseBase64 || undefined,
      });

      Alert.alert(
        'Success!',
        'Driver added successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add driver. Please try again.');
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
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={28} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.title}>Add New Driver</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <CustomInput
              label="Driver Name"
              placeholder="e.g., John Doe"
              value={formData.name}
              onChangeText={(text) => updateFormData('name', text)}
              error={errors.name}
              required
            />

            <CustomInput
              label="Age"
              placeholder="e.g., 32"
              value={formData.age}
              onChangeText={(text) => updateFormData('age', text)}
              keyboardType="numeric"
              error={errors.age}
            />

            <CustomInput
              label="Phone Number"
              placeholder="e.g., 9876543210"
              value={formData.phone}
              onChangeText={(text) => updateFormData('phone', text)}
              keyboardType="phone-pad"
              error={errors.phone}
            />

            <CustomInput
              label="License Number"
              placeholder="e.g., DL-01-AB-1234"
              value={formData.licenseNumber}
              onChangeText={(text) => updateFormData('licenseNumber', text)}
              error={errors.licenseNumber}
            />

            {/* License Image Section */}
            <View style={styles.imageSection}>
              <Text style={styles.imageLabel}>License Image</Text>
              <TouchableOpacity style={styles.pickButton} onPress={handlePickImage} activeOpacity={0.8}>
                <Ionicons 
                  name={licenseBase64 ? "camera" : "camera-outline"} 
                  size={20} 
                  color={COLORS.surface} 
                  style={styles.pickButtonIcon}
                />
                <Text style={styles.pickButtonText}>
                  {licenseBase64 ? 'Change Image' : 'Pick Image'}
                </Text>
              </TouchableOpacity>
              
              {licenseBase64 && (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: `data:image/jpeg;base64,${licenseBase64}` }}
                    style={styles.preview}
                  />
                  <TouchableOpacity 
                    style={styles.removeImageButton} 
                    onPress={() => setLicenseBase64('')}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-circle" size={24} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Submit Button */}
            <View style={styles.submitContainer}>
              <CustomButton
                title="Add Driver"
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
  imageSection: {
    marginBottom: SIZES.spacingLg,
  },
  imageLabel: {
    fontSize: SIZES.fontSizeMd,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacingSm,
  },
  pickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.spacingMd,
    paddingHorizontal: SIZES.spacingLg,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.spacingMd,
  },
  pickButtonIcon: {
    marginRight: SIZES.spacingSm,
  },
  pickButtonText: {
    color: COLORS.surface,
    fontWeight: '600',
    fontSize: SIZES.fontSizeMd,
  },
  imagePreviewContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: SIZES.radiusLg,
    backgroundColor: COLORS.background,
  },
  removeImageButton: {
    position: 'absolute',
    top: SIZES.spacingSm,
    right: SIZES.spacingSm,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 2,
  },
  submitContainer: {
    marginTop: SIZES.spacingXl,
    marginBottom: SIZES.spacingXl,
  },
});

export default AddDriverScreen;