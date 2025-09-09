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
import { TripFormData, TripFormErrors, DieselPurchaseFormData, INDIAN_STATES, RtoEventFormData, DtoEventFormData, MunicipalitiesEventFormData, BorderEventFormData } from '../types';
import { truckService } from '../services/truckService';
import { tripService } from '../services/tripService';
import { driverService } from '../services/driverService';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import DieselPurchaseForm from '../components/DieselPurchaseForm';
import CommissionCategoryList from '../components/CommissionCategoryList';
import AmountList from '../components/AmountList';

interface AddTripScreenProps {
  navigation: {
    goBack: () => void;
    navigate: (screen: string) => void;
  };
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
    fast_tag_costs: [0], // Start with one input box
    mcd_costs: [0], // Start with one input box
    green_tax_costs: [0], // Start with one input box
    rto_costs: [], // Start empty
    dto_costs: [], // Start empty
    municipalities_costs: [], // Start empty
    border_costs: [], // Start empty
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
    } catch (error: unknown) {
      Alert.alert('Error', 'Failed to load trucks');
      console.error('Load trucks error:', error);
    } finally {
      setLoadingTrucks(false);
    }
  };

  const loadDrivers = async () => {
    try {
      const data = await driverService.getDrivers();
      setDrivers((data || []).map(d => ({ id: d.id, name: d.name })));
    } catch (error) {
      console.error('Load drivers error:', error);
    }
  };

  const calculateTotalCost = () => {
    // Calculate totals from arrays
    const fastTagTotal = formData.fast_tag_costs.reduce((sum, cost) => sum + cost, 0);
    const mcdTotal = formData.mcd_costs.reduce((sum, cost) => sum + cost, 0);
    const greenTaxTotal = formData.green_tax_costs.reduce((sum, cost) => sum + cost, 0);
    const rtoTotal = formData.rto_costs.reduce((sum, cost) => sum + cost.amount, 0);
    const dtoTotal = formData.dto_costs.reduce((sum, cost) => sum + cost.amount, 0);
    const municipalitiesTotal = formData.municipalities_costs.reduce((sum, cost) => sum + cost.amount, 0);
    const borderTotal = formData.border_costs.reduce((sum, cost) => sum + cost.amount, 0);

    return tripService.calculateTotalCost({
      diesel_purchases: formData.diesel_purchases,
      fast_tag_cost: fastTagTotal,
      mcd_cost: mcdTotal,
      green_tax_cost: greenTaxTotal,
      rto_cost: rtoTotal,
      dto_cost: dtoTotal,
      municipalities_cost: municipalitiesTotal,
      border_cost: borderTotal,
      repair_cost: formData.repair_cost || 0,
    });
  };

  // RTO costs management
  const addRtoCost = () => {
    setFormData(prev => ({
      ...prev,
      rto_costs: [...prev.rto_costs, { state: '', checkpoint: '', amount: 0, notes: '', event_time: new Date().toISOString() }]
    }));
  };

  const updateRtoCost = (index: number, updated: Partial<RtoEventFormData>) => {
    setFormData(prev => ({
      ...prev,
      rto_costs: prev.rto_costs.map((item, i) => i === index ? { ...item, ...updated } : item)
    }));
  };

  const removeRtoCost = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rto_costs: prev.rto_costs.filter((_, i) => i !== index)
    }));
  };

  // DTO costs management
  const addDtoCost = () => {
    setFormData(prev => ({
      ...prev,
      dto_costs: [...prev.dto_costs, { state: '', checkpoint: '', amount: 0, notes: '', event_time: new Date().toISOString() }]
    }));
  };

  const updateDtoCost = (index: number, updated: Partial<DtoEventFormData>) => {
    setFormData(prev => ({
      ...prev,
      dto_costs: prev.dto_costs.map((item, i) => i === index ? { ...item, ...updated } : item)
    }));
  };

  const removeDtoCost = (index: number) => {
    setFormData(prev => ({
      ...prev,
      dto_costs: prev.dto_costs.filter((_, i) => i !== index)
    }));
  };

  // Municipalities costs management
  const addMunicipalitiesCost = () => {
    setFormData(prev => ({
      ...prev,
      municipalities_costs: [...prev.municipalities_costs, { state: '', checkpoint: '', amount: 0, notes: '', event_time: new Date().toISOString() }]
    }));
  };

  const updateMunicipalitiesCost = (index: number, updated: Partial<MunicipalitiesEventFormData>) => {
    setFormData(prev => ({
      ...prev,
      municipalities_costs: prev.municipalities_costs.map((item, i) => i === index ? { ...item, ...updated } : item)
    }));
  };

  const removeMunicipalitiesCost = (index: number) => {
    setFormData(prev => ({
      ...prev,
      municipalities_costs: prev.municipalities_costs.filter((_, i) => i !== index)
    }));
  };

  // Border costs management
  const addBorderCost = () => {
    setFormData(prev => ({
      ...prev,
      border_costs: [...prev.border_costs, { state: '', checkpoint: '', amount: 0, notes: '', event_time: new Date().toISOString() }]
    }));
  };

  const updateBorderCost = (index: number, updated: Partial<BorderEventFormData>) => {
    setFormData(prev => ({
      ...prev,
      border_costs: prev.border_costs.map((item, i) => i === index ? { ...item, ...updated } : item)
    }));
  };

  const removeBorderCost = (index: number) => {
    setFormData(prev => ({
      ...prev,
      border_costs: prev.border_costs.filter((_, i) => i !== index)
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
    // Validate cost arrays
    if (formData.fast_tag_costs.some(cost => cost < 0)) {
      newErrors.fast_tag_costs = 'Fast tag costs cannot be negative';
    }
    if (formData.mcd_costs.some(cost => cost < 0)) {
      newErrors.mcd_costs = 'MCD costs cannot be negative';
    }
    if (formData.green_tax_costs.some(cost => cost < 0)) {
      newErrors.green_tax_costs = 'Green tax costs cannot be negative';
    }
    if (formData.rto_costs.some(cost => cost.amount < 0 || !cost.state.trim())) {
      newErrors.rto_costs = 'RTO costs must have valid amounts and states';
    }
    if (formData.dto_costs.some(cost => cost.amount < 0 || !cost.state.trim())) {
      newErrors.dto_costs = 'DTO costs must have valid amounts and states';
    }
    if (formData.municipalities_costs.some(cost => cost.amount < 0 || !cost.state.trim())) {
      newErrors.municipalities_costs = 'Municipalities costs must have valid amounts and states';
    }
    if (formData.border_costs.some(cost => cost.amount < 0 || !cost.state.trim())) {
      newErrors.border_costs = 'Border costs must have valid amounts and states';
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
      // Calculate totals from arrays
      const rtoTotal = formData.rto_costs.reduce((sum, cost) => sum + cost.amount, 0);
      const dtoTotal = formData.dto_costs.reduce((sum, cost) => sum + cost.amount, 0);
      const municipalitiesTotal = formData.municipalities_costs.reduce((sum, cost) => sum + cost.amount, 0);
      const borderTotal = formData.border_costs.reduce((sum, cost) => sum + cost.amount, 0);

      const created = await tripService.createTrip({
        truck_id: formData.truck_id,
        source: formData.source.trim(),
        destination: formData.destination.trim(),
        diesel_purchases: formData.diesel_purchases,
        fast_tag_cost: formData.fast_tag_costs.reduce((sum, cost) => sum + cost, 0),
        mcd_cost: formData.mcd_costs.reduce((sum, cost) => sum + cost, 0),
        green_tax_cost: formData.green_tax_costs.reduce((sum, cost) => sum + cost, 0),
        rto_cost: rtoTotal,
        dto_cost: dtoTotal,
        municipalities_cost: municipalitiesTotal,
        border_cost: borderTotal,
        repair_cost: (formData.repair_cost || 0) + ((formData as any).repair_extras || []).reduce((s:number,n:number)=>s+n,0),
        trip_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        fast_tag_costs: formData.fast_tag_costs,
        mcd_costs: formData.mcd_costs,
        green_tax_costs: formData.green_tax_costs,
        rto_costs: formData.rto_costs,
        dto_costs: formData.dto_costs,
        municipalities_costs: formData.municipalities_costs,
        border_costs: formData.border_costs,
      });

      // Create RTO events
      for (const rtoCost of formData.rto_costs) {
        await tripService.addRtoEvent((created as any).id, rtoCost);
      }

      // Create DTO events
      for (const dtoCost of formData.dto_costs) {
        await tripService.addDtoEvent((created as any).id, dtoCost);
      }

      // Create Municipalities events
      for (const municipalitiesCost of formData.municipalities_costs) {
        await tripService.addMunicipalitiesEvent((created as any).id, municipalitiesCost);
      }

      // Create Border events
      for (const borderCost of formData.border_costs) {
        await tripService.addBorderEvent((created as any).id, borderCost);
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add trip. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof TripFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing (limit to scalar fields for typings)
    const scalarFields: (keyof TripFormErrors)[] = ['truck_id','driver_id','source','destination','fast_tag_costs','mcd_costs','green_tax_costs','rto_costs','dto_costs','municipalities_costs','border_costs','repair_cost'];
    if ((scalarFields as string[]).includes(field as string)) {
      setErrors(prev => ({ ...prev, [field as keyof TripFormErrors]: undefined }));
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
              {/* Fast Tag Costs */}
              {formData.fast_tag_costs.map((cost, index) => (
                <View key={index} style={styles.costItemContainer}>
                  <CustomInput
                    label={`#${index + 1} Fast Tag Cost (₹)`}
                    placeholder="0"
                    value={cost.toString()}
                    onChangeText={(text) => {
                      const newCosts = [...formData.fast_tag_costs];
                      newCosts[index] = parseFloat(text) || 0;
                      setFormData(prev => ({ ...prev, fast_tag_costs: newCosts }));
                    }}
                    keyboardType="numeric"
                    error={errors.fast_tag_costs}
                  />
                  {formData.fast_tag_costs.length > 1 && (
                    <CustomButton
                      title="Remove"
                      onPress={() => {
                        const newCosts = formData.fast_tag_costs.filter((_, i) => i !== index);
                        setFormData(prev => ({ ...prev, fast_tag_costs: newCosts }));
                      }}
                      variant="outline"
                      size="small"
                    />
                  )}
                </View>
              ))}
              <CustomButton
                title="Add Fast Tag Cost"
                onPress={() => {
                  setFormData(prev => ({ ...prev, fast_tag_costs: [...prev.fast_tag_costs, 0] }));
                }}
                variant="outline"
                size="small"
              />
              {/* MCD Costs */}
              {formData.mcd_costs.map((cost, index) => (
                <View key={index} style={styles.costItemContainer}>
                  <CustomInput
                    label={`#${index + 1} MCD Cost (₹)`}
                    placeholder="0"
                    value={cost.toString()}
                    onChangeText={(text) => {
                      const newCosts = [...formData.mcd_costs];
                      newCosts[index] = parseFloat(text) || 0;
                      setFormData(prev => ({ ...prev, mcd_costs: newCosts }));
                    }}
                    keyboardType="numeric"
                    error={errors.mcd_costs}
                  />
                  {formData.mcd_costs.length > 1 && (
                    <CustomButton
                      title="Remove"
                      onPress={() => {
                        const newCosts = formData.mcd_costs.filter((_, i) => i !== index);
                        setFormData(prev => ({ ...prev, mcd_costs: newCosts }));
                      }}
                      variant="outline"
                      size="small"
                    />
                  )}
                </View>
              ))}
              <CustomButton
                title="Add MCD Cost"
                onPress={() => {
                  setFormData(prev => ({ ...prev, mcd_costs: [...prev.mcd_costs, 0] }));
                }}
                variant="outline"
                size="small"
              />
              {/* Green Tax Costs */}
              {formData.green_tax_costs.map((cost, index) => (
                <View key={index} style={styles.costItemContainer}>
                  <CustomInput
                    label={`#${index + 1} Green Tax Cost (₹)`}
                    placeholder="0"
                    value={cost.toString()}
                    onChangeText={(text) => {
                      const newCosts = [...formData.green_tax_costs];
                      newCosts[index] = parseFloat(text) || 0;
                      setFormData(prev => ({ ...prev, green_tax_costs: newCosts }));
                    }}
                    keyboardType="numeric"
                    error={errors.green_tax_costs}
                  />
                  {formData.green_tax_costs.length > 1 && (
                    <CustomButton
                      title="Remove"
                      onPress={() => {
                        const newCosts = formData.green_tax_costs.filter((_, i) => i !== index);
                        setFormData(prev => ({ ...prev, green_tax_costs: newCosts }));
                      }}
                      variant="outline"
                      size="small"
                    />
                  )}
                </View>
              ))}
              <CustomButton
                title="Add Green Tax Cost"
                onPress={() => {
                  setFormData(prev => ({ ...prev, green_tax_costs: [...prev.green_tax_costs, 0] }));
                }}
                variant="outline"
                size="small"
              />
              <Text style={styles.label}>RTO Costs</Text>
              {formData.rto_costs.map((cost, index) => (
                <View key={index} style={styles.costItemContainer}>
                  <CustomInput
                    label={`#${index + 1} RTO Cost (₹)`}
                    placeholder="0"
                    value={cost.amount.toString()}
                    onChangeText={(text) => updateRtoCost(index, { amount: parseFloat(text) || 0 })}
                    keyboardType="numeric"
                    error={errors.rto_costs}
                  />
                  <CustomInput
                    label="State"
                    placeholder="e.g., Uttar Pradesh"
                    value={cost.state}
                    onChangeText={(text) => updateRtoCost(index, { state: text })}
                  />
                  <CustomInput
                    label="Checkpoint (optional)"
                    placeholder="e.g., Kanpur RTO"
                    value={cost.checkpoint || ''}
                    onChangeText={(text) => updateRtoCost(index, { checkpoint: text })}
                  />
                  <CustomInput
                    label="Notes (optional)"
                    placeholder="Additional details"
                    value={cost.notes || ''}
                    onChangeText={(text) => updateRtoCost(index, { notes: text })}
                  />
                  <CustomButton
                    title="Remove"
                    onPress={() => removeRtoCost(index)}
                    variant="outline"
                    size="small"
                  />
                </View>
              ))}
              <CustomButton
                title="Add RTO Cost"
                onPress={addRtoCost}
                variant="outline"
                size="small"
              />
              <Text style={styles.label}>DTO Costs</Text>
              {formData.dto_costs.map((cost, index) => (
                <View key={index} style={styles.costItemContainer}>
                  <CustomInput
                    label={`#${index + 1} DTO Cost (₹)`}
                    placeholder="0"
                    value={cost.amount.toString()}
                    onChangeText={(text) => updateDtoCost(index, { amount: parseFloat(text) || 0 })}
                    keyboardType="numeric"
                    error={errors.dto_costs}
                  />
                  <CustomInput
                    label="State"
                    placeholder="e.g., Uttar Pradesh"
                    value={cost.state}
                    onChangeText={(text) => updateDtoCost(index, { state: text })}
                  />
                  <CustomInput
                    label="Checkpoint (optional)"
                    placeholder="e.g., Kanpur DTO"
                    value={cost.checkpoint || ''}
                    onChangeText={(text) => updateDtoCost(index, { checkpoint: text })}
                  />
                  <CustomInput
                    label="Notes (optional)"
                    placeholder="Additional details"
                    value={cost.notes || ''}
                    onChangeText={(text) => updateDtoCost(index, { notes: text })}
                  />
                  <CustomButton
                    title="Remove"
                    onPress={() => removeDtoCost(index)}
                    variant="outline"
                    size="small"
                  />
                </View>
              ))}
              <CustomButton
                title="Add DTO Cost"
                onPress={addDtoCost}
                variant="outline"
                size="small"
              />
              <Text style={styles.label}>Municipalities Costs</Text>
              {formData.municipalities_costs.map((cost, index) => (
                <View key={index} style={styles.costItemContainer}>
                  <CustomInput
                    label={`#${index + 1} Municipalities Cost (₹)`}
                    placeholder="0"
                    value={cost.amount.toString()}
                    onChangeText={(text) => updateMunicipalitiesCost(index, { amount: parseFloat(text) || 0 })}
                    keyboardType="numeric"
                    error={errors.municipalities_costs}
                  />
                  <CustomInput
                    label="State"
                    placeholder="e.g., Uttar Pradesh"
                    value={cost.state}
                    onChangeText={(text) => updateMunicipalitiesCost(index, { state: text })}
                  />
                  <CustomInput
                    label="Checkpoint (optional)"
                    placeholder="e.g., Kanpur Municipal Office"
                    value={cost.checkpoint || ''}
                    onChangeText={(text) => updateMunicipalitiesCost(index, { checkpoint: text })}
                  />
                  <CustomInput
                    label="Notes (optional)"
                    placeholder="Additional details"
                    value={cost.notes || ''}
                    onChangeText={(text) => updateMunicipalitiesCost(index, { notes: text })}
                  />
                  <CustomButton
                    title="Remove"
                    onPress={() => removeMunicipalitiesCost(index)}
                    variant="outline"
                    size="small"
                  />
                </View>
              ))}
              <CustomButton
                title="Add Municipalities Cost"
                onPress={addMunicipalitiesCost}
                variant="outline"
                size="small"
              />
              <Text style={styles.label}>Border Costs</Text>
              {formData.border_costs.map((cost, index) => (
                <View key={index} style={styles.costItemContainer}>
                  <CustomInput
                    label={`#${index + 1} Border Cost (₹)`}
                    placeholder="0"
                    value={cost.amount.toString()}
                    onChangeText={(text) => updateBorderCost(index, { amount: parseFloat(text) || 0 })}
                    keyboardType="numeric"
                    error={errors.border_costs}
                  />
                  <CustomInput
                    label="State"
                    placeholder="e.g., Uttar Pradesh"
                    value={cost.state}
                    onChangeText={(text) => updateBorderCost(index, { state: text })}
                  />
                  <CustomInput
                    label="Checkpoint (optional)"
                    placeholder="e.g., Agra Border"
                    value={cost.checkpoint || ''}
                    onChangeText={(text) => updateBorderCost(index, { checkpoint: text })}
                  />
                  <CustomInput
                    label="Notes (optional)"
                    placeholder="Additional details"
                    value={cost.notes || ''}
                    onChangeText={(text) => updateBorderCost(index, { notes: text })}
                  />
                  <CustomButton
                    title="Remove"
                    onPress={() => removeBorderCost(index)}
                    variant="outline"
                    size="small"
                  />
                </View>
              ))}
              <CustomButton
                title="Add Border Cost"
                onPress={addBorderCost}
                variant="outline"
                size="small"
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
                Other: ₹{(formData.fast_tag_costs.reduce((sum, cost) => sum + cost, 0) + formData.mcd_costs.reduce((sum, cost) => sum + cost, 0) + formData.green_tax_costs.reduce((sum, cost) => sum + cost, 0) + formData.rto_costs.reduce((sum, cost) => sum + cost.amount, 0) + formData.dto_costs.reduce((sum, cost) => sum + cost.amount, 0) + formData.municipalities_costs.reduce((sum, cost) => sum + cost.amount, 0) + formData.border_costs.reduce((sum, cost) => sum + cost.amount, 0) + (formData.repair_cost || 0)).toLocaleString('en-IN')}
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
  costItemContainer: {
    marginBottom: SIZES.spacingMd,
  },
  label: {
    fontSize: SIZES.fontSizeLg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacingMd,
  },
});

export default AddTripScreen;
