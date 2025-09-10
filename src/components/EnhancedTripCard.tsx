import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, ANIMATIONS } from '../constants/theme';
import { Trip, TripWithRelations } from '../types';

interface EnhancedTripCardProps {
  trip: Trip | TripWithRelations;
  truckName: string;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  index?: number;
}

const EnhancedTripCard: React.FC<EnhancedTripCardProps> = ({
  trip,
  truckName,
  onPress,
  onEdit,
  onDelete,
  index = 0,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Staggered animation for multiple cards
    const delay = index * 100;
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: ANIMATIONS.normal,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        delay,
        useNativeDriver: true,
        ...ANIMATIONS.springGentle,
      }),
    ]).start();
  }, [index]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      ...ANIMATIONS.springBouncy,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...ANIMATIONS.springBouncy,
    }).start();
  };

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
    if (onEdit) {
      onEdit();
    }
  };

  const handleDeletePress = () => {
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.cardContent}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        {/* Header with gradient background */}
        <LinearGradient
          colors={COLORS.primaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <View style={styles.routeInfo}>
            <Text style={styles.route}>
              {trip.source} → {trip.destination}
            </Text>
            <Text style={styles.truckName}>{truckName}</Text>
            <View style={styles.dateContainer}>
              <Ionicons name="calendar" size={16} color={COLORS.textInverse} />
              <Text style={styles.dateText}>{formatDate(getTripDate())}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Content */}
        <View style={styles.content}>
          {/* Diesel Information */}
          <View style={styles.dieselSection}>
            <View style={styles.dieselHeader}>
              <Ionicons name="car" size={20} color={COLORS.fuel} />
              <Text style={styles.sectionTitle}>Diesel</Text>
            </View>
            <Text style={styles.dieselInfo}>
              {getTotalDieselQuantity()}L - {formatCurrency(getTotalDieselCost())}
            </Text>
            
            {/* Diesel Purchases Breakdown */}
            {getDieselPurchases().length > 0 && (
              <View style={styles.dieselPurchasesContainer}>
                {getDieselPurchases().map((purchase, index) => (
                  <View key={index} style={styles.dieselPurchaseItem}>
                    <View style={styles.dieselPurchaseDot} />
                    <Text style={styles.dieselPurchaseText}>
                      {purchase.state}{purchase.city ? `, ${purchase.city}` : ''}: {purchase.diesel_quantity}L @ {formatCurrency(purchase.diesel_price_per_liter)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Costs Grid */}
          <View style={styles.costsGrid}>
            <View style={styles.costItem}>
              <View style={[styles.costIcon, { backgroundColor: COLORS.info + '20' }]}>
                <Ionicons name="card" size={16} color={COLORS.info} />
              </View>
              <Text style={styles.costLabel}>Fast Tag</Text>
              <Text style={styles.costValue}>{formatCurrency(getFastTagCost())}</Text>
            </View>
            
            <View style={styles.costItem}>
              <View style={[styles.costIcon, { backgroundColor: COLORS.warning + '20' }]}>
                <Ionicons name="business" size={16} color={COLORS.warning} />
              </View>
              <Text style={styles.costLabel}>MCD</Text>
              <Text style={styles.costValue}>{formatCurrency(getMcdCost())}</Text>
            </View>
            
            <View style={styles.costItem}>
              <View style={[styles.costIcon, { backgroundColor: COLORS.success + '20' }]}>
                <Ionicons name="leaf" size={16} color={COLORS.success} />
              </View>
              <Text style={styles.costLabel}>Green Tax</Text>
              <Text style={styles.costValue}>{formatCurrency(getGreenTaxCost())}</Text>
            </View>
          </View>
        </View>

        {/* Total Cost Footer */}
        <LinearGradient
          colors={COLORS.accentGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.totalContainer}
        >
          <View style={styles.totalContent}>
            <Ionicons name="wallet" size={20} color={COLORS.textInverse} />
            <Text style={styles.totalLabel}>Total Cost</Text>
          </View>
          <Text style={styles.totalValue}>{formatCurrency(getTotalCost())}</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Action buttons */}
      {(onEdit || onDelete) && (
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.editButton]} 
              onPress={handleEditPress}
              activeOpacity={0.7}
            >
              <Ionicons name="pencil" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]} 
              onPress={handleDeletePress}
              activeOpacity={0.7}
            >
              <Ionicons name="trash" size={18} color={COLORS.error} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SIZES.spacingLg,
    marginBottom: SIZES.spacingMd,
    borderRadius: SIZES.radiusLg,
    ...SIZES.shadowMedium,
    position: 'relative',
    alignSelf: 'stretch',
  },
  cardContent: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
  },
  header: {
    padding: SIZES.spacingLg,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeInfo: {
    flex: 1,
    paddingRight: 80, // Add padding to prevent overlap with action buttons
  },
  route: {
    fontSize: SIZES.fontSizeLg,
    fontWeight: '700',
    color: COLORS.textInverse,
    marginBottom: SIZES.spacingXs,
  },
  truckName: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.textInverse,
    opacity: 0.9,
    fontWeight: '500',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SIZES.spacingSm,
    paddingVertical: SIZES.spacingXs,
    borderRadius: SIZES.radius,
    marginTop: SIZES.spacingSm,
    alignSelf: 'flex-start',
  },
  dateText: {
    fontSize: SIZES.fontSizeXs,
    color: COLORS.textInverse,
    marginLeft: SIZES.spacingXs,
    fontWeight: '600',
  },
  content: {
    padding: SIZES.spacingLg,
  },
  dieselSection: {
    marginBottom: SIZES.spacingLg,
  },
  dieselHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacingSm,
  },
  sectionTitle: {
    fontSize: SIZES.fontSizeMd,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: SIZES.spacingSm,
  },
  dieselInfo: {
    fontSize: SIZES.fontSizeLg,
    fontWeight: '700',
    color: COLORS.fuel,
    marginBottom: SIZES.spacingSm,
  },
  dieselPurchasesContainer: {
    marginTop: SIZES.spacingSm,
  },
  dieselPurchaseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacingXs,
  },
  dieselPurchaseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.fuel,
    marginRight: SIZES.spacingSm,
  },
  dieselPurchaseText: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  costsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.spacingLg,
  },
  costItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SIZES.spacingXs,
  },
  costIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.spacingXs,
  },
  costLabel: {
    fontSize: SIZES.fontSizeXs,
    color: COLORS.textTertiary,
    fontWeight: '600',
    marginBottom: SIZES.spacingXs,
    textAlign: 'center',
  },
  costValue: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  totalContainer: {
    padding: SIZES.spacingLg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: SIZES.fontSizeMd,
    color: COLORS.textInverse,
    fontWeight: '600',
    marginLeft: SIZES.spacingSm,
  },
  totalValue: {
    fontSize: SIZES.fontSizeXl,
    color: COLORS.textInverse,
    fontWeight: '800',
  },
  actions: {
    position: 'absolute',
    top: SIZES.spacingLg,
    right: SIZES.spacingLg,
    flexDirection: 'row',
    gap: SIZES.spacingSm,
    zIndex: 10,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...SIZES.shadow,
  },
  editButton: {
    backgroundColor: COLORS.surface,
  },
  deleteButton: {
    backgroundColor: COLORS.surface,
  },
});

export default EnhancedTripCard;
