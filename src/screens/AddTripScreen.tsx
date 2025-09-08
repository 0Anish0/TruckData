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
import { TripFormData, TripFormErrors, DieselPurchaseFormData, INDIAN_STATES } from '../types';
import { truckService } from '../services/truckService';
import { tripService } from '../services/tripService';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import DieselPurchaseForm from '../components/DieselPurchaseForm';

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
    truck_id: route?.params?.truckId || '',
    source: '',
    destination: '',
    diesel_purchases: [{
      state: '',
      city: '',
      diesel_quantity: 0,
      diesel_price_per_liter: 0,
      purchase_date: new Date().toISOString().split('T')[0],
    }],
    fast_tag_cost: 0,
    mcd_cost: 0,
    green_tax_cost: 0,
  });

  const [errors, setErrors] = useState<TripFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [trucks, setTrucks] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loadingTrucks, setLoadingTrucks] = useState(true);

  useEffect(() => {
    loadTrucks();
    loadDrivers();
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

  const loadDrivers = async () => {
    try {
      const { data, error } = await (await import('../lib/supabase')).supabase
        .from('drivers')
        .select('id, name')
        .order('name');
      if (error) throw error;
      setDrivers(data || []);
    } catch (error) {
      console.error('Load drivers error:', error);
    }
  };

  const calculateTotalCost = () => {
    return tripService.calculateTotalCost({
      diesel_purchases: formData.diesel_purchases,
      fast_tag_cost: formData.fast_tag_cost,
      mcd_cost: formData.mcd_cost,
      green_tax_cost: formData.green_tax_cost,
    });
  };

  const validateForm = (): boolean => {
    const newErrors: TripFormErrors = {};

    if (!formData.truck_id) {
      newErrors.truck_id = 'Please select a truck';
    }
    if (!formData.source.trim()) {
      newErrors.source = 'Source is required';
    }
    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination is required';
    }
    if (formData.diesel_purchases.length === 0) {
      newErrors.diesel_purchases = 'At least one diesel purchase is required';
    } else {
      // Validate each diesel purchase
      for (let i = 0; i < formData.diesel_purchases.length; i++) {
        const purchase = formData.diesel_purchases[i];
        if (!purchase.state.trim()) {
          newErrors.diesel_purchases = `State is required for purchase #${i + 1}`;
          break;
        }
        if (purchase.diesel_quantity <= 0) {
          newErrors.diesel_purchases = `Diesel quantity must be greater than 0 for purchase #${i + 1}`;
          break;
        }
        if (purchase.diesel_price_per_liter <= 0) {
          newErrors.diesel_purchases = `Diesel price must be greater than 0 for purchase #${i + 1}`;
          break;
        }
        if (!purchase.purchase_date.trim()) {
          newErrors.diesel_purchases = `Purchase date is required for purchase #${i + 1}`;
          break;
        }
      }
    }
    if (formData.fast_tag_cost < 0) {
      newErrors.fast_tag_cost = 'Fast tag cost cannot be negative';
    }
    if (formData.mcd_cost < 0) {
      newErrors.mcd_cost = 'MCD cost cannot be negative';
    }
    if (formData.green_tax_cost < 0) {
      newErrors.green_tax_cost = 'Green tax cost cannot be negative';
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
        truck_id: formData.truck_id,
        source: formData.source.trim(),
        destination: formData.destination.trim(),
        diesel_purchases: formData.diesel_purchases,
        fast_tag_cost: formData.fast_tag_cost,
        mcd_cost: formData.mcd_cost,
        green_tax_cost: formData.green_tax_cost,
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

  const addDieselPurchase = () => {
    const newPurchase: DieselPurchaseFormData = {
      state: '',
      city: '',
      diesel_quantity: 0,
      diesel_price_per_liter: 0,
      purchase_date: new Date().toISOString().split('T')[0],
    };
    setFormData(prev => ({
      ...prev,
      diesel_purchases: [...prev.diesel_purchases, newPurchase],
    }));
  };

  const updateDieselPurchase = (index: number, purchase: DieselPurchaseFormData) => {
    setFormData(prev => ({
      ...prev,
      diesel_purchases: prev.diesel_purchases.map((p, i) => i === index ? purchase : p),
    }));
  };

  const removeDieselPurchase = (index: number) => {
    setFormData(prev => ({
      ...prev,
      diesel_purchases: prev.diesel_purchases.filter((_, i) => i !== index),
    }));
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
                        formData.truck_id === truck.id && styles.truckOptionSelected,
                      ]}
                      onPress={() => updateFormData('truck_id', truck.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={[
                        styles.truckOptionText,
                        formData.truck_id === truck.id && styles.truckOptionTextSelected,
                      ]}>
                        {truck.name}
                      </Text>
                      <Text style={[
                        styles.truckOptionSubtext,
                        formData.truck_id === truck.id && styles.truckOptionSubtextSelected,
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
              {errors.truck_id && (
                <Text style={styles.errorText}>{errors.truck_id}</Text>
              )}
            </View>

            {/* Driver Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.groupLabel}>Select Driver</Text>
              {drivers.length > 0 ? (
                <View style={styles.truckSelector}>
                  {drivers.map(d => (
                    <TouchableOpacity
                      key={d.id}
                      style={[
                        styles.truckOption,
                        formData.driver_id === d.id && styles.truckOptionSelected,
                      ]}
                      onPress={() => updateFormData('driver_id' as any, d.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={[
                        styles.truckOptionText,
                        formData.driver_id === d.id && styles.truckOptionTextSelected,
                      ]}>
                        {d.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.noTrucksContainer}>
                  <Text style={styles.noTrucksText}>No drivers available</Text>
                </View>
              )}
              {errors.driver_id && (
                <Text style={styles.errorText}>{errors.driver_id}</Text>
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

            {/* Diesel Purchases */}
            <View style={styles.inputGroup}>
              <View style={styles.dieselHeader}>
                <Text style={styles.groupLabel}>Diesel Purchases</Text>
                <CustomButton
                  title="Add Purchase"
                  onPress={addDieselPurchase}
                  variant="outline"
                  size="small"
                />
              </View>
              
              {formData.diesel_purchases.map((purchase, index) => (
                <DieselPurchaseForm
                  key={index}
                  purchase={purchase}
                  errors={{}}
                  onUpdate={(updatedPurchase) => updateDieselPurchase(index, updatedPurchase)}
                  onRemove={() => removeDieselPurchase(index)}
                  index={index}
                  canRemove={formData.diesel_purchases.length > 1}
                />
              ))}
              
              {errors.diesel_purchases && (
                <Text style={styles.errorText}>{errors.diesel_purchases}</Text>
              )}
            </View>

            {/* Additional Costs */}
            <View style={styles.inputGroup}>
              <Text style={styles.groupLabel}>Additional Costs</Text>
              <CustomInput
                label="Fast Tag Cost (₹)"
                placeholder="0"
                value={formData.fast_tag_cost.toString()}
                onChangeText={(text) => updateFormData('fast_tag_cost', parseFloat(text) || 0)}
                keyboardType="numeric"
                error={errors.fast_tag_cost}
              />
              <CustomInput
                label="MCD Cost (₹)"
                placeholder="0"
                value={formData.mcd_cost.toString()}
                onChangeText={(text) => updateFormData('mcd_cost', parseFloat(text) || 0)}
                keyboardType="numeric"
                error={errors.mcd_cost}
              />
              <CustomInput
                label="Green Tax Cost (₹)"
                placeholder="0"
                value={formData.green_tax_cost.toString()}
                onChangeText={(text) => updateFormData('green_tax_cost', parseFloat(text) || 0)}
                keyboardType="numeric"
                error={errors.green_tax_cost}
              />
            </View>

            {/* Total Cost Display */}
            <View style={styles.totalCostContainer}>
              <Text style={styles.totalCostLabel}>Total Trip Cost</Text>
              <Text style={styles.totalCostValue}>₹{totalCost.toLocaleString('en-IN')}</Text>
              <Text style={styles.totalCostBreakdown}>
                Diesel: ₹{formData.diesel_purchases.reduce((total, purchase) => 
                  total + (purchase.diesel_quantity * purchase.diesel_price_per_liter), 0
                ).toLocaleString('en-IN')} | 
                Other: ₹{(formData.fast_tag_cost + formData.mcd_cost + formData.green_tax_cost).toLocaleString('en-IN')}
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
  dieselHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacingLg,
  },
});

export default AddTripScreen;
