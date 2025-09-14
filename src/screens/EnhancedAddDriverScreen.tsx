import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SIZES, ANIMATIONS } from '../constants/theme';
import EnhancedCustomInput from '../components/EnhancedCustomInput';
import EnhancedCustomButton from '../components/EnhancedCustomButton';
import { AddDriverScreenNavigationProp } from '../types';

interface EnhancedAddDriverScreenProps {
  navigation: AddDriverScreenNavigationProp;
}

const EnhancedAddDriverScreen: React.FC<EnhancedAddDriverScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    licenseNumber: '',
    phone: '',
    age: '',
  });
  const [licenseImage, setLicenseImage] = useState<string | null>(null);
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

  const requestCameraPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  };

  const requestMediaLibraryPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  };

  const takePicture = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Camera permission is required to take license photos.');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setLicenseImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture. Please try again.');
    }
  };

  const selectFromGallery = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Media library permission is required to select photos.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setLicenseImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Select License Photo',
      'Choose how you want to add the license photo',
      [
        { text: 'Take Photo', onPress: takePicture },
        { text: 'Choose from Gallery', onPress: selectFromGallery },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Please enter driver name.');
      return false;
    }
    if (!formData.licenseNumber.trim()) {
      Alert.alert('Validation Error', 'Please enter license number.');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Validation Error', 'Please enter phone number.');
      return false;
    }
    if (!formData.age.trim()) {
      Alert.alert('Validation Error', 'Please enter driver age.');
      return false;
    }
    if (!licenseImage) {
      Alert.alert('Validation Error', 'Please add license photo.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    console.log('Add Driver button pressed!');
    console.log('Form data:', formData);
    console.log('License image:', licenseImage);
    
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    console.log('Form validation passed, starting submit...');
    setLoading(true);
    try {
      // TODO: Implement actual driver creation with license image upload
      console.log('Driver data:', formData);
      console.log('License image:', licenseImage);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Success',
        'Driver added successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error adding driver:', error);
      Alert.alert('Error', 'Failed to add driver. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={COLORS.primaryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <SafeAreaView style={styles.headerContent}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.textInverse} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add New Driver</Text>
            <View style={styles.placeholder} />
          </View>
        </SafeAreaView>
      </LinearGradient>

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
          {/* Driver Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Driver Information</Text>
            
            <EnhancedCustomInput
              label="Full Name"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Enter driver's full name"
              leftIcon="person"
            />

            <EnhancedCustomInput
              label="License Number"
              value={formData.licenseNumber}
              onChangeText={(value) => handleInputChange('licenseNumber', value)}
              placeholder="DL-1234567890"
              leftIcon="card"
            />

            <EnhancedCustomInput
              label="Phone Number"
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="Enter phone number"
              leftIcon="call"
              keyboardType="phone-pad"
            />

            <EnhancedCustomInput
              label="Age"
              value={formData.age}
              onChangeText={(value) => handleInputChange('age', value)}
              placeholder="Enter age"
              leftIcon="calendar"
              keyboardType="numeric"
            />
          </View>

          {/* License Photo Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>License Photo</Text>
            <Text style={styles.sectionSubtitle}>
              Please upload a clear photo of the driver's license
            </Text>

            <TouchableOpacity
              style={styles.imagePicker}
              onPress={showImagePickerOptions}
              activeOpacity={0.7}
            >
              {licenseImage ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: licenseImage }} style={styles.licenseImage} />
                  <View style={styles.imageOverlay}>
                    <Ionicons name="camera" size={24} color={COLORS.textInverse} />
                    <Text style={styles.changePhotoText}>Change Photo</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.placeholderContainer}>
                  <Ionicons name="camera" size={48} color={COLORS.textSecondary} />
                  <Text style={styles.placeholderText}>Tap to add license photo</Text>
                  <Text style={styles.placeholderSubtext}>Take a photo or select from gallery</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <View style={styles.submitContainer}>
            <EnhancedCustomButton
              title="Add Driver"
              onPress={handleSubmit}
              icon="person-add"
              variant="primary"
              size="large"
              fullWidth
              loading={loading}
              disabled={loading}
            />
          </View>
        </Animated.View>
      </ScrollView>
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
    paddingBottom: SIZES.spacingLg,
  },
  headerContent: {
    paddingTop: SIZES.spacingSm,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.glassLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: SIZES.fontSizeXl,
    fontWeight: '700' as const,
    color: COLORS.textInverse,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.spacingLg,
    paddingBottom: SIZES.spacingXl,
  },
  formContainer: {
    flex: 1,
  },
  section: {
    marginBottom: SIZES.spacingXl,
  },
  sectionTitle: {
    fontSize: SIZES.fontSizeLg,
    fontWeight: '700' as const,
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacingMd,
  },
  sectionSubtitle: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacingLg,
    lineHeight: 20,
  },
  imagePicker: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    minHeight: 200,
    ...SIZES.shadow,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
  },
  licenseImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.9,
  },
  changePhotoText: {
    color: COLORS.textInverse,
    fontSize: SIZES.fontSizeSm,
    fontWeight: '600' as const,
    marginTop: SIZES.spacingXs,
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.spacingXl,
  },
  placeholderText: {
    fontSize: SIZES.fontSizeMd,
    color: COLORS.textPrimary,
    fontWeight: '600' as const,
    marginTop: SIZES.spacingMd,
    textAlign: 'center',
  },
  placeholderSubtext: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.textSecondary,
    marginTop: SIZES.spacingXs,
    textAlign: 'center',
  },
  submitContainer: {
    marginTop: SIZES.spacingLg,
    marginBottom: SIZES.spacingXl,
  },
});

export default EnhancedAddDriverScreen;