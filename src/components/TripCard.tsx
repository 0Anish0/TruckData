import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { Trip } from '../types';

interface TripCardProps {
  trip: Trip;
  truckName: string;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const TripCard: React.FC<TripCardProps> = ({
  trip,
  truckName,
  onPress,
  onEdit,
  onDelete,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '₹0';
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <View style={styles.routeInfo}>
          <Text style={styles.route}>
            {trip.source} → {trip.destination}
          </Text>
          <Text style={styles.truckName}>{truckName}</Text>
        </View>
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity style={styles.actionButton} onPress={onEdit} activeOpacity={0.7}>
              <Ionicons name="pencil" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity style={styles.actionButton} onPress={onDelete} activeOpacity={0.7}>
              <Ionicons name="trash" size={18} color={COLORS.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date:</Text>
          <Text style={styles.detailValue}>{formatDate(trip.trip_date)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Diesel:</Text>
          <Text style={styles.detailValue}>
            {trip.diesel_quantity || 0}L @ {formatCurrency(trip.diesel_price_per_liter)}
          </Text>
        </View>

        <View style={styles.costsContainer}>
          <View style={styles.costItem}>
            <Text style={styles.costLabel}>Fast Tag</Text>
            <Text style={styles.costValue}>{formatCurrency(trip.fast_tag_cost)}</Text>
          </View>
          <View style={styles.costItem}>
            <Text style={styles.costLabel}>MCD</Text>
            <Text style={styles.costValue}>{formatCurrency(trip.mcd_cost)}</Text>
          </View>
          <View style={styles.costItem}>
            <Text style={styles.costLabel}>Green Tax</Text>
            <Text style={styles.costValue}>{formatCurrency(trip.green_tax_cost)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total Cost</Text>
        <Text style={styles.totalValue}>{formatCurrency(trip.total_cost)}</Text>
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
  routeInfo: {
    flex: 1,
  },
  route: {
    fontSize: SIZES.fontSizeLg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacingXs,
  },
  truckName: {
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
  details: {
    marginBottom: SIZES.spacingLg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.spacingSm,
  },
  detailLabel: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  costsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.spacingMd,
    paddingTop: SIZES.spacingMd,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  costItem: {
    alignItems: 'center',
    flex: 1,
  },
  costLabel: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.textTertiary,
    marginBottom: SIZES.spacingXs,
    fontWeight: '500',
  },
  costValue: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SIZES.spacingLg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalLabel: {
    fontSize: SIZES.fontSizeMd,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: SIZES.fontSizeLg,
    color: COLORS.primary,
    fontWeight: '700',
  },
});

export default TripCard;
