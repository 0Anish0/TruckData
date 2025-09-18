import React, { useState, useRef, useEffect } from 'react';
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
// @ts-ignore
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { tripService, truckService, driverService } from '../services';
import { COLORS, SIZES, ANIMATIONS } from '../constants/theme';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { Truck, Driver, TripFormData, AddTripScreenNavigationProp, FastTagEventFormData, McdEventFormData, GreenTaxEventFormData, TripWithRelations } from '../types';

interface AddTripScreenProps {
  route?: {
    params?: {
      trip?: TripWithRelations;
    };
  };
}

const AddTripScreen: React.FC<AddTripScreenProps> = ({ route }) => {
  const navigation = useNavigation<AddTripScreenNavigationProp>();
  const tripToEdit = route?.params?.trip;
  const isEditMode = !!tripToEdit;
  const [formData, setFormData] = useState<TripFormData>(() => {
    if (isEditMode && tripToEdit) {
      // Pre-fill form data for edit mode
      return {
        truck_id: tripToEdit.truck_id,
        source: tripToEdit.source,
        destination: tripToEdit.destination,
        driver_id: tripToEdit.driver_id || '',
        start_date: tripToEdit.start_date || new Date().toISOString().split('T')[0],
        end_date: tripToEdit.end_date || new Date().toISOString().split('T')[0],
        diesel_purchases: (tripToEdit.diesel_purchases || []).map(purchase => ({
          state: purchase.state,
          city: purchase.city || '',
          diesel_quantity: purchase.diesel_quantity,
          diesel_price_per_liter: purchase.diesel_price_per_liter,
          purchase_date: purchase.purchase_date,
        })),
        fast_tag_costs: [{ state: '', checkpoint: '', amount: tripToEdit.fast_tag_cost || 0, notes: '' }],
        mcd_costs: [{ state: '', checkpoint: '', amount: tripToEdit.mcd_cost || 0, notes: '' }],
        green_tax_costs: [{ state: '', checkpoint: '', amount: tripToEdit.green_tax_cost || 0, notes: '' }],
        rto_costs: [{ state: '', checkpoint: '', amount: tripToEdit.rto_cost || 0, notes: '' }],
        dto_costs: [{ state: '', checkpoint: '', amount: tripToEdit.dto_cost || 0, notes: '' }],
        municipalities_costs: [{ state: '', checkpoint: '', amount: tripToEdit.municipalities_cost || 0, notes: '' }],
        border_costs: [{ state: '', checkpoint: '', amount: tripToEdit.border_cost || 0, notes: '' }],
        repair_items: [{ state: '', checkpoint: '', part_or_defect: '', amount: tripToEdit.repair_cost || 0, notes: '' }],
      };
    } else {
      // Default empty form for add mode
      const today = new Date().toISOString().split('T')[0];
      return {
        truck_id: '',
        source: '',
        destination: '',
        driver_id: '',
        start_date: today,
        end_date: today,
        diesel_purchases: [],
        fast_tag_costs: [{ state: '', checkpoint: '', amount: 0, notes: '' }],
        mcd_costs: [{ state: '', checkpoint: '', amount: 0, notes: '' }],
        green_tax_costs: [{ state: '', checkpoint: '', amount: 0, notes: '' }],
        rto_costs: [{ state: '', checkpoint: '', amount: 0, notes: '' }],
        dto_costs: [{ state: '', checkpoint: '', amount: 0, notes: '' }],
        municipalities_costs: [{ state: '', checkpoint: '', amount: 0, notes: '' }],
        border_costs: [{ state: '', checkpoint: '', amount: 0, notes: '' }],
        repair_items: [{ state: '', checkpoint: '', part_or_defect: '', amount: 0, notes: '' }],
      };
    }
  });

  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showDatePicker, setShowDatePicker] = useState<{ [key: string]: boolean }>({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadInitialData();

    // Entrance animation
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

  const loadInitialData = async () => {
    try {
      const [trucksData, driversData] = await Promise.all([
        truckService.getTrucks(),
        driverService.getDrivers(),
      ]);
      setTrucks(trucksData);
      setDrivers(driversData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.truck_id) {
      newErrors.truck_id = 'Please select a truck';
    }
    if (!formData.source.trim()) {
      newErrors.source = 'Source is required';
    }
    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination is required';
    }
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }
    if (formData.start_date && formData.end_date && new Date(formData.start_date) > new Date(formData.end_date)) {
      newErrors.end_date = 'End date must be after start date';
    }
    if (!formData.driver_id) {
      newErrors.driver_id = 'Please select a driver';
    }

    // Validate diesel purchases
    formData.diesel_purchases.forEach((purchase, index) => {
      if (!purchase.state.trim()) {
        newErrors[`diesel_state_${index}`] = 'State is required';
      }
      if (!purchase.city.trim()) {
        newErrors[`diesel_city_${index}`] = 'City is required';
      }
      if (purchase.diesel_quantity <= 0) {
        newErrors[`diesel_quantity_${index}`] = 'Quantity must be greater than 0';
      }
      if (purchase.diesel_price_per_liter <= 0) {
        newErrors[`diesel_price_${index}`] = 'Price must be greater than 0';
      }
      if (!purchase.purchase_date) {
        newErrors[`diesel_date_${index}`] = 'Purchase date is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isEditMode && tripToEdit) {
        // Convert form data to trip data for update
        const tripUpdateData = {
          truck_id: formData.truck_id,
          source: formData.source,
          destination: formData.destination,
          driver_id: formData.driver_id || null,
          start_date: formData.start_date,
          end_date: formData.end_date,
          fast_tag_cost: formData.fast_tag_costs.reduce((sum, cost) => sum + cost.amount, 0),
          mcd_cost: formData.mcd_costs.reduce((sum, cost) => sum + cost.amount, 0),
          green_tax_cost: formData.green_tax_costs.reduce((sum, cost) => sum + cost.amount, 0),
          rto_cost: formData.rto_costs.reduce((sum, cost) => sum + cost.amount, 0),
          dto_cost: formData.dto_costs.reduce((sum, cost) => sum + cost.amount, 0),
          municipalities_cost: formData.municipalities_costs.reduce((sum, cost) => sum + cost.amount, 0),
          border_cost: formData.border_costs.reduce((sum, cost) => sum + cost.amount, 0),
          repair_cost: formData.repair_items.reduce((sum, item) => sum + item.amount, 0),
        };

        await tripService.updateTrip(tripToEdit.id, tripUpdateData);
        Alert.alert(
          'Success',
          'Trip updated successfully!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        await tripService.createTrip(formData);
        Alert.alert(
          'Success',
          'Trip created successfully!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error: unknown) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : `Failed to ${isEditMode ? 'update' : 'create'} trip. Please try again.`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const addDieselPurchase = () => {
    setFormData(prev => ({
      ...prev,
      diesel_purchases: [
        ...prev.diesel_purchases,
        { state: '', city: '', diesel_quantity: 0, diesel_price_per_liter: 0, purchase_date: '' }
      ]
    }));
  };

  const removeDieselPurchase = (index: number) => {
    setFormData(prev => ({
      ...prev,
      diesel_purchases: prev.diesel_purchases.filter((_, i) => i !== index)
    }));
  };

  const updateDieselPurchase = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      diesel_purchases: prev.diesel_purchases.map((purchase, i) =>
        i === index ? { ...purchase, [field]: value } : purchase
      )
    }));
  };

  const updateFastTagCost = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      fast_tag_costs: prev.fast_tag_costs.map((cost, i) =>
        i === index ? { ...cost, [field]: value } : cost
      )
    }));
  };

  const updateMcdCost = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      mcd_costs: prev.mcd_costs.map((cost, i) =>
        i === index ? { ...cost, [field]: value } : cost
      )
    }));
  };

  const updateGreenTaxCost = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      green_tax_costs: prev.green_tax_costs.map((cost, i) =>
        i === index ? { ...cost, [field]: value } : cost
      )
    }));
  };

  const updateRtoCost = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      rto_costs: prev.rto_costs.map((cost, i) =>
        i === index ? { ...cost, [field]: value } : cost
      )
    }));
  };

  const updateDtoCost = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      dto_costs: prev.dto_costs.map((cost, i) =>
        i === index ? { ...cost, [field]: value } : cost
      )
    }));
  };

  const updateBorderCost = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      border_costs: prev.border_costs.map((cost, i) =>
        i === index ? { ...cost, [field]: value } : cost
      )
    }));
  };

  const updateMunicipalitiesCost = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      municipalities_costs: prev.municipalities_costs.map((cost, i) =>
        i === index ? { ...cost, [field]: value } : cost
      )
    }));
  };

  const updateRepairItem = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      repair_items: prev.repair_items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleDateChange = (event: unknown, selectedDate: Date | undefined, index: number) => {
    setShowDatePicker(prev => ({ ...prev, [`purchase_${index}`]: false }));
    if (selectedDate) {
      updateDieselPurchase(index, 'purchase_date', selectedDate.toISOString().split('T')[0]);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const CostSection: React.FC<{
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    costs: number[];
    onUpdate: (costs: number[]) => void;
  }> = ({ title, icon, color, costs, onUpdate }) => (
    <View style={styles.costSection}>
      <View style={styles.costSectionHeader}>
        <View style={[styles.costIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={styles.costSectionTitle}>{title}</Text>
      </View>

      {costs.map((cost, index) => (
        <CustomInput
          key={index}
          label={`${title} ${index + 1}`}
          value={cost.toString()}
          onChangeText={(text) => {
            const newCosts = [...costs];
            newCosts[index] = parseFloat(text) || 0;
            onUpdate(newCosts);
          }}
          leftIcon="cash"
          keyboardType="numeric"
          placeholder="Enter amount"
        />
      ))}

      <CustomButton
        title={`Add ${title}`}
        onPress={() => onUpdate([...costs, 0])}
        variant="outline"
        size="small"
        icon="add"
        style={styles.addCostButton}
      />
    </View>
  );

  const RepairCostSection: React.FC<{
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    costs: Array<{ state: string; checkpoint?: string; part_or_defect: string; amount: number; notes?: string; event_time?: string }>;
    onUpdate: (costs: Array<{ state: string; checkpoint?: string; part_or_defect: string; amount: number; notes?: string; event_time?: string }>) => void;
  }> = ({ title, icon, color, costs, onUpdate }) => (
    <View style={styles.costSection}>
      <View style={styles.costSectionHeader}>
        <View style={[styles.costIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={styles.costSectionTitle}>{title} Costs</Text>
      </View>

      {costs.map((cost, index) => (
        <View key={index} style={styles.complexCostCard}>
          <View style={styles.complexCostHeader}>
            <Text style={styles.complexCostTitle}>{title} Cost {index + 1}</Text>
            <TouchableOpacity
              onPress={() => {
                const newCosts = costs.filter((_, i) => i !== index);
                onUpdate(newCosts);
              }}
              style={styles.removeCostButton}
            >
              <Ionicons name="close-circle" size={20} color={COLORS.error} />
            </TouchableOpacity>
          </View>

          <CustomInput
            label="State"
            value={cost.state}
            onChangeText={(text) => {
              const newCosts = [...costs];
              newCosts[index] = { ...newCosts[index], state: text };
              onUpdate(newCosts);
            }}
            leftIcon="location"
            placeholder="Enter state"
          />

          <CustomInput
            label="Checkpoint (Optional)"
            value={cost.checkpoint || ''}
            onChangeText={(text) => {
              const newCosts = [...costs];
              newCosts[index] = { ...newCosts[index], checkpoint: text };
              onUpdate(newCosts);
            }}
            leftIcon="flag"
            placeholder="Enter checkpoint"
          />

          <CustomInput
            label="Part/Defect"
            value={cost.part_or_defect}
            onChangeText={(text) => {
              const newCosts = [...costs];
              newCosts[index] = { ...newCosts[index], part_or_defect: text };
              onUpdate(newCosts);
            }}
            leftIcon="construct"
            placeholder="Enter part or defect description"
          />

          <CustomInput
            label="Amount"
            value={cost.amount.toString()}
            onChangeText={(text) => {
              const newCosts = [...costs];
              newCosts[index] = { ...newCosts[index], amount: parseFloat(text) || 0 };
              onUpdate(newCosts);
            }}
            leftIcon="cash"
            keyboardType="numeric"
            placeholder="Enter amount"
          />

          <CustomInput
            label="Notes (Optional)"
            value={cost.notes || ''}
            onChangeText={(text) => {
              const newCosts = [...costs];
              newCosts[index] = { ...newCosts[index], notes: text };
              onUpdate(newCosts);
            }}
            leftIcon="document-text"
            placeholder="Enter notes"
            multiline
          />
        </View>
      ))}

      <CustomButton
        title={`Add ${title}`}
        onPress={() => onUpdate([...costs, { state: '', checkpoint: '', part_or_defect: '', amount: 0, notes: '' }])}
        variant="outline"
        size="small"
        icon="add"
        style={styles.addCostButton}
      />
    </View>
  );

  const ComplexCostSection: React.FC<{
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    costs: Array<{ state: string; checkpoint?: string; amount: number; notes?: string; event_time?: string }>;
    onUpdate: (costs: Array<{ state: string; checkpoint?: string; amount: number; notes?: string; event_time?: string }>) => void;
  }> = ({ title, icon, color, costs, onUpdate }) => (
    <View style={styles.costSection}>
      <View style={styles.costSectionHeader}>
        <View style={[styles.costIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={styles.costSectionTitle}>{title} Costs</Text>
      </View>

      {costs.map((cost, index) => (
        <View key={index} style={styles.complexCostCard}>
          <View style={styles.complexCostHeader}>
            <Text style={styles.complexCostTitle}>{title} Cost {index + 1}</Text>
            <TouchableOpacity
              onPress={() => {
                const newCosts = costs.filter((_, i) => i !== index);
                onUpdate(newCosts);
              }}
              style={styles.removeCostButton}
            >
              <Ionicons name="close-circle" size={20} color={COLORS.error} />
            </TouchableOpacity>
          </View>

          <CustomInput
            label="State"
            value={cost.state}
            onChangeText={(text) => {
              const newCosts = [...costs];
              newCosts[index] = { ...newCosts[index], state: text };
              onUpdate(newCosts);
            }}
            leftIcon="location"
            placeholder="Enter state"
          />

          <CustomInput
            label="Checkpoint (Optional)"
            value={cost.checkpoint || ''}
            onChangeText={(text) => {
              const newCosts = [...costs];
              newCosts[index] = { ...newCosts[index], checkpoint: text };
              onUpdate(newCosts);
            }}
            leftIcon="flag"
            placeholder="Enter checkpoint"
          />

          <CustomInput
            label="Amount"
            value={cost.amount.toString()}
            onChangeText={(text) => {
              const newCosts = [...costs];
              newCosts[index] = { ...newCosts[index], amount: parseFloat(text) || 0 };
              onUpdate(newCosts);
            }}
            leftIcon="cash"
            keyboardType="numeric"
            placeholder="Enter amount"
          />

          <CustomInput
            label="Notes (Optional)"
            value={cost.notes || ''}
            onChangeText={(text) => {
              const newCosts = [...costs];
              newCosts[index] = { ...newCosts[index], notes: text };
              onUpdate(newCosts);
            }}
            leftIcon="document-text"
            placeholder="Enter notes"
            multiline
          />
        </View>
      ))}

      <CustomButton
        title={`Add ${title}`}
        onPress={() => onUpdate([...costs, { state: '', checkpoint: '', amount: 0, notes: '' }])}
        variant="outline"
        size="small"
        icon="add"
        style={styles.addCostButton}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Sticky Header */}
      <LinearGradient
        colors={COLORS.primaryGradient}
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
            <Text style={styles.headerTitle}>Add New Trip</Text>
            <Text style={styles.headerSubtitle}>
              Create a new trip with all expenses
            </Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="add-circle" size={28} color={COLORS.textInverse} />
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

              <CustomInput
                label="Source"
                value={formData.source}
                onChangeText={(text) => setFormData(prev => ({ ...prev, source: text }))}
                leftIcon="location"
                error={errors.source}
                placeholder="Enter source location"
              />

              <CustomInput
                label="Destination"
                value={formData.destination}
                onChangeText={(text) => setFormData(prev => ({ ...prev, destination: text }))}
                leftIcon="location"
                error={errors.destination}
                placeholder="Enter destination location"
              />

              {/* Trip Dates */}
              <View style={styles.dateRow}>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowDatePicker(prev => ({ ...prev, start_date: true }))}
                >
                  <View style={styles.dateInputContent}>
                    <Ionicons name="calendar" size={20} color={COLORS.primary} />
                    <View style={styles.dateInputText}>
                      <Text style={styles.dateLabel}>Start Date</Text>
                      <Text style={styles.dateValue}>
                        {formData.start_date ? new Date(formData.start_date).toLocaleDateString('en-IN') : 'Select start date'}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowDatePicker(prev => ({ ...prev, end_date: true }))}
                >
                  <View style={styles.dateInputContent}>
                    <Ionicons name="calendar" size={20} color={COLORS.primary} />
                    <View style={styles.dateInputText}>
                      <Text style={styles.dateLabel}>End Date</Text>
                      <Text style={styles.dateValue}>
                        {formData.end_date ? new Date(formData.end_date).toLocaleDateString('en-IN') : 'Select end date'}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Trip Duration Display */}
              {formData.start_date && formData.end_date && (
                <View style={styles.durationContainer}>
                  <Ionicons name="time" size={16} color={COLORS.info} />
                  <Text style={styles.durationText}>
                    Trip Duration: {Math.max(1, Math.ceil((new Date(formData.end_date).getTime() - new Date(formData.start_date).getTime()) / (1000 * 60 * 60 * 24)))} days
                  </Text>
                </View>
              )}
            </View>

            {/* Vehicle & Driver Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Vehicle & Driver</Text>

              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Select Truck</Text>
                <View style={styles.picker}>
                  {trucks.map(truck => (
                    <TouchableOpacity
                      key={truck.id}
                      style={[
                        styles.pickerOption,
                        formData.truck_id === truck.id && styles.pickerOptionSelected
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, truck_id: truck.id }))}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        formData.truck_id === truck.id && styles.pickerOptionTextSelected
                      ]}>
                        {truck.name} - {truck.truck_number}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.truck_id && <Text style={styles.errorText}>{errors.truck_id}</Text>}
              </View>

              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Select Driver</Text>
                <View style={styles.picker}>
                  {drivers.map(driver => (
                    <TouchableOpacity
                      key={driver.id}
                      style={[
                        styles.pickerOption,
                        formData.driver_id === driver.id && styles.pickerOptionSelected
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, driver_id: driver.id }))}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        formData.driver_id === driver.id && styles.pickerOptionTextSelected
                      ]}>
                        {driver.name} - {driver.license_number}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.driver_id && <Text style={styles.errorText}>{errors.driver_id}</Text>}
              </View>
            </View>

            {/* Diesel Purchases */}
            <View style={styles.costSection}>
              <View style={styles.costSectionHeader}>
                <View style={[styles.costIcon, { backgroundColor: COLORS.primary + '20' }]}>
                  <Ionicons name="water" size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.costSectionTitle}>Diesel Purchases</Text>
              </View>

              {formData.diesel_purchases.map((purchase, index) => (
                <View key={index} style={styles.complexCostCard}>
                  <View style={styles.complexCostHeader}>
                    <Text style={styles.complexCostTitle}>Purchase {index + 1}</Text>
                    <TouchableOpacity
                      onPress={() => removeDieselPurchase(index)}
                      style={styles.removeCostButton}
                    >
                      <Ionicons name="close-circle" size={20} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>

                  <CustomInput
                    label="State"
                    value={purchase.state}
                    onChangeText={(text) => updateDieselPurchase(index, 'state', text)}
                    placeholder="Enter state"
                    leftIcon="location"
                    error={errors[`diesel_state_${index}`]}
                  />

                  <CustomInput
                    label="City"
                    value={purchase.city}
                    onChangeText={(text) => updateDieselPurchase(index, 'city', text)}
                    placeholder="Enter city"
                    leftIcon="business"
                    error={errors[`diesel_city_${index}`]}
                  />

                  <CustomInput
                    label="Quantity (L)"
                    value={purchase.diesel_quantity > 0 ? purchase.diesel_quantity.toString() : ''}
                    onChangeText={(text) => {
                      const value = parseFloat(text) || 0;
                      updateDieselPurchase(index, 'diesel_quantity', value);
                    }}
                    keyboardType="numeric"
                    placeholder="Enter quantity in liters"
                    leftIcon="water"
                    error={errors[`diesel_quantity_${index}`]}
                  />

                  <CustomInput
                    label="Price/Liter (₹)"
                    value={purchase.diesel_price_per_liter > 0 ? purchase.diesel_price_per_liter.toString() : ''}
                    onChangeText={(text) => {
                      const value = parseFloat(text) || 0;
                      updateDieselPurchase(index, 'diesel_price_per_liter', value);
                    }}
                    keyboardType="numeric"
                    placeholder="Enter price per liter"
                    leftIcon="cash"
                    error={errors[`diesel_price_${index}`]}
                  />

                  <TouchableOpacity
                    style={[
                      styles.datePickerButton,
                      errors[`diesel_date_${index}`] && styles.datePickerButtonError
                    ]}
                    onPress={() => setShowDatePicker(prev => ({ ...prev, [`purchase_${index}`]: true }))}
                  >
                    <View style={styles.datePickerContent}>
                      <Ionicons
                        name="calendar"
                        size={20}
                        color={errors[`diesel_date_${index}`] ? COLORS.error : COLORS.primary}
                        style={styles.datePickerIcon}
                      />
                      <View style={styles.datePickerText}>
                        <Text style={[
                          styles.datePickerLabel,
                          errors[`diesel_date_${index}`] && styles.datePickerLabelError
                        ]}>
                          Purchase Date
                        </Text>
                        <Text style={[
                          styles.datePickerValue,
                          errors[`diesel_date_${index}`] && styles.datePickerValueError
                        ]}>
                          {purchase.purchase_date ? formatDate(purchase.purchase_date) : 'Select date'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                  {errors[`diesel_date_${index}`] && (
                    <Text style={styles.datePickerErrorText}>{errors[`diesel_date_${index}`]}</Text>
                  )}

                  {/* Total Calculation Display */}
                  {purchase.diesel_quantity > 0 && purchase.diesel_price_per_liter > 0 && (
                    <View style={styles.totalCalculationContainer}>
                      <View style={styles.totalCalculationRow}>
                        <Text style={styles.totalCalculationLabel}>Total Amount:</Text>
                        <Text style={styles.totalCalculationValue}>
                          ₹{(purchase.diesel_quantity * purchase.diesel_price_per_liter).toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.totalCalculationRow}>
                        <Text style={styles.totalCalculationSubLabel}>
                          {purchase.diesel_quantity}L × ₹{purchase.diesel_price_per_liter}/L
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              ))}

              <CustomButton
                title="Add Purchase"
                onPress={addDieselPurchase}
                variant="outline"
                size="small"
                icon="add"
                style={styles.addCostButton}
              />
            </View>

            {/* Cost Sections */}
            {/* Fast Tag Costs */}
            <View style={styles.costSection}>
              <View style={styles.costSectionHeader}>
                <View style={[styles.costIcon, { backgroundColor: COLORS.info + '20' }]}>
                  <Ionicons name="card" size={20} color={COLORS.info} />
                </View>
                <Text style={styles.costSectionTitle}>Fast Tag Costs</Text>
              </View>

              {formData.fast_tag_costs.map((cost, index) => (
                <View key={index} style={styles.complexCostCard}>
                  <View style={styles.complexCostHeader}>
                    <Text style={styles.complexCostTitle}>Fast Tag Cost {index + 1}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setFormData(prev => ({
                          ...prev,
                          fast_tag_costs: prev.fast_tag_costs.filter((_, i) => i !== index)
                        }));
                      }}
                      style={styles.removeCostButton}
                    >
                      <Ionicons name="close-circle" size={20} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>

                  <CustomInput
                    label="State"
                    value={cost.state}
                    onChangeText={(text) => updateFastTagCost(index, 'state', text)}
                    leftIcon="location"
                    placeholder="Enter state"
                  />

                  <CustomInput
                    label="Checkpoint (Optional)"
                    value={cost.checkpoint || ''}
                    onChangeText={(text) => updateFastTagCost(index, 'checkpoint', text)}
                    leftIcon="flag"
                    placeholder="Enter checkpoint"
                  />

                  <CustomInput
                    label="Amount"
                    value={cost.amount.toString()}
                    onChangeText={(text) => updateFastTagCost(index, 'amount', parseFloat(text) || 0)}
                    leftIcon="cash"
                    keyboardType="numeric"
                    placeholder="Enter amount"
                  />

                  <CustomInput
                    label="Notes (Optional)"
                    value={cost.notes || ''}
                    onChangeText={(text) => updateFastTagCost(index, 'notes', text)}
                    leftIcon="document-text"
                    placeholder="Enter notes"
                    multiline
                  />
                </View>
              ))}

              <CustomButton
                title="Add Fast Tag"
                onPress={() => {
                  setFormData(prev => ({
                    ...prev,
                    fast_tag_costs: [...prev.fast_tag_costs, { state: '', checkpoint: '', amount: 0, notes: '' }]
                  }));
                }}
                variant="outline"
                size="small"
                icon="add"
                style={styles.addCostButton}
              />
            </View>

            {/* MCD Costs */}
            <View style={styles.costSection}>
              <View style={styles.costSectionHeader}>
                <View style={[styles.costIcon, { backgroundColor: COLORS.warning + '20' }]}>
                  <Ionicons name="business" size={20} color={COLORS.warning} />
                </View>
                <Text style={styles.costSectionTitle}>MCD Costs</Text>
              </View>

              {formData.mcd_costs.map((cost, index) => (
                <View key={index} style={styles.complexCostCard}>
                  <View style={styles.complexCostHeader}>
                    <Text style={styles.complexCostTitle}>MCD Cost {index + 1}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setFormData(prev => ({
                          ...prev,
                          mcd_costs: prev.mcd_costs.filter((_, i) => i !== index)
                        }));
                      }}
                      style={styles.removeCostButton}
                    >
                      <Ionicons name="close-circle" size={20} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>

                  <CustomInput
                    label="State"
                    value={cost.state}
                    onChangeText={(text) => updateMcdCost(index, 'state', text)}
                    leftIcon="location"
                    placeholder="Enter state"
                  />

                  <CustomInput
                    label="Checkpoint (Optional)"
                    value={cost.checkpoint || ''}
                    onChangeText={(text) => updateMcdCost(index, 'checkpoint', text)}
                    leftIcon="flag"
                    placeholder="Enter checkpoint"
                  />

                  <CustomInput
                    label="Amount"
                    value={cost.amount.toString()}
                    onChangeText={(text) => updateMcdCost(index, 'amount', parseFloat(text) || 0)}
                    leftIcon="cash"
                    keyboardType="numeric"
                    placeholder="Enter amount"
                  />

                  <CustomInput
                    label="Notes (Optional)"
                    value={cost.notes || ''}
                    onChangeText={(text) => updateMcdCost(index, 'notes', text)}
                    leftIcon="document-text"
                    placeholder="Enter notes"
                    multiline
                  />
                </View>
              ))}

              <CustomButton
                title="Add MCD"
                onPress={() => {
                  setFormData(prev => ({
                    ...prev,
                    mcd_costs: [...prev.mcd_costs, { state: '', checkpoint: '', amount: 0, notes: '' }]
                  }));
                }}
                variant="outline"
                size="small"
                icon="add"
                style={styles.addCostButton}
              />
            </View>

            {/* Green Tax Costs */}
            <View style={styles.costSection}>
              <View style={styles.costSectionHeader}>
                <View style={[styles.costIcon, { backgroundColor: COLORS.success + '20' }]}>
                  <Ionicons name="leaf" size={20} color={COLORS.success} />
                </View>
                <Text style={styles.costSectionTitle}>Green Tax Costs</Text>
              </View>

              {formData.green_tax_costs.map((cost, index) => (
                <View key={index} style={styles.complexCostCard}>
                  <View style={styles.complexCostHeader}>
                    <Text style={styles.complexCostTitle}>Green Tax Cost {index + 1}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setFormData(prev => ({
                          ...prev,
                          green_tax_costs: prev.green_tax_costs.filter((_, i) => i !== index)
                        }));
                      }}
                      style={styles.removeCostButton}
                    >
                      <Ionicons name="close-circle" size={20} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>

                  <CustomInput
                    label="State"
                    value={cost.state}
                    onChangeText={(text) => updateGreenTaxCost(index, 'state', text)}
                    leftIcon="location"
                    placeholder="Enter state"
                  />

                  <CustomInput
                    label="Checkpoint (Optional)"
                    value={cost.checkpoint || ''}
                    onChangeText={(text) => updateGreenTaxCost(index, 'checkpoint', text)}
                    leftIcon="flag"
                    placeholder="Enter checkpoint"
                  />

                  <CustomInput
                    label="Amount"
                    value={cost.amount.toString()}
                    onChangeText={(text) => updateGreenTaxCost(index, 'amount', parseFloat(text) || 0)}
                    leftIcon="cash"
                    keyboardType="numeric"
                    placeholder="Enter amount"
                  />

                  <CustomInput
                    label="Notes (Optional)"
                    value={cost.notes || ''}
                    onChangeText={(text) => updateGreenTaxCost(index, 'notes', text)}
                    leftIcon="document-text"
                    placeholder="Enter notes"
                    multiline
                  />
                </View>
              ))}

              <CustomButton
                title="Add Green Tax"
                onPress={() => {
                  setFormData(prev => ({
                    ...prev,
                    green_tax_costs: [...prev.green_tax_costs, { state: '', checkpoint: '', amount: 0, notes: '' }]
                  }));
                }}
                variant="outline"
                size="small"
                icon="add"
                style={styles.addCostButton}
              />
            </View>

            {/* RTO Costs */}
            <View style={styles.costSection}>
              <View style={styles.costSectionHeader}>
                <View style={[styles.costIcon, { backgroundColor: COLORS.primary + '20' }]}>
                  <Ionicons name="document-text" size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.costSectionTitle}>RTO Costs</Text>
              </View>

              {formData.rto_costs.map((cost, index) => (
                <View key={index} style={styles.complexCostCard}>
                  <View style={styles.complexCostHeader}>
                    <Text style={styles.complexCostTitle}>RTO Cost {index + 1}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setFormData(prev => ({
                          ...prev,
                          rto_costs: prev.rto_costs.filter((_, i) => i !== index)
                        }));
                      }}
                      style={styles.removeCostButton}
                    >
                      <Ionicons name="close-circle" size={20} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>

                  <CustomInput
                    label="State"
                    value={cost.state}
                    onChangeText={(text) => updateRtoCost(index, 'state', text)}
                    leftIcon="location"
                    placeholder="Enter state"
                  />

                  <CustomInput
                    label="Checkpoint (Optional)"
                    value={cost.checkpoint || ''}
                    onChangeText={(text) => updateRtoCost(index, 'checkpoint', text)}
                    leftIcon="flag"
                    placeholder="Enter checkpoint"
                  />

                  <CustomInput
                    label="Amount"
                    value={cost.amount.toString()}
                    onChangeText={(text) => updateRtoCost(index, 'amount', parseFloat(text) || 0)}
                    leftIcon="cash"
                    keyboardType="numeric"
                    placeholder="Enter amount"
                  />

                  <CustomInput
                    label="Notes (Optional)"
                    value={cost.notes || ''}
                    onChangeText={(text) => updateRtoCost(index, 'notes', text)}
                    leftIcon="document-text"
                    placeholder="Enter notes"
                    multiline
                  />
                </View>
              ))}

              <CustomButton
                title="Add RTO"
                onPress={() => {
                  setFormData(prev => ({
                    ...prev,
                    rto_costs: [...prev.rto_costs, { state: '', checkpoint: '', amount: 0, notes: '' }]
                  }));
                }}
                variant="outline"
                size="small"
                icon="add"
                style={styles.addCostButton}
              />
            </View>

            {/* DTO Costs */}
            <View style={styles.costSection}>
              <View style={styles.costSectionHeader}>
                <View style={[styles.costIcon, { backgroundColor: COLORS.secondary + '20' }]}>
                  <Ionicons name="receipt" size={20} color={COLORS.secondary} />
                </View>
                <Text style={styles.costSectionTitle}>DTO Costs</Text>
              </View>

              {formData.dto_costs.map((cost, index) => (
                <View key={index} style={styles.complexCostCard}>
                  <View style={styles.complexCostHeader}>
                    <Text style={styles.complexCostTitle}>DTO Cost {index + 1}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setFormData(prev => ({
                          ...prev,
                          dto_costs: prev.dto_costs.filter((_, i) => i !== index)
                        }));
                      }}
                      style={styles.removeCostButton}
                    >
                      <Ionicons name="close-circle" size={20} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>

                  <CustomInput
                    label="State"
                    value={cost.state}
                    onChangeText={(text) => updateDtoCost(index, 'state', text)}
                    leftIcon="location"
                    placeholder="Enter state"
                  />

                  <CustomInput
                    label="Checkpoint (Optional)"
                    value={cost.checkpoint || ''}
                    onChangeText={(text) => updateDtoCost(index, 'checkpoint', text)}
                    leftIcon="flag"
                    placeholder="Enter checkpoint"
                  />

                  <CustomInput
                    label="Amount"
                    value={cost.amount.toString()}
                    onChangeText={(text) => updateDtoCost(index, 'amount', parseFloat(text) || 0)}
                    leftIcon="cash"
                    keyboardType="numeric"
                    placeholder="Enter amount"
                  />

                  <CustomInput
                    label="Notes (Optional)"
                    value={cost.notes || ''}
                    onChangeText={(text) => updateDtoCost(index, 'notes', text)}
                    leftIcon="document-text"
                    placeholder="Enter notes"
                    multiline
                  />
                </View>
              ))}

              <CustomButton
                title="Add DTO"
                onPress={() => {
                  setFormData(prev => ({
                    ...prev,
                    dto_costs: [...prev.dto_costs, { state: '', checkpoint: '', amount: 0, notes: '' }]
                  }));
                }}
                variant="outline"
                size="small"
                icon="add"
                style={styles.addCostButton}
              />
            </View>

            {/* Border Costs */}
            <View style={styles.costSection}>
              <View style={styles.costSectionHeader}>
                <View style={[styles.costIcon, { backgroundColor: COLORS.warning + '20' }]}>
                  <Ionicons name="flag" size={20} color={COLORS.warning} />
                </View>
                <Text style={styles.costSectionTitle}>Border Costs</Text>
              </View>

              {formData.border_costs.map((cost, index) => (
                <View key={index} style={styles.complexCostCard}>
                  <View style={styles.complexCostHeader}>
                    <Text style={styles.complexCostTitle}>Border Cost {index + 1}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setFormData(prev => ({
                          ...prev,
                          border_costs: prev.border_costs.filter((_, i) => i !== index)
                        }));
                      }}
                      style={styles.removeCostButton}
                    >
                      <Ionicons name="close-circle" size={20} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>

                  <CustomInput
                    label="State"
                    value={cost.state}
                    onChangeText={(text) => updateBorderCost(index, 'state', text)}
                    leftIcon="location"
                    placeholder="Enter state"
                  />

                  <CustomInput
                    label="Checkpoint (Optional)"
                    value={cost.checkpoint || ''}
                    onChangeText={(text) => updateBorderCost(index, 'checkpoint', text)}
                    leftIcon="flag"
                    placeholder="Enter checkpoint"
                  />

                  <CustomInput
                    label="Amount"
                    value={cost.amount.toString()}
                    onChangeText={(text) => updateBorderCost(index, 'amount', parseFloat(text) || 0)}
                    leftIcon="cash"
                    keyboardType="numeric"
                    placeholder="Enter amount"
                  />

                  <CustomInput
                    label="Notes (Optional)"
                    value={cost.notes || ''}
                    onChangeText={(text) => updateBorderCost(index, 'notes', text)}
                    leftIcon="document-text"
                    placeholder="Enter notes"
                    multiline
                  />
                </View>
              ))}

              <CustomButton
                title="Add Border"
                onPress={() => {
                  setFormData(prev => ({
                    ...prev,
                    border_costs: [...prev.border_costs, { state: '', checkpoint: '', amount: 0, notes: '' }]
                  }));
                }}
                variant="outline"
                size="small"
                icon="add"
                style={styles.addCostButton}
              />
            </View>

            {/* Municipalities Costs */}
            <View style={styles.costSection}>
              <View style={styles.costSectionHeader}>
                <View style={[styles.costIcon, { backgroundColor: COLORS.accent + '20' }]}>
                  <Ionicons name="business" size={20} color={COLORS.accent} />
                </View>
                <Text style={styles.costSectionTitle}>Municipalities Costs</Text>
              </View>

              {formData.municipalities_costs.map((cost, index) => (
                <View key={index} style={styles.complexCostCard}>
                  <View style={styles.complexCostHeader}>
                    <Text style={styles.complexCostTitle}>Municipalities Cost {index + 1}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setFormData(prev => ({
                          ...prev,
                          municipalities_costs: prev.municipalities_costs.filter((_, i) => i !== index)
                        }));
                      }}
                      style={styles.removeCostButton}
                    >
                      <Ionicons name="close-circle" size={20} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>

                  <CustomInput
                    label="State"
                    value={cost.state}
                    onChangeText={(text) => updateMunicipalitiesCost(index, 'state', text)}
                    leftIcon="location"
                    placeholder="Enter state"
                  />

                  <CustomInput
                    label="Checkpoint (Optional)"
                    value={cost.checkpoint || ''}
                    onChangeText={(text) => updateMunicipalitiesCost(index, 'checkpoint', text)}
                    leftIcon="flag"
                    placeholder="Enter checkpoint"
                  />

                  <CustomInput
                    label="Amount"
                    value={cost.amount.toString()}
                    onChangeText={(text) => updateMunicipalitiesCost(index, 'amount', parseFloat(text) || 0)}
                    leftIcon="cash"
                    keyboardType="numeric"
                    placeholder="Enter amount"
                  />

                  <CustomInput
                    label="Notes (Optional)"
                    value={cost.notes || ''}
                    onChangeText={(text) => updateMunicipalitiesCost(index, 'notes', text)}
                    leftIcon="document-text"
                    placeholder="Enter notes"
                    multiline
                  />
                </View>
              ))}

              <CustomButton
                title="Add Municipalities"
                onPress={() => {
                  setFormData(prev => ({
                    ...prev,
                    municipalities_costs: [...prev.municipalities_costs, { state: '', checkpoint: '', amount: 0, notes: '' }]
                  }));
                }}
                variant="outline"
                size="small"
                icon="add"
                style={styles.addCostButton}
              />
            </View>

            {/* Repair Costs */}
            <View style={styles.costSection}>
              <View style={styles.costSectionHeader}>
                <View style={[styles.costIcon, { backgroundColor: COLORS.warning + '20' }]}>
                  <Ionicons name="construct" size={20} color={COLORS.warning} />
                </View>
                <Text style={styles.costSectionTitle}>Repair Costs</Text>
              </View>

              {formData.repair_items.map((item, index) => (
                <View key={index} style={styles.complexCostCard}>
                  <View style={styles.complexCostHeader}>
                    <Text style={styles.complexCostTitle}>Repair Cost {index + 1}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setFormData(prev => ({
                          ...prev,
                          repair_items: prev.repair_items.filter((_, i) => i !== index)
                        }));
                      }}
                      style={styles.removeCostButton}
                    >
                      <Ionicons name="close-circle" size={20} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>

                  <CustomInput
                    label="State"
                    value={item.state}
                    onChangeText={(text) => updateRepairItem(index, 'state', text)}
                    leftIcon="location"
                    placeholder="Enter state"
                  />

                  <CustomInput
                    label="Checkpoint (Optional)"
                    value={item.checkpoint || ''}
                    onChangeText={(text) => updateRepairItem(index, 'checkpoint', text)}
                    leftIcon="flag"
                    placeholder="Enter checkpoint"
                  />

                  <CustomInput
                    label="Part/Defect"
                    value={item.part_or_defect}
                    onChangeText={(text) => updateRepairItem(index, 'part_or_defect', text)}
                    leftIcon="construct"
                    placeholder="Enter part or defect description"
                  />

                  <CustomInput
                    label="Amount"
                    value={item.amount.toString()}
                    onChangeText={(text) => updateRepairItem(index, 'amount', parseFloat(text) || 0)}
                    leftIcon="cash"
                    keyboardType="numeric"
                    placeholder="Enter amount"
                  />

                  <CustomInput
                    label="Notes (Optional)"
                    value={item.notes || ''}
                    onChangeText={(text) => updateRepairItem(index, 'notes', text)}
                    leftIcon="document-text"
                    placeholder="Enter notes"
                    multiline
                  />
                </View>
              ))}

              <CustomButton
                title="Add Repair"
                onPress={() => {
                  setFormData(prev => ({
                    ...prev,
                    repair_items: [...prev.repair_items, { state: '', checkpoint: '', part_or_defect: '', amount: 0, notes: '' }]
                  }));
                }}
                variant="outline"
                size="small"
                icon="add"
                style={styles.addCostButton}
              />
            </View>

            {/* Submit Button */}
            <CustomButton
              title={isEditMode ? "Edit Trip" : "Create Trip"}
              onPress={handleSubmit}
              loading={loading}
              variant="primary"
              size="large"
              fullWidth
              icon="checkmark-circle"
              style={styles.submitButton}
            />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker Modal */}
      {Object.entries(showDatePicker).map(([key, show]) => {
        if (!show) return null;

        // Handle trip start/end date pickers
        if (key === 'start_date') {
          return (
            <DateTimePicker
              key={key}
              value={formData.start_date ? new Date(formData.start_date) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  setFormData(prev => ({ ...prev, start_date: selectedDate.toISOString().split('T')[0] }));
                }
                setShowDatePicker(prev => ({ ...prev, start_date: false }));
              }}
            />
          );
        }

        if (key === 'end_date') {
          return (
            <DateTimePicker
              key={key}
              value={formData.end_date ? new Date(formData.end_date) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  setFormData(prev => ({ ...prev, end_date: selectedDate.toISOString().split('T')[0] }));
                }
                setShowDatePicker(prev => ({ ...prev, end_date: false }));
              }}
            />
          );
        }

        // Handle diesel purchase date pickers (existing logic)
        const index = parseInt(key.split('_')[1]);
        return (
          <DateTimePicker
            key={key}
            value={formData.diesel_purchases[index]?.purchase_date ? new Date(formData.diesel_purchases[index].purchase_date) : new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => handleDateChange(event, selectedDate, index)}
          />
        );
      })}
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
    paddingTop: SIZES.spacingXl + 20, // Add extra padding for status bar/notch
    paddingBottom: SIZES.spacingLg,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacingLg,
  },
  sectionTitle: {
    fontSize: SIZES.fontSizeLg,
    fontWeight: '700' as const,
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacingMd,
  },
  pickerContainer: {
    marginBottom: SIZES.spacingLg,
  },
  pickerLabel: {
    fontSize: SIZES.fontSizeMd,
    fontWeight: '600' as const,
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacingSm,
  },
  picker: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.surface,
  },
  pickerOption: {
    padding: SIZES.spacingMd,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pickerOptionSelected: {
    backgroundColor: COLORS.primaryLight,
  },
  pickerOptionText: {
    fontSize: SIZES.fontSizeMd,
    color: COLORS.textPrimary,
    fontWeight: '500' as const,
  },
  pickerOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600' as const,
  },
  errorText: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.error,
    marginTop: SIZES.spacingXs,
  },
  dieselPurchaseCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.spacingLg,
    marginBottom: SIZES.spacingMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SIZES.shadow,
    position: 'relative',
  },
  dieselPurchaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacingMd,
  },
  dieselPurchaseTitle: {
    fontSize: SIZES.fontSizeLg,
    fontWeight: '700' as const,
    color: COLORS.textPrimary,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.error + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePickerButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.spacingMd,
    marginBottom: SIZES.spacingSm,
  },
  datePickerButtonError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.error + '10',
  },
  datePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  datePickerIcon: {
    marginRight: SIZES.spacingSm,
  },
  datePickerText: {
    flex: 1,
  },
  datePickerLabel: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacingXs,
  },
  datePickerValue: {
    fontSize: SIZES.fontSizeMd,
    color: COLORS.textPrimary,
    fontWeight: '500' as const,
  },
  datePickerLabelError: {
    color: COLORS.error,
  },
  datePickerValueError: {
    color: COLORS.error,
  },
  datePickerErrorText: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.error,
    marginTop: SIZES.spacingXs,
    marginLeft: SIZES.spacingSm,
  },
  totalCalculationContainer: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.spacingMd,
    marginTop: SIZES.spacingSm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  totalCalculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacingXs,
  },
  totalCalculationLabel: {
    fontSize: SIZES.fontSizeMd,
    fontWeight: '600' as const,
    color: COLORS.textPrimary,
  },
  totalCalculationValue: {
    fontSize: SIZES.fontSizeLg,
    fontWeight: '700' as const,
    color: COLORS.primary,
  },
  totalCalculationSubLabel: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  costSection: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.spacingLg,
    marginBottom: SIZES.spacingLg,
    ...SIZES.shadow,
  },
  costSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacingLg,
  },
  costIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.spacingMd,
  },
  costSectionTitle: {
    fontSize: SIZES.fontSizeLg,
    fontWeight: '700' as const,
    color: COLORS.textPrimary,
    marginLeft: SIZES.spacingMd,
  },
  addCostButton: {
    marginTop: SIZES.spacingMd,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  complexCostCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.spacingLg,
    marginBottom: SIZES.spacingMd,
    ...SIZES.shadowMedium,
  },
  complexCostHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacingMd,
  },
  complexCostTitle: {
    fontSize: SIZES.fontSizeMd,
    fontWeight: '600' as const,
    color: COLORS.textPrimary,
  },
  removeCostButton: {
    padding: SIZES.spacingXs,
  },
  submitButton: {
    marginTop: SIZES.spacingLg,
  },
  dateRow: {
    flexDirection: 'column',
    gap: SIZES.spacingMd,
    marginTop: SIZES.spacingMd,
  },
  dateInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SIZES.spacingMd,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateInputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateInputText: {
    marginLeft: SIZES.spacingSm,
    flex: 1,
  },
  dateLabel: {
    fontSize: SIZES.fontSizeSm,
    fontWeight: '600' as const,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacingXs,
  },
  dateValue: {
    fontSize: SIZES.fontSizeMd,
    fontWeight: '500' as const,
    color: COLORS.textPrimary,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.infoLight,
    padding: SIZES.spacingMd,
    borderRadius: SIZES.radiusMd,
    marginTop: SIZES.spacingMd,
  },
  durationText: {
    fontSize: SIZES.fontSizeSm,
    fontWeight: '600' as const,
    color: COLORS.info,
    marginLeft: SIZES.spacingSm,
  },
});

export default AddTripScreen;
