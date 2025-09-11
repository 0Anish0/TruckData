import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { mockTruckService, mockTripService } from '../services/mockService';
import { COLORS, SIZES, ANIMATIONS } from '../constants/theme';
import EnhancedTruckCard from '../components/EnhancedTruckCard';
import EnhancedCustomButton from '../components/EnhancedCustomButton';
import { Truck, Trip } from '../types';

const EnhancedTrucksScreen: React.FC = () => {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Animate content when data loads
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
  }, [loading]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [trucksData, tripsData] = await Promise.all([
        mockTruckService.getTrucks(),
        mockTripService.getTrips(),
      ]);

      setTrucks(trucksData);
      setTrips(tripsData);
    } catch (error) {
      console.error('Error loading trucks data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getTruckStats = (truckId: string) => {
    const truckTrips = trips.filter(trip => trip.truck_id === truckId);
    const totalTrips = truckTrips.length;
    const totalCost = truckTrips.reduce((sum, trip) => sum + (trip.total_cost || 0), 0);
    
    return { totalTrips, totalCost };
  };

  const getSortedTrucks = () => {
    const trucksWithStats = trucks.map(truck => ({
      ...truck,
      ...getTruckStats(truck.id),
    }));
    // Default sort by name
    return trucksWithStats.sort((a, b) => a.name.localeCompare(b.name));
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getTotalStats = () => {
    const totalTrucks = trucks.length;
    const totalTrips = trips.length;
    const totalCost = trips.reduce((sum, trip) => sum + (trip.total_cost || 0), 0);
    const avgCostPerTruck = totalTrucks > 0 ? totalCost / totalTrucks : 0;

    return { totalTrucks, totalTrips, totalCost, avgCostPerTruck };
  };

  const SortButton: React.FC<{
    title: string;
    isActive: boolean;
    onPress: () => void;
    icon: keyof typeof Ionicons.glyphMap;
  }> = ({ title, isActive, onPress, icon }) => (
    <TouchableOpacity
      style={[styles.sortButton, isActive && styles.sortButtonActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={icon}
        size={16}
        color={isActive ? COLORS.textInverse : COLORS.secondary}
      />
      <Text
        style={[
          styles.sortButtonText,
          isActive && styles.sortButtonTextActive,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const StatCard: React.FC<{
    title: string;
    value: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
  }> = ({ title, value, icon, color }) => (
    <Animated.View
      style={[
        styles.statCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </Animated.View>
  );

  const renderTruckItem = ({ item, index }: { item: Truck & { totalTrips: number; totalCost: number }; index: number }) => (
    <EnhancedTruckCard
      truck={item}
      onPress={() => {}}
      onEdit={() => {}}
      onDelete={() => {}}
      index={index}
      tripCount={item.totalTrips}
      totalCost={item.totalCost}
    />
  );

  const stats = getTotalStats();
  const sortedTrucks = getSortedTrucks();

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Trucks...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sticky Header */}
      <LinearGradient
        colors={COLORS.secondaryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Fleet Management</Text>
            <Text style={styles.headerSubtitle}>
              Manage your truck fleet efficiently
            </Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="car-sport" size={28} color={COLORS.textInverse} />
          </View>
        </View>
      </LinearGradient>

      {/* Make entire screen scrollable using FlatList as root */}
      <FlatList
        data={sortedTrucks}
        renderItem={renderTruckItem}
        keyExtractor={(item) => item.id}
        style={styles.content}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.secondary]}
            tintColor={COLORS.secondary}
          />
        }
        ListHeaderComponent={
          <View>
            {/* Stats Cards */}
            <View style={styles.statsContainer}>
              <StatCard
                title="Total Trucks"
                value={stats.totalTrucks.toString()}
                icon="car-sport"
                color={COLORS.secondary}
              />
              <StatCard
                title="Total Trips"
                value={stats.totalTrips.toString()}
                icon="trending-up"
                color={COLORS.info}
              />
            </View>

            {/* Sort controls removed as requested */}

            {/* Add Truck Button */}
            <View style={styles.addButtonContainer}>
              <EnhancedCustomButton
                title="Add New Truck"
                onPress={() => {}}
                icon="add-circle"
                variant="secondary"
                size="large"
                fullWidth
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="car-outline" size={64} color={COLORS.textTertiary} />
            <Text style={styles.emptyTitle}>No Trucks Found</Text>
            <Text style={styles.emptySubtitle}>
              Start by adding your first truck to the fleet
            </Text>
            <EnhancedCustomButton
              title="Add Truck"
              onPress={() => {}}
              icon="add-circle"
              variant="outline"
              size="medium"
              style={styles.emptyButton}
            />
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: SIZES.fontSizeLg,
    color: COLORS.textSecondary,
    fontWeight: '600' as const,
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
  headerText: {
    flex: 1,
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
  content: {
    flex: 1,
    marginTop: 140, // Add margin to account for sticky header height
    paddingHorizontal: SIZES.spacingLg,
    paddingTop: SIZES.spacingSm,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    marginTop: SIZES.spacingLg,
    marginBottom: SIZES.spacingXl,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '49%',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.spacingLg,
    marginBottom: SIZES.spacingMd,
    alignItems: 'center',
    ...SIZES.shadow,
    minHeight: 120,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.spacingSm,
  },
  statValue: {
    fontSize: SIZES.fontSizeLg,
    fontWeight: '800' as const,
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacingXs,
  },
  statTitle: {
    fontSize: SIZES.fontSizeXs,
    color: COLORS.textSecondary,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  sortContainer: {
    flexDirection: 'row',
    marginBottom: SIZES.spacingLg,
    gap: SIZES.spacingSm,
  },
  sortButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.spacingMd,
    paddingHorizontal: SIZES.spacingLg,
    borderRadius: SIZES.radiusMd,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.surface,
  },
  sortButtonActive: {
    backgroundColor: COLORS.secondary,
  },
  sortButtonText: {
    fontSize: SIZES.fontSizeSm,
    fontWeight: '600' as const,
    color: COLORS.secondary,
    marginLeft: SIZES.spacingXs,
  },
  sortButtonTextActive: {
    color: COLORS.textInverse,
  },
  addButtonContainer: {
    marginBottom: SIZES.spacingLg,
  },
  listContainer: {
    paddingBottom: SIZES.spacingXl,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.spacingXxl,
  },
  emptyTitle: {
    fontSize: SIZES.fontSizeXl,
    fontWeight: '700' as const,
    color: COLORS.textPrimary,
    marginTop: SIZES.spacingLg,
    marginBottom: SIZES.spacingSm,
  },
  emptySubtitle: {
    fontSize: SIZES.fontSizeMd,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.spacingXl,
    lineHeight: 22,
  },
  emptyButton: {
    marginTop: SIZES.spacingMd,
  },
});

export default EnhancedTrucksScreen;
