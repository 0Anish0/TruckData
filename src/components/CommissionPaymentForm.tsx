import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import CustomInput from './CustomInput';
import CustomButton from './CustomButton';
import { CommissionItemFormData, AuthorityType } from '../types';

interface Props {
  item: CommissionItemFormData;
  index: number;
  canRemove: boolean;
  errors?: Partial<Record<keyof CommissionItemFormData, string>>;
  onUpdate: (updated: CommissionItemFormData) => void;
  onRemove: () => void;
}

const CommissionPaymentForm: React.FC<Props> = ({ item, index, canRemove, errors = {}, onUpdate, onRemove }) => {
  const update = (field: keyof CommissionItemFormData, value: string | number) => {
    onUpdate({ ...item, [field]: value });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Payment #{index + 1}</Text>
        {canRemove && (
          <CustomButton title="Remove" onPress={onRemove} variant="outline" size="small" />
        )}
      </View>

      <CustomInput
        label="Authority Type (RTO/DTO/Municipalities/State Border)"
        placeholder="RTO"
        value={item.authority_type}
        onChangeText={(text) => update('authority_type', text as AuthorityType)}
        error={errors.authority_type}
      />

      <CustomInput
        label="State"
        placeholder="e.g., Uttar Pradesh"
        value={item.state}
        onChangeText={(text) => update('state', text)}
        error={errors.state}
      />

      <CustomInput
        label="Amount (₹)"
        placeholder="0"
        keyboardType="numeric"
        value={(item.amount || 0).toString()}
        onChangeText={(text) => update('amount', parseFloat(text) || 0)}
        error={errors.amount as any}
      />

      <CustomInput
        label="Checkpoint (optional)"
        placeholder="e.g., Kanpur Toll Area"
        value={item.checkpoint || ''}
        onChangeText={(text) => update('checkpoint', text)}
      />

      <CustomInput
        label="Notes (optional)"
        placeholder="Additional details"
        value={item.notes || ''}
        onChangeText={(text) => update('notes', text)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.spacingLg,
    backgroundColor: COLORS.surface,
    marginBottom: SIZES.spacingLg,
    ...SIZES.shadowSubtle,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.spacingMd,
  },
  title: {
    fontSize: SIZES.fontSizeMd,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
});

export default CommissionPaymentForm;


