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
import { TripFormData, TripFormErrors, DieselPurchaseFormData } from '../types';
import { truckService } from '../services/truckService';
import { tripService } from '../services/tripService';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import DieselPurchaseForm from '../components/DieselPurchaseForm';

interface EditTripScreenProps {
  navigation: any;
  route: {
    params: {
      trip: any;
    };
  };
}

const EditTripScreen: React.FC<EditTripScreenProps> = ({ navigation, route }) => {
  const { trip } = route.params;
  
  const [formData, setFormData] = useState<TripFormData>({
    truck_id: trip.truck_id,
    source: trip.source,
    destination: trip.destination,
    diesel_purchases: trip.diesel_purchases?.map(p => ({
      state: p.state,
      city: p.city || '',
      diesel_quantity: p.diesel_quantity,
      diesel_price_per_liter: p.diesel_price_per_liter,
      purchase_date: p.purchase_date,
    })) || [{
      state: '',
      city: '',
      diesel_quantity: 0,
      diesel_price_per_liter: 0,
      purchase_date: new Date().toISOString().split('T')[0],
    }],
    fast_tag_cost: Number(trip.fast_tag_cost),
    mcd_cost: Number(trip.mcd_cost),
    green_tax_cost: Number(trip.green_tax_cost),
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

    try {
      setLoading(true);
      
      const totalCost = calculateTotalCost();
      
      await tripService.updateTrip(trip.id, {
        ...formData,
        total_cost: totalCost,
      });

      Alert.alert(
        'Success',
        'Trip updated successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update trip');
      console.error('Update trip error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Trip',
      'Are you sure you want to delete this trip? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await tripService.deleteTrip(trip.id);
              Alert.alert(
                'Success',
                'Trip deleted successfully',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  },
                ]
              );
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete trip');
              console.error('Delete trip error:', error);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.title}>Edit Trip</Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              activeOpacity={0.7}
            >
              <Ionicons name="trash" size={24} color={COLORS.error} />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Truck Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Truck</Text>
              <View style={styles.pickerContainer}>
                {trucks.map(truck => (
                  <TouchableOpacity
                    key={truck.id}
                    style={[
                      styles.truckOption,
                      formData.truck_id === truck.id && styles.truckOptionSelected,
                    ]}
                    onPress={() => setFormData({ ...formData, truck_id: truck.id })}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.truckOptionText,
                        formData.truck_id === truck.id && styles.truckOptionTextSelected,
                      ]}
                    >
                      {truck.name} - {truck.truck_number}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.truck_id && <Text style={styles.errorText}>{errors.truck_id}</Text>}
            </View>

            {/* Source and Destination */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Source</Text>
                <CustomInput
                  value={formData.source}
                  onChangeText={(text) => setFormData({ ...formData, source: text })}
                  placeholder="Enter source city"
                  error={errors.source}
                />
              </View>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Destination</Text>
                <CustomInput
                  value={formData.destination}
                  onChangeText={(text) => setFormData({ ...formData, destination: text })}
                  placeholder="Enter destination city"
                  error={errors.destination}
                />
              </View>
            </View>

            {/* Diesel Purchases */}
            <View style={styles.inputGroup}>
              <View style={styles.dieselHeader}>
                <Text style={styles.label}>Diesel Purchases</Text>
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
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Fast Tag Cost (₹)</Text>
                <CustomInput
                  value={formData.fast_tag_cost.toString()}
                  onChangeText={(text) => setFormData({ ...formData, fast_tag_cost: Number(text) || 0 })}
                  placeholder="0"
                  keyboardType="numeric"
                  error={errors.fast_tag_cost}
                />
              </View>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>MCD Cost (₹)</Text>
                <CustomInput
                  value={formData.mcd_cost.toString()}
                  onChangeText={(text) => setFormData({ ...formData, mcd_cost: Number(text) || 0 })}
                  placeholder="0"
                  keyboardType="numeric"
                  error={errors.mcd_cost}
                />
              </View>
            </View>

            {/* Green Tax */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Green Tax Cost (₹)</Text>
              <CustomInput
                value={formData.green_tax_cost.toString()}
                onChangeText={(text) => setFormData({ ...formData, green_tax_cost: Number(text) || 0 })}
                placeholder="0"
                keyboardType="numeric"
                error={errors.green_tax_cost}
              />
            </View>

            {/* Total Cost Display */}
            <View style={styles.totalCostContainer}>
              <Text style={styles.totalCostLabel}>Total Cost:</Text>
              <Text style={styles.totalCostValue}>₹{calculateTotalCost().toLocaleString('en-IN')}</Text>
              <Text style={styles.totalCostBreakdown}>
                Diesel: ₹{formData.diesel_purchases.reduce((total, purchase) => 
                  total + (purchase.diesel_quantity * purchase.diesel_price_per_liter), 0
                ).toLocaleString('en-IN')} | 
                Other: ₹{(formData.fast_tag_cost + formData.mcd_cost + formData.green_tax_cost).toLocaleString('en-IN')}
              </Text>
            </View>

            {/* Submit Button */}
            <CustomButton
              title="Update Trip"
              onPress={handleSubmit}
              variant="primary"
              size="large"
              loading={loading}
              disabled={loading}
            />
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
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SIZES.spacingXl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacingLg,
    paddingTop: SIZES.spacingLg,
    paddingBottom: SIZES.spacingLg,
    backgroundColor: COLORS.surface,
    ...SIZES.shadowSubtle,
  },
  backButton: {
    padding: SIZES.spacingXs,
    borderRadius: SIZES.radius,
  },
  title: {
    fontSize: SIZES.fontSizeXl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  deleteButton: {
    padding: SIZES.spacingXs,
    borderRadius: SIZES.radius,
  },
  form: {
    padding: SIZES.spacingLg,
  },
  inputGroup: {
    marginBottom: SIZES.spacingLg,
  },
  label: {
    fontSize: SIZES.fontSizeMd,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacingSm,
  },
  row: {
    flexDirection: 'row',
    gap: SIZES.spacingMd,
  },
  halfWidth: {
    flex: 1,
  },
  pickerContainer: {
    gap: SIZES.spacingSm,
  },
  truckOption: {
    padding: SIZES.spacingMd,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.surface,
  },
  truckOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  truckOptionText: {
    fontSize: SIZES.fontSizeMd,
    color: COLORS.textPrimary,
    textAlign: 'center',
    fontWeight: '500',
  },
  truckOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  totalCostContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.spacingLg,
    backgroundColor: COLORS.primaryLight,
    borderRadius: SIZES.radiusLg,
    marginBottom: SIZES.spacingXl,
  },
  totalCostLabel: {
    fontSize: SIZES.fontSizeLg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  totalCostValue: {
    fontSize: SIZES.fontSizeXl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  errorText: {
    color: COLORS.error,
    fontSize: SIZES.fontSizeSm,
    marginTop: SIZES.spacingXs,
  },
  dieselHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacingLg,
  },
  totalCostBreakdown: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.textTertiary,
    textAlign: 'center',
    fontWeight: '500',
    marginTop: SIZES.spacingSm,
  },
});

export default EditTripScreen;
