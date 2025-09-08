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
import CommissionCategoryList from '../components/CommissionCategoryList';
import AmountList from '../components/AmountList';

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
    commission_cost: 0,
    commission_items: [],
    rto_cost: 0,
    dto_cost: 0,
    municipalities_cost: 0,
    border_cost: 0,
    repair_cost: 0,
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
    const rtoExtras = (formData.commission_items || []).filter(i => i.authority_type === 'RTO').reduce((s, i) => s + (i.amount || 0), 0);
    const dtoExtras = (formData.commission_items || []).filter(i => i.authority_type === 'DTO').reduce((s, i) => s + (i.amount || 0), 0);
    const municipalitiesExtras = (formData.commission_items || []).filter(i => i.authority_type === 'Municipalities').reduce((s, i) => s + (i.amount || 0), 0);
    const borderExtras = (formData.commission_items || []).filter(i => i.authority_type === 'State Border').reduce((s, i) => s + (i.amount || 0), 0);

    return tripService.calculateTotalCost({
      diesel_purchases: formData.diesel_purchases,
      fast_tag_cost: formData.fast_tag_cost + ((formData as any).fast_tag_extras || []).reduce((s:number,n:number)=>s+n,0),
      mcd_cost: formData.mcd_cost + ((formData as any).mcd_extras || []).reduce((s:number,n:number)=>s+n,0),
      green_tax_cost: formData.green_tax_cost + ((formData as any).green_tax_extras || []).reduce((s:number,n:number)=>s+n,0),
      commission_cost: formData.commission_cost || 0,
      rto_cost: (formData.rto_cost || 0) + rtoExtras,
      dto_cost: (formData.dto_cost || 0) + dtoExtras,
      municipalities_cost: (formData.municipalities_cost || 0) + municipalitiesExtras,
      border_cost: (formData.border_cost || 0) + borderExtras,
      repair_cost: formData.repair_cost || 0,
    });
  };

  const addCategoryItem = (type: 'RTO' | 'DTO' | 'Municipalities' | 'State Border') => {
    setFormData(prev => ({
      ...prev,
      commission_items: [
        ...(prev.commission_items || []),
        { state: '', authority_type: type, amount: 0, checkpoint: '', notes: '' }
      ],
    }));
  };

  const updateCategoryItem = (type: 'RTO' | 'DTO' | 'Municipalities' | 'State Border', index: number, updated: any) => {
    const indices = (formData.commission_items || []).reduce<number[]>((acc, item, i) => {
      if (item.authority_type === type) acc.push(i);
      return acc;
    }, []);
    const globalIndex = indices[index];
    setFormData(prev => ({
      ...prev,
      commission_items: (prev.commission_items || []).map((it, i) => i === globalIndex ? updated : it),
    }));
  };

  const removeCategoryItem = (type: 'RTO' | 'DTO' | 'Municipalities' | 'State Border', index: number) => {
    const indices = (formData.commission_items || []).reduce<number[]>((acc, item, i) => {
      if (item.authority_type === type) acc.push(i);
      return acc;
    }, []);
    const globalIndex = indices[index];
    setFormData(prev => ({
      ...prev,
      commission_items: (prev.commission_items || []).filter((_, i) => i !== globalIndex),
    }));
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
    if ((formData.rto_cost || 0) < 0) newErrors.rto_cost = 'RTO cost cannot be negative';
    if ((formData.dto_cost || 0) < 0) newErrors.dto_cost = 'DTO cost cannot be negative';
    if ((formData.municipalities_cost || 0) < 0) newErrors.municipalities_cost = 'Municipalities cost cannot be negative';
    if ((formData.border_cost || 0) < 0) newErrors.border_cost = 'Border cost cannot be negative';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const rtoExtras = (formData.commission_items || []).filter(i => i.authority_type === 'RTO').reduce((s, i) => s + (i.amount || 0), 0);
      const dtoExtras = (formData.commission_items || []).filter(i => i.authority_type === 'DTO').reduce((s, i) => s + (i.amount || 0), 0);
      const municipalitiesExtras = (formData.commission_items || []).filter(i => i.authority_type === 'Municipalities').reduce((s, i) => s + (i.amount || 0), 0);
      const borderExtras = (formData.commission_items || []).filter(i => i.authority_type === 'State Border').reduce((s, i) => s + (i.amount || 0), 0);

      const created = await tripService.createTrip({
        truck_id: formData.truck_id,
        source: formData.source.trim(),
        destination: formData.destination.trim(),
        diesel_purchases: formData.diesel_purchases,
        fast_tag_cost: formData.fast_tag_cost + ((formData as any).fast_tag_extras || []).reduce((s:number,n:number)=>s+n,0),
        mcd_cost: formData.mcd_cost + ((formData as any).mcd_extras || []).reduce((s:number,n:number)=>s+n,0),
        green_tax_cost: formData.green_tax_cost + ((formData as any).green_tax_extras || []).reduce((s:number,n:number)=>s+n,0),
        commission_cost: formData.commission_cost || 0,
        rto_cost: (formData.rto_cost || 0) + rtoExtras,
        dto_cost: (formData.dto_cost || 0) + dtoExtras,
        municipalities_cost: (formData.municipalities_cost || 0) + municipalitiesExtras,
        border_cost: (formData.border_cost || 0) + borderExtras,
        repair_cost: (formData.repair_cost || 0) + ((formData as any).repair_extras || []).reduce((s:number,n:number)=>s+n,0),
        trip_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      });

      if ((formData.commission_items || []).length > 0) {
        for (const item of (formData.commission_items || [])) {
          await tripService.addCommissionEvent((created as any).id, {
            state: item.state,
            authority_type: item.authority_type,
            checkpoint: item.checkpoint,
            amount: item.amount,
            notes: item.notes,
          });
        }
      }

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
                label="#1 Fast Tag Cost (₹)"
                placeholder="0"
                value={formData.fast_tag_cost.toString()}
                onChangeText={(text) => updateFormData('fast_tag_cost', parseFloat(text) || 0)}
                keyboardType="numeric"
                error={errors.fast_tag_cost}
              />
              <AmountList
                title="Fast Tag Cost (₹)"
                items={((formData as any).fast_tag_extras || []) as any}
                onAdd={() => setFormData(prev => ({...prev, fast_tag_extras: ([...(prev as any).fast_tag_extras || [], 0]) as any}))}
                onUpdate={(i, val) => setFormData(prev => ({...prev, fast_tag_extras: ([...(prev as any).fast_tag_extras || []].map((n:number, idx:number)=> idx===i ? val : n)) as any}))}
                onRemove={(i) => setFormData(prev => ({...prev, fast_tag_extras: ([...(prev as any).fast_tag_extras || []].filter((_:number, idx:number)=> idx!==i)) as any}))}
              />
              <CustomInput
                label="#1 MCD Cost (₹)"
                placeholder="0"
                value={formData.mcd_cost.toString()}
                onChangeText={(text) => updateFormData('mcd_cost', parseFloat(text) || 0)}
                keyboardType="numeric"
                error={errors.mcd_cost}
              />
              <AmountList
                title="MCD Cost (₹)"
                items={((formData as any).mcd_extras || []) as any}
                onAdd={() => setFormData(prev => ({...prev, mcd_extras: ([...(prev as any).mcd_extras || [], 0]) as any}))}
                onUpdate={(i, val) => setFormData(prev => ({...prev, mcd_extras: ([...(prev as any).mcd_extras || []].map((n:number, idx:number)=> idx===i ? val : n)) as any}))}
                onRemove={(i) => setFormData(prev => ({...prev, mcd_extras: ([...(prev as any).mcd_extras || []].filter((_:number, idx:number)=> idx!==i)) as any}))}
              />
              <CustomInput
                label="#1 Green Tax Cost (₹)"
                placeholder="0"
                value={formData.green_tax_cost.toString()}
                onChangeText={(text) => updateFormData('green_tax_cost', parseFloat(text) || 0)}
                keyboardType="numeric"
                error={errors.green_tax_cost}
              />
              <AmountList
                title="Green Tax Cost (₹)"
                items={((formData as any).green_tax_extras || []) as any}
                onAdd={() => setFormData(prev => ({...prev, green_tax_extras: ([...(prev as any).green_tax_extras || [], 0]) as any}))}
                onUpdate={(i, val) => setFormData(prev => ({...prev, green_tax_extras: ([...(prev as any).green_tax_extras || []].map((n:number, idx:number)=> idx===i ? val : n)) as any}))}
                onRemove={(i) => setFormData(prev => ({...prev, green_tax_extras: ([...(prev as any).green_tax_extras || []].filter((_:number, idx:number)=> idx!==i)) as any}))}
              />
              <CustomInput
                label="#1 RTO Cost (₹)"
                placeholder="0"
                value={(formData.rto_cost || 0).toString()}
                onChangeText={(text) => updateFormData('rto_cost' as any, parseFloat(text) || 0)}
                keyboardType="numeric"
                error={errors.rto_cost}
              />
              <CommissionCategoryList
                authorityType="RTO"
                items={(formData.commission_items || []).filter(i => i.authority_type === 'RTO') as any}
                onAdd={() => addCategoryItem('RTO')}
                onUpdate={(i, updated) => updateCategoryItem('RTO', i, updated)}
                onRemove={(i) => removeCategoryItem('RTO', i)}
              />
              <CustomInput
                label="#1 DTO Cost (₹)"
                placeholder="0"
                value={(formData.dto_cost || 0).toString()}
                onChangeText={(text) => updateFormData('dto_cost' as any, parseFloat(text) || 0)}
                keyboardType="numeric"
                error={errors.dto_cost}
              />
              <CommissionCategoryList
                authorityType="DTO"
                items={(formData.commission_items || []).filter(i => i.authority_type === 'DTO') as any}
                onAdd={() => addCategoryItem('DTO')}
                onUpdate={(i, updated) => updateCategoryItem('DTO', i, updated)}
                onRemove={(i) => removeCategoryItem('DTO', i)}
              />
              <CustomInput
                label="#1 Municipalities Cost (₹)"
                placeholder="0"
                value={(formData.municipalities_cost || 0).toString()}
                onChangeText={(text) => updateFormData('municipalities_cost' as any, parseFloat(text) || 0)}
                keyboardType="numeric"
                error={errors.municipalities_cost}
              />
              <CommissionCategoryList
                authorityType="Municipalities"
                items={(formData.commission_items || []).filter(i => i.authority_type === 'Municipalities') as any}
                onAdd={() => addCategoryItem('Municipalities')}
                onUpdate={(i, updated) => updateCategoryItem('Municipalities', i, updated)}
                onRemove={(i) => removeCategoryItem('Municipalities', i)}
              />
              <CustomInput
                label="#1 Border Cost (₹)"
                placeholder="0"
                value={(formData.border_cost || 0).toString()}
                onChangeText={(text) => updateFormData('border_cost' as any, parseFloat(text) || 0)}
                keyboardType="numeric"
                error={errors.border_cost}
              />
              <CommissionCategoryList
                authorityType="State Border"
                items={(formData.commission_items || []).filter(i => i.authority_type === 'State Border') as any}
                onAdd={() => addCategoryItem('State Border')}
                onUpdate={(i, updated) => updateCategoryItem('State Border', i, updated)}
                onRemove={(i) => removeCategoryItem('State Border', i)}
              />
              <CustomInput
                label="#1 Repair/Defect Cost (₹)"
                placeholder="0"
                value={(formData.repair_cost || 0).toString()}
                onChangeText={(text) => updateFormData('repair_cost' as any, parseFloat(text) || 0)}
                keyboardType="numeric"
                error={errors.repair_cost}
              />
              <AmountList
                title="Repair/Defect Cost (₹)"
                items={((formData as any).repair_extras || []) as any}
                onAdd={() => setFormData(prev => ({...prev, repair_extras: ([...(prev as any).repair_extras || [], 0]) as any}))}
                onUpdate={(i, val) => setFormData(prev => ({...prev, repair_extras: ([...(prev as any).repair_extras || []].map((n:number, idx:number)=> idx===i ? val : n)) as any}))}
                onRemove={(i) => setFormData(prev => ({...prev, repair_extras: ([...(prev as any).repair_extras || []].filter((_:number, idx:number)=> idx!==i)) as any}))}
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
                Other: ₹{(formData.fast_tag_cost + formData.mcd_cost + formData.green_tax_cost + (formData.commission_cost || 0) + (formData.rto_cost || 0) + (formData.dto_cost || 0) + (formData.municipalities_cost || 0) + (formData.border_cost || 0) + (formData.repair_cost || 0)).toLocaleString('en-IN')}
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
