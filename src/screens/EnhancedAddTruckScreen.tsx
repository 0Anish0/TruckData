import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, ANIMATIONS } from '../constants/theme';
import EnhancedCustomInput from '../components/EnhancedCustomInput';
import EnhancedCustomButton from '../components/EnhancedCustomButton';
import { AddTruckScreenNavigationProp } from '../types';

interface EnhancedAddTruckScreenProps {
  navigation: AddTruckScreenNavigationProp;
}

const EnhancedAddTruckScreen: React.FC<EnhancedAddTruckScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    truckNumber: '',
    model: '',
    capacity: '',
    fuelType: '',
    year: '',
    color: '',
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
    console.log('Add Truck button pressed!');
    console.log('Form data:', formData);
    
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    console.log('Form validation passed, starting submit...');
    setLoading(true);
    try {
      // TODO: Implement actual truck creation
      console.log('Truck data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Success',
        'Truck added successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error adding truck:', error);
      Alert.alert('Error', 'Failed to add truck. Please try again.');
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
        <SafeAreaView style={styles.headerContent}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.textInverse} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add New Truck</Text>
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
              title="Add Truck"
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
  submitContainer: {
    marginTop: SIZES.spacingLg,
    marginBottom: SIZES.spacingXl,
  },
});

export default EnhancedAddTruckScreen;