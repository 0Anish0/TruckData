import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { DieselPurchaseFormData, DieselPurchaseFormErrors, INDIAN_STATES } from '../types';
import CustomInput from './CustomInput';

interface DieselPurchaseFormProps {
  purchase: DieselPurchaseFormData;
  errors: DieselPurchaseFormErrors;
  onUpdate: (purchase: DieselPurchaseFormData) => void;
  onRemove: () => void;
  index: number;
  canRemove: boolean;
}

const DieselPurchaseForm: React.FC<DieselPurchaseFormProps> = ({
  purchase,
  errors,
  onUpdate,
  onRemove,
  index,
  canRemove,
}) => {
  const [showStatePicker, setShowStatePicker] = useState(false);

  const updateField = (field: keyof DieselPurchaseFormData, value: string | number) => {
    onUpdate({
      ...purchase,
      [field]: value,
    });
  };

  const selectState = (state: string) => {
    updateField('state', state);
    setShowStatePicker(false);
  };

  const calculateCost = () => {
    return purchase.diesel_quantity * purchase.diesel_price_per_liter;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Diesel Purchase #{index + 1}</Text>
        {canRemove && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => {
              Alert.alert(
                'Remove Purchase',
                'Are you sure you want to remove this diesel purchase?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Remove', style: 'destructive', onPress: onRemove },
                ]
              );
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        )}
      </View>

      {/* State Selection */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>State *</Text>
        <TouchableOpacity
          style={[styles.picker, errors.state && styles.pickerError]}
          onPress={() => setShowStatePicker(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.pickerText, !purchase.state && styles.placeholderText]}>
            {purchase.state || 'Select State'}
          </Text>
          <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
        {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
      </View>

      {/* State Picker Modal */}
      <Modal
        visible={showStatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowStatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.statePickerHeader}>
              <Text style={styles.statePickerTitle}>Select State</Text>
              <TouchableOpacity
                onPress={() => setShowStatePicker(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.stateList} showsVerticalScrollIndicator={true}>
              {INDIAN_STATES.map((state) => (
                <TouchableOpacity
                  key={state}
                  style={[
                    styles.stateOption,
                    purchase.state === state && styles.stateOptionSelected,
                  ]}
                  onPress={() => selectState(state)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.stateOptionText,
                      purchase.state === state && styles.stateOptionTextSelected,
                    ]}
                  >
                    {state}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* City */}
      <CustomInput
        label="City"
        placeholder="e.g., Mumbai"
        value={purchase.city}
        onChangeText={(text) => updateField('city', text)}
        error={errors.city}
      />

      {/* Quantity and Price Row */}
      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <CustomInput
            label="Quantity (Liters) *"
            placeholder="0"
            value={purchase.diesel_quantity.toString()}
            onChangeText={(text) => updateField('diesel_quantity', parseFloat(text) || 0)}
            keyboardType="numeric"
            error={errors.diesel_quantity}
          />
        </View>
        <View style={styles.halfWidth}>
          <CustomInput
            label="Price per Liter (₹) *"
            placeholder="0"
            value={purchase.diesel_price_per_liter.toString()}
            onChangeText={(text) => updateField('diesel_price_per_liter', parseFloat(text) || 0)}
            keyboardType="numeric"
            error={errors.diesel_price_per_liter}
          />
        </View>
      </View>

      {/* Purchase Date */}
      <CustomInput
        label="Purchase Date *"
        placeholder="YYYY-MM-DD"
        value={purchase.purchase_date}
        onChangeText={(text) => updateField('purchase_date', text)}
        error={errors.purchase_date}
      />

      {/* Cost Display */}
      <View style={styles.costContainer}>
        <Text style={styles.costLabel}>Total Cost:</Text>
        <Text style={styles.costValue}>₹{calculateCost().toLocaleString('en-IN')}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.spacingLg,
    marginBottom: SIZES.spacingLg,
    ...SIZES.shadowSubtle,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacingLg,
  },
  title: {
    fontSize: SIZES.fontSizeLg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  removeButton: {
    padding: SIZES.spacingSm,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.error,
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
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.spacingMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.background,
  },
  pickerError: {
    borderColor: COLORS.error,
  },
  pickerText: {
    fontSize: SIZES.fontSizeMd,
    color: COLORS.textPrimary,
  },
  placeholderText: {
    color: COLORS.textSecondary,
  },
  modalOverlay: {
    flex: 1,
        backgroundColor: COLORS.overlayStrong,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.spacingLg,
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  statePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.spacingLg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  statePickerTitle: {
    fontSize: SIZES.fontSizeLg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: SIZES.spacingSm,
  },
  stateList: {
    backgroundColor: COLORS.surface,
    maxHeight: 300,
    minHeight: 200,
  },
  stateOption: {
    padding: SIZES.spacingMd,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  stateOptionSelected: {
    backgroundColor: COLORS.primaryLight,
  },
  stateOptionText: {
    fontSize: SIZES.fontSizeMd,
    color: COLORS.textPrimary,
  },
  stateOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: SIZES.spacingMd,
  },
  halfWidth: {
    flex: 1,
  },
  costContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.spacingMd,
    backgroundColor: COLORS.primaryLight,
    borderRadius: SIZES.radius,
    marginTop: SIZES.spacingMd,
  },
  costLabel: {
    fontSize: SIZES.fontSizeMd,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  costValue: {
    fontSize: SIZES.fontSizeLg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  errorText: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.error,
    marginTop: SIZES.spacingXs,
    fontWeight: '500',
  },
});

export default DieselPurchaseForm;
