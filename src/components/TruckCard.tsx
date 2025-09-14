import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, ANIMATIONS } from '../constants/theme';
import { EnhancedTruckCardProps } from '../types';

const EnhancedTruckCard: React.FC<EnhancedTruckCardProps> = ({
  truck,
  onPress,
  onEdit,
  onDelete,
  index = 0,
  tripCount = 0,
  totalCost = 0,
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

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
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
          colors={COLORS.secondaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <View style={styles.truckInfo}>
            <View style={styles.truckIconContainer}>
              <Ionicons name="car-sport" size={24} color={COLORS.textInverse} />
            </View>
            <View style={styles.truckDetails}>
              <Text style={styles.truckName}>{truck.name}</Text>
              <Text style={styles.truckNumber}>{truck.truck_number}</Text>
              <View style={styles.statusContainer}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Active</Text>
              </View>
            </View>
          </View>
          <View style={styles.headerActions}>
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
        </LinearGradient>

        {/* Content */}
        <View style={styles.content}>
          {/* Model Information */}
          <View style={styles.modelSection}>
            <View style={styles.modelHeader}>
              <Ionicons name="construct" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Model</Text>
            </View>
            <Text style={styles.modelText}>{truck.model}</Text>
          </View>

          {/* Statistics */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: COLORS.info + '20' }]}>
                <Ionicons name="trending-up" size={16} color={COLORS.info} />
              </View>
              <Text style={styles.statLabel}>Trips</Text>
              <Text style={styles.statValue}>{tripCount}</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: COLORS.success + '20' }]}>
                <Ionicons name="wallet" size={16} color={COLORS.success} />
              </View>
              <Text style={styles.statLabel}>Total Cost</Text>
              <Text style={styles.statValue}>{formatCurrency(totalCost)}</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: COLORS.warning + '20' }]}>
                <Ionicons name="analytics" size={16} color={COLORS.warning} />
              </View>
              <Text style={styles.statLabel}>Avg. Cost</Text>
              <Text style={styles.statValue}>
                {tripCount > 0 ? formatCurrency(Math.round(totalCost / tripCount)) : '₹0'}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer with action hint */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <Ionicons name="eye" size={16} color={COLORS.textTertiary} />
            <Text style={styles.footerText}>Tap to view trips</Text>
          </View>
        </View>
      </TouchableOpacity>

    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  truckInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  truckIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.spacingMd,
  },
  truckDetails: {
    flex: 1,
  },
  truckName: {
    fontSize: SIZES.fontSizeLg,
    fontWeight: '700',
    color: COLORS.textInverse,
    marginBottom: SIZES.spacingXs,
  },
  truckNumber: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.textInverse,
    opacity: 0.9,
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SIZES.spacingSm,
    paddingVertical: SIZES.spacingXs,
    borderRadius: SIZES.radius,
    marginTop: SIZES.spacingXs,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: SIZES.spacingXs,
  },
  statusText: {
    fontSize: SIZES.fontSizeXs,
    color: COLORS.textInverse,
    fontWeight: '600',
  },
  content: {
    padding: SIZES.spacingLg,
  },
  modelSection: {
    marginBottom: SIZES.spacingLg,
  },
  modelHeader: {
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
  modelText: {
    fontSize: SIZES.fontSizeLg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SIZES.spacingXs,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.spacingXs,
  },
  statLabel: {
    fontSize: SIZES.fontSizeXs,
    color: COLORS.textTertiary,
    fontWeight: '600',
    marginBottom: SIZES.spacingXs,
    textAlign: 'center',
  },
  statValue: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: SIZES.spacingLg,
    paddingBottom: SIZES.spacingLg,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.spacingSm,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: SIZES.radius,
  },
  footerText: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.textTertiary,
    fontWeight: '500',
    marginLeft: SIZES.spacingXs,
  },
  headerActions: {
    position: 'absolute',
    top: SIZES.spacingLg,
    right: SIZES.spacingLg,
    flexDirection: 'row',
    gap: SIZES.spacingSm,
    zIndex: 10,
  },
  actions: {
    position: 'absolute',
    top: SIZES.spacingLg,
    right: SIZES.spacingLg,
    flexDirection: 'row',
    gap: SIZES.spacingSm,
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

export default EnhancedTruckCard;
