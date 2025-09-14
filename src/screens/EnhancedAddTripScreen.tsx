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
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { mockTripService, mockTruckService, mockDriverService } from '../services/mockService';
import { COLORS, SIZES, ANIMATIONS } from '../constants/theme';
import EnhancedCustomInput from '../components/EnhancedCustomInput';
import EnhancedCustomButton from '../components/EnhancedCustomButton';
import { Truck, Driver, TripFormData, AddTripScreenNavigationProp } from '../types';

const EnhancedAddTripScreen: React.FC = () => {
  const navigation = useNavigation<AddTripScreenNavigationProp>();
  const [formData, setFormData] = useState<TripFormData>({
    truck_id: '',
    source: '',
    destination: '',
    driver_id: '',
    diesel_purchases: [],
    fast_tag_costs: [0],
    mcd_costs: [0],
    green_tax_costs: [0],
    rto_costs: [{ state: '', checkpoint: '', amount: 0, notes: '' }],
    dto_costs: [{ state: '', checkpoint: '', amount: 0, notes: '' }],
    municipalities_costs: [{ state: '', checkpoint: '', amount: 0, notes: '' }],
    border_costs: [{ state: '', checkpoint: '', amount: 0, notes: '' }],
    repair_cost: 0,
  });
  
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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
        mockTruckService.getTrucks(),
        mockDriverService.getDrivers(),
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
    if (!formData.driver_id) {
      newErrors.driver_id = 'Please select a driver';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await mockTripService.createTrip(formData);
      Alert.alert(
        'Success',
        'Trip created successfully!',
        [{ text: 'OK', onPress: () => {} }]
      );
    } catch (error: unknown) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to create trip. Please try again.',
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
        <EnhancedCustomInput
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
      
      <EnhancedCustomButton
        title={`Add ${title}`}
        onPress={() => onUpdate([...costs, 0])}
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
          
          <EnhancedCustomInput
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
          
          <EnhancedCustomInput
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
          
          <EnhancedCustomInput
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
          
          <EnhancedCustomInput
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
      
      <EnhancedCustomButton
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
              
              <EnhancedCustomInput
                label="Source"
                value={formData.source}
                onChangeText={(text) => setFormData(prev => ({ ...prev, source: text }))}
                leftIcon="location"
                error={errors.source}
                placeholder="Enter source location"
              />

              <EnhancedCustomInput
                label="Destination"
                value={formData.destination}
                onChangeText={(text) => setFormData(prev => ({ ...prev, destination: text }))}
                leftIcon="location"
                error={errors.destination}
                placeholder="Enter destination location"
              />
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
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Diesel Purchases</Text>
                <EnhancedCustomButton
                  title="Add Purchase"
                  onPress={addDieselPurchase}
                  variant="outline"
                  size="small"
                  icon="add"
                />
              </View>
              
              {formData.diesel_purchases.map((purchase, index) => (
                <View key={index} style={styles.dieselPurchaseCard}>
                  <View style={styles.dieselPurchaseHeader}>
                    <Text style={styles.dieselPurchaseTitle}>Purchase {index + 1}</Text>
                    <TouchableOpacity
                      onPress={() => removeDieselPurchase(index)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="close-circle" size={20} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.dieselPurchaseRow}>
                    <EnhancedCustomInput
                      label="State"
                      value={purchase.state}
                      onChangeText={(text) => updateDieselPurchase(index, 'state', text)}
                      placeholder="Enter state"
                      style={styles.dieselInput}
                    />
                    <EnhancedCustomInput
                      label="City"
                      value={purchase.city}
                      onChangeText={(text) => updateDieselPurchase(index, 'city', text)}
                      placeholder="Enter city"
                      style={styles.dieselInput}
                    />
                  </View>
                  
                  <View style={styles.dieselPurchaseRow}>
                    <EnhancedCustomInput
                      label="Quantity (L)"
                      value={purchase.diesel_quantity.toString()}
                      onChangeText={(text) => updateDieselPurchase(index, 'diesel_quantity', parseFloat(text) || 0)}
                      keyboardType="numeric"
                      placeholder="Enter quantity"
                      style={styles.dieselInput}
                    />
                    <EnhancedCustomInput
                      label="Price/Liter"
                      value={purchase.diesel_price_per_liter.toString()}
                      onChangeText={(text) => updateDieselPurchase(index, 'diesel_price_per_liter', parseFloat(text) || 0)}
                      keyboardType="numeric"
                      placeholder="Enter price"
                      style={styles.dieselInput}
                    />
                  </View>
                </View>
              ))}
            </View>

            {/* Cost Sections */}
            <CostSection
              title="Fast Tag"
              icon="card"
              color={COLORS.info}
              costs={formData.fast_tag_costs}
              onUpdate={(costs) => setFormData(prev => ({ ...prev, fast_tag_costs: costs }))}
            />

            <CostSection
              title="MCD"
              icon="business"
              color={COLORS.warning}
              costs={formData.mcd_costs}
              onUpdate={(costs) => setFormData(prev => ({ ...prev, mcd_costs: costs }))}
            />

            <CostSection
              title="Green Tax"
              icon="leaf"
              color={COLORS.success}
              costs={formData.green_tax_costs}
              onUpdate={(costs) => setFormData(prev => ({ ...prev, green_tax_costs: costs }))}
            />

            <ComplexCostSection
              title="RTO"
              icon="document-text"
              color={COLORS.primary}
              costs={formData.rto_costs}
              onUpdate={(costs) => setFormData(prev => ({ ...prev, rto_costs: costs }))}
            />

            <ComplexCostSection
              title="DTO"
              icon="receipt"
              color={COLORS.secondary}
              costs={formData.dto_costs}
              onUpdate={(costs) => setFormData(prev => ({ ...prev, dto_costs: costs }))}
            />

            <ComplexCostSection
              title="Border"
              icon="flag"
              color={COLORS.warning}
              costs={formData.border_costs}
              onUpdate={(costs) => setFormData(prev => ({ ...prev, border_costs: costs }))}
            />

            <ComplexCostSection
              title="Municipalities"
              icon="business"
              color={COLORS.accent}
              costs={formData.municipalities_costs}
              onUpdate={(costs) => setFormData(prev => ({ ...prev, municipalities_costs: costs }))}
            />

            {/* Repair Cost */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Costs</Text>
              <EnhancedCustomInput
                label="Repair Cost"
                value={(formData.repair_cost || 0).toString()}
                onChangeText={(text) => setFormData(prev => ({ ...prev, repair_cost: parseFloat(text) || 0 }))}
                leftIcon="construct"
                keyboardType="numeric"
                placeholder="Enter repair cost"
              />
            </View>

            {/* Submit Button */}
            <EnhancedCustomButton
              title="Create Trip"
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
    marginBottom: SIZES.spacingLg,
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
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.spacingLg,
    marginBottom: SIZES.spacingMd,
  },
  dieselPurchaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacingMd,
  },
  dieselPurchaseTitle: {
    fontSize: SIZES.fontSizeMd,
    fontWeight: '600' as const,
    color: COLORS.textPrimary,
  },
  removeButton: {
    padding: SIZES.spacingXs,
  },
  dieselPurchaseRow: {
    flexDirection: 'row',
    gap: SIZES.spacingMd,
  },
  dieselInput: {
    flex: 1,
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
  },
  addCostButton: {
    marginTop: SIZES.spacingMd,
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
});

export default EnhancedAddTripScreen;
