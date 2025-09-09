import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SIZES } from '../constants/theme';
import CustomInput from './CustomInput';
import CustomButton from './CustomButton';

interface Props {
  title: string; // e.g., "Fast Tag Cost (₹)"
  items: number[];
  onAdd: () => void;
  onUpdate: (index: number, value: number) => void;
  onRemove: (index: number) => void;
}

const AmountList: React.FC<Props> = ({ title, items, onAdd, onUpdate, onRemove }) => {
  return (
    <View style={styles.container}>
      {items.map((amount, index) => (
        <View key={index} style={styles.item}>
          <CustomInput
            label={`#${index + 2} ${title}`}
            placeholder="0"
            keyboardType="numeric"
            value={(amount || 0).toString()}
            onChangeText={(text) => onUpdate(index, parseFloat(text) || 0)}
          />
          <View style={styles.actions}>
            <CustomButton title="Remove" onPress={() => onRemove(index)} variant="outline" size="small" />
          </View>
        </View>
      ))}
      <CustomButton title="Add" onPress={onAdd} variant="outline" size="small" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: SIZES.spacingSm,
    marginBottom: SIZES.spacingMd,
  },
  item: {
    marginBottom: SIZES.spacingSm,
  },
  actions: {
    marginTop: SIZES.spacingSm,
    alignItems: 'flex-start',
  },
});

export default AmountList;


