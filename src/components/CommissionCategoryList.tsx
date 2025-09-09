import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import CustomInput from './CustomInput';
import CustomButton from './CustomButton';
import { CommissionItemFormData, AuthorityType } from '../types';

interface Props {
  title?: string; // optional; we'll render compact lists under inputs
  authorityType: AuthorityType;
  items: CommissionItemFormData[];
  onAdd: () => void;
  onUpdate: (index: number, updated: CommissionItemFormData) => void;
  onRemove: (index: number) => void;
  startFrom?: number; // numbering start (defaults to 1)
}

const CommissionCategoryList: React.FC<Props> = ({ authorityType, items, onAdd, onUpdate, onRemove, startFrom = 1 }) => {
  return (
    <View style={styles.containerCompact}>
      {items.map((item, index) => (
        <View key={index} style={styles.stackRow}>
          <CustomInput
            label={`#${startFrom + index} ${authorityType} Cost (₹)` as any}
            placeholder="0"
            keyboardType="numeric"
            value={(item.amount || 0).toString()}
            onChangeText={(text) => onUpdate(index, { ...item, authority_type: authorityType, amount: parseFloat(text) || 0 })}
          />
          <View style={styles.inlineActions}>
            <CustomButton title="Remove" onPress={() => onRemove(index)} variant="outline" size="small" />
          </View>
        </View>
      ))}

      <CustomButton title="Add" onPress={onAdd} variant="outline" size="small" />
    </View>
  );
};

const styles = StyleSheet.create({
  containerCompact: {
    gap: SIZES.spacingSm,
    marginBottom: SIZES.spacingMd,
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
  stackRow: {
    marginBottom: SIZES.spacingSm,
  },
  inlineActions: {
    marginTop: SIZES.spacingSm,
    alignItems: 'flex-start',
  },
});

export default CommissionCategoryList;