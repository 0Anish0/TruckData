import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { Truck } from '../types';

interface TruckCardProps {
  truck: Truck;
  tripCount: number;
  totalCost: number;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const TruckCard: React.FC<TruckCardProps> = ({
  truck,
  tripCount,
  totalCost,
  onPress,
  onEdit,
  onDelete,
}) => {
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <View style={styles.truckInfo}>
          <Text style={styles.truckName}>{truck.name}</Text>
          <Text style={styles.truckNumber}>{truck.truck_number}</Text>
          <Text style={styles.truckModel}>{truck.model}</Text>
        </View>
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={(e) => {
                e.stopPropagation();
                console.log('Edit button pressed for truck:', truck.id);
                onEdit();
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="pencil" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={(e) => {
                e.stopPropagation();
                console.log('Delete button pressed for truck:', truck.id);
                onDelete();
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="trash" size={18} color={COLORS.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <View style={styles.statIconContainer}>
            <Ionicons name="car" size={22} color={COLORS.primary} />
          </View>
          <Text style={styles.statValue}>{tripCount}</Text>
          <Text style={styles.statLabel}>Trips</Text>
        </View>
        
        <View style={styles.statItem}>
          <View style={styles.statIconContainer}>
            <Ionicons name="wallet" size={22} color={COLORS.fuel} />
          </View>
          <Text style={styles.statValue}>{formatCurrency(totalCost)}</Text>
          <Text style={styles.statLabel}>Total Cost</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Tap to view trips
        </Text>
        <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.spacingLg,
    marginHorizontal: SIZES.spacingLg,
    marginBottom: SIZES.spacingMd,
    ...SIZES.shadow,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.spacingLg,
  },
  truckInfo: {
    flex: 1,
  },
  truckName: {
    fontSize: SIZES.fontSizeLg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacingXs,
  },
  truckNumber: {
    fontSize: SIZES.fontSizeMd,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: SIZES.spacingXs,
  },
  truckModel: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: SIZES.spacingSm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SIZES.spacingLg,
    paddingVertical: SIZES.spacingLg,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusLg,
    paddingHorizontal: SIZES.spacingMd,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.spacingSm,
    ...SIZES.shadowSubtle,
  },
  statValue: {
    fontSize: SIZES.fontSizeLg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacingXs,
  },
  statLabel: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SIZES.spacingMd,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  footerText: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
});

export default TruckCard;
