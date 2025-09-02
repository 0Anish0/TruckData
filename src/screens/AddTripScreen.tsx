import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { TripFormData, TripFormErrors } from '../types';
import { truckService } from '../services/truckService';
import { tripService } from '../services/tripService';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';

interface AddTripScreenProps {
  navigation: any;
  route?: {
    params?: {
      truckId?: string;
    };
  };
}

const AddTripScreen: React.FC<AddTripScreenProps> = ({ navigation, route }) => {
  const [formData, setFormData] = useState<TripFormData>({
    truckId: route?.params?.truckId || '',
    source: '',
    destination: '',
    dieselQuantity: 0,
    dieselPricePerLiter: 0,
    fastTagCost: 0,
    mcdCost: 0,
    greenTaxCost: 0,
  });

  const [errors, setErrors] = useState<TripFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [trucks, setTrucks] = useState<any[]>([]);
  const [loadingTrucks, setLoadingTrucks] = useState(true);

  useEffect(() => {
    loadTrucks();
  }, []);

  const loadTrucks = async () => {
    try {
      setLoadingTrucks(true);
      const trucksData = await truckService.getTrucks();
      setTrucks(trucksData);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load trucks');
      console.error('Load trucks error:', error);
    } finally {
      setLoadingTrucks(false);
    }
  };

  const calculateTotalCost = () => {
    return tripService.calculateTotalCost({
      diesel_quantity: formData.dieselQuantity,
      diesel_price_per_liter: formData.dieselPricePerLiter,
      fast_tag_cost: formData.fastTagCost,
      mcd_cost: formData.mcdCost,
      green_tax_cost: formData.greenTaxCost,
    });
  };

  const validateForm = (): boolean => {
    const newErrors: TripFormErrors = {};

    if (!formData.truckId) {
      newErrors.truckId = 'Please select a truck';
    }
    if (!formData.source.trim()) {
      newErrors.source = 'Source is required';
    }
    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination is required';
    }
    if (formData.dieselQuantity <= 0) {
      newErrors.dieselQuantity = 'Diesel quantity must be greater than 0';
    }
    if (formData.dieselPricePerLiter <= 0) {
      newErrors.dieselPricePerLiter = 'Diesel price must be greater than 0';
    }
    if (formData.fastTagCost < 0) {
      newErrors.fastTagCost = 'Fast tag cost cannot be negative';
    }
    if (formData.mcdCost < 0) {
      newErrors.mcdCost = 'MCD cost cannot be negative';
    }
    if (formData.greenTaxCost < 0) {
      newErrors.greenTaxCost = 'Green tax cost cannot be negative';
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
      await tripService.createTrip({
        truck_id: formData.truckId,
        source: formData.source.trim(),
        destination: formData.destination.trim(),
        diesel_quantity: formData.dieselQuantity,
        diesel_price_per_liter: formData.dieselPricePerLiter,
        fast_tag_cost: formData.fastTagCost,
        mcd_cost: formData.mcdCost,
        green_tax_cost: formData.greenTaxCost,
        trip_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      });

      Alert.alert(
        'Success!',
        'Trip added successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof TripFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const totalCost = calculateTotalCost();

  if (loadingTrucks) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading trucks...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={28} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.title}>Add New Trip</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Truck Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.groupLabel}>Select Truck</Text>
              {trucks.length > 0 ? (
                <View style={styles.truckSelector}>
                  {trucks.map(truck => (
                    <TouchableOpacity
                      key={truck.id}
                      style={[
                        styles.truckOption,
                        formData.truckId === truck.id && styles.truckOptionSelected,
                      ]}
                      onPress={() => updateFormData('truckId', truck.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={[
                        styles.truckOptionText,
                        formData.truckId === truck.id && styles.truckOptionTextSelected,
                      ]}>
                        {truck.name}
                      </Text>
                      <Text style={[
                        styles.truckOptionSubtext,
                        formData.truckId === truck.id && styles.truckOptionSubtextSelected,
                      ]}>
                        {truck.truck_number}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.noTrucksContainer}>
                  <Text style={styles.noTrucksText}>No trucks available</Text>
                  <CustomButton
                    title="Add Truck First"
                    onPress={() => navigation.navigate('AddTruck')}
                    variant="outline"
                    size="medium"
                  />
                </View>
              )}
              {errors.truckId && (
                <Text style={styles.errorText}>{errors.truckId}</Text>
              )}
            </View>

            {/* Route Information */}
            <View style={styles.inputGroup}>
              <Text style={styles.groupLabel}>Route Information</Text>
              <CustomInput
                label="Source City"
                placeholder="e.g., Delhi"
                value={formData.source}
                onChangeText={(text) => updateFormData('source', text)}
                error={errors.source}
                required
              />
              <CustomInput
                label="Destination City"
                placeholder="e.g., Kolkata"
                value={formData.destination}
                onChangeText={(text) => updateFormData('destination', text)}
                error={errors.destination}
                required
              />
            </View>

            {/* Fuel Information */}
            <View style={styles.inputGroup}>
              <Text style={styles.groupLabel}>Fuel Information</Text>
              <CustomInput
                label="Diesel Quantity (Liters)"
                placeholder="0"
                value={formData.dieselQuantity.toString()}
                onChangeText={(text) => updateFormData('dieselQuantity', parseFloat(text) || 0)}
                keyboardType="numeric"
                error={errors.dieselQuantity}
                required
              />
              <CustomInput
                label="Diesel Price per Liter (₹)"
                placeholder="0"
                value={formData.dieselPricePerLiter.toString()}
                onChangeText={(text) => updateFormData('dieselPricePerLiter', parseFloat(text) || 0)}
                keyboardType="numeric"
                error={errors.dieselPricePerLiter}
                required
              />
            </View>

            {/* Additional Costs */}
            <View style={styles.inputGroup}>
              <Text style={styles.groupLabel}>Additional Costs</Text>
              <CustomInput
                label="Fast Tag Cost (₹)"
                placeholder="0"
                value={formData.fastTagCost.toString()}
                onChangeText={(text) => updateFormData('fastTagCost', parseFloat(text) || 0)}
                keyboardType="numeric"
                error={errors.fastTagCost}
              />
              <CustomInput
                label="MCD Cost (₹)"
                placeholder="0"
                value={formData.mcdCost.toString()}
                onChangeText={(text) => updateFormData('mcdCost', parseFloat(text) || 0)}
                keyboardType="numeric"
                error={errors.mcdCost}
              />
              <CustomInput
                label="Green Tax Cost (₹)"
                placeholder="0"
                value={formData.greenTaxCost.toString()}
                onChangeText={(text) => updateFormData('greenTaxCost', parseFloat(text) || 0)}
                keyboardType="numeric"
                error={errors.greenTaxCost}
              />
            </View>

            {/* Total Cost Display */}
            <View style={styles.totalCostContainer}>
              <Text style={styles.totalCostLabel}>Total Trip Cost</Text>
              <Text style={styles.totalCostValue}>₹{totalCost.toLocaleString('en-IN')}</Text>
              <Text style={styles.totalCostBreakdown}>
                Diesel: ₹{(formData.dieselQuantity * formData.dieselPricePerLiter).toLocaleString('en-IN')} | 
                Other: ₹{(formData.fastTagCost + formData.mcdCost + formData.greenTaxCost).toLocaleString('en-IN')}
              </Text>
            </View>

            {/* Submit Button */}
            <View style={styles.submitContainer}>
              <CustomButton
                title="Add Trip"
                onPress={handleSubmit}
                variant="primary"
                size="large"
                loading={loading}
                disabled={loading || trucks.length === 0}
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
  inputGroup: {
    marginBottom: SIZES.spacingXl,
  },
  groupLabel: {
    fontSize: SIZES.fontSizeLg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacingLg,
  },
  truckSelector: {
    flexDirection: 'row',
    gap: SIZES.spacingMd,
  },
  truckOption: {
    flex: 1,
    padding: SIZES.spacingLg,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusLg,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    ...SIZES.shadowSubtle,
  },
  truckOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    ...SIZES.shadow,
  },
  truckOptionText: {
    fontSize: SIZES.fontSizeMd,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacingXs,
  },
  truckOptionTextSelected: {
    color: COLORS.surface,
  },
  truckOptionSubtext: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.textSecondary,
  },
  truckOptionSubtextSelected: {
    color: COLORS.surface,
  },
  noTrucksContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.spacingLg,
  },
  noTrucksText: {
    fontSize: SIZES.fontSizeMd,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacingMd,
    textAlign: 'center',
  },
  errorText: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.error,
    marginTop: SIZES.spacingSm,
    fontWeight: '500',
  },
  totalCostContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.spacingXl,
    marginBottom: SIZES.spacingXl,
    alignItems: 'center',
    ...SIZES.shadow,
  },
  totalCostLabel: {
    fontSize: SIZES.fontSizeMd,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacingMd,
    fontWeight: '600',
  },
  totalCostValue: {
    fontSize: SIZES.fontSizeXxxl,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SIZES.spacingMd,
  },
  totalCostBreakdown: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.textTertiary,
    textAlign: 'center',
    fontWeight: '500',
  },
  submitContainer: {
    marginBottom: SIZES.spacingXl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: SIZES.fontSizeLg,
    color: COLORS.textSecondary,
  },
});

export default AddTripScreen;
