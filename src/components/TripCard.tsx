import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { Trip, TripWithRelations } from '../types';

interface TripCardProps {
  trip: Trip | TripWithRelations; 
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
  const formatDate = (date: string | Date) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }
      return dateObj.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '₹0';
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Handle both data formats (raw database and transformed)
  const getTripDate = () => {
    return trip.trip_date;
  };

  const getDieselPurchases = () => {
    return trip.diesel_purchases || [];
  };

  const getTotalDieselQuantity = () => {
    const purchases = getDieselPurchases();
    return purchases.reduce((total, purchase) => total + (purchase.diesel_quantity || 0), 0);
  };

  const getTotalDieselCost = () => {
    const purchases = getDieselPurchases();
    return purchases.reduce((total, purchase) => 
      total + ((purchase.diesel_quantity || 0) * (purchase.diesel_price_per_liter || 0)), 0
    );
  };

  const getFastTagCost = () => {
    return trip.fast_tag_cost || 0;
  };

  const getMcdCost = () => {
    return trip.mcd_cost || 0;
  };

  const getGreenTaxCost = () => {
    return trip.green_tax_cost || 0;
  };

  const getTotalCost = () => {
    return trip.total_cost || 0;
  };

  const handleEditPress = () => {
    console.log('Edit button pressed for trip:', trip.id);
    if (onEdit) {
      onEdit();
    }
  };

  const handleDeletePress = () => {
    console.log('Delete button pressed for trip:', trip.id);
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.cardContent} onPress={onPress} activeOpacity={0.8}>
        <View style={styles.header}>
          <View style={styles.routeInfo}>
            <Text style={styles.route}>
              {trip.source} → {trip.destination}
            </Text>
            <Text style={styles.truckName}>{truckName}</Text>
          </View>
        </View>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>{formatDate(getTripDate())}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Diesel:</Text>
            <Text style={styles.detailValue}>
              {getTotalDieselQuantity()}L - {formatCurrency(getTotalDieselCost())}
            </Text>
          </View>

          {/* Diesel Purchases Breakdown */}
          {getDieselPurchases().length > 0 && (
            <View style={styles.dieselPurchasesContainer}>
              <Text style={styles.dieselPurchasesTitle}>Diesel Purchases:</Text>
              {getDieselPurchases().map((purchase, index) => (
                <View key={index} style={styles.dieselPurchaseItem}>
                  <Text style={styles.dieselPurchaseText}>
                    {purchase.state}{purchase.city ? `, ${purchase.city}` : ''}: {purchase.diesel_quantity}L @ {formatCurrency(purchase.diesel_price_per_liter)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.costsContainer}>
            <View style={styles.costItem}>
              <Text style={styles.costLabel}>Fast Tag</Text>
              <Text style={styles.costValue}>{formatCurrency(getFastTagCost())}</Text>
            </View>
            <View style={styles.costItem}>
              <Text style={styles.costLabel}>MCD</Text>
              <Text style={styles.costValue}>{formatCurrency(getMcdCost())}</Text>
            </View>
            <View style={styles.costItem}>
              <Text style={styles.costLabel}>Green Tax</Text>
              <Text style={styles.costValue}>{formatCurrency(getGreenTaxCost())}</Text>
            </View>
          </View>
        </View>

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Cost</Text>
          <Text style={styles.totalValue}>{formatCurrency(getTotalCost())}</Text>
        </View>
      </TouchableOpacity>

      {/* Action buttons outside the main touchable area */}
      <View style={styles.actions}>
        {onEdit && (
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleEditPress}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleDeletePress}
            activeOpacity={0.7}
          >
            <Ionicons name="trash" size={18} color={COLORS.error} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    marginHorizontal: SIZES.spacingLg,
    marginBottom: SIZES.spacingMd,
    ...SIZES.shadow,
    position: 'relative',
  },
  cardContent: {
    padding: SIZES.spacingLg,
  },
  header: {
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
    position: 'absolute',
    top: SIZES.spacingLg,
    right: SIZES.spacingLg,
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
    zIndex: 10,
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
  dieselPurchasesContainer: {
    marginTop: SIZES.spacingMd,
    paddingTop: SIZES.spacingMd,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  dieselPurchasesTitle: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: SIZES.spacingSm,
  },
  dieselPurchaseItem: {
    marginBottom: SIZES.spacingXs,
  },
  dieselPurchaseText: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
});

export default TripCard;
