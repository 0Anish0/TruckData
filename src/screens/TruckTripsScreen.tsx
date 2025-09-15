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
import { tripService } from '../services/tripService';
import { COLORS, SIZES, ANIMATIONS } from '../constants/theme';
import TripCard from '../components/TripCard';
import CustomButton from '../components/CustomButton';
import { Trip, Truck, TruckTripsScreenProps, TripWithRelations } from '../types';
import { useNavigation } from '@react-navigation/native';
import { AddTripScreenNavigationProp } from '../types/navigation';

const TruckTripsScreen: React.FC<TruckTripsScreenProps> = ({ route }) => {
  const navigation = useNavigation<AddTripScreenNavigationProp>();
  const { truck } = route.params;
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'recent' | 'high-cost'>('all');

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
      const tripsData = await tripService.getTripsByTruck(truck.id);
      setTrips(tripsData as Trip[]);
    } catch (error) {
      console.error('Error loading truck trips data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getFilteredTrips = () => {
    switch (filter) {
      case 'recent':
        return trips
          .sort((a, b) => new Date(b.trip_date).getTime() - new Date(a.trip_date).getTime())
          .slice(0, 10);
      case 'high-cost':
        return trips
          .sort((a, b) => (b.total_cost || 0) - (a.total_cost || 0))
          .slice(0, 10);
      default:
        return trips;
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getTruckStats = () => {
    const totalTrips = trips.length;
    const totalCost = trips.reduce((sum, trip) => sum + (trip.total_cost || 0), 0);
    const avgCost = totalTrips > 0 ? totalCost / totalTrips : 0;
    const totalDiesel = trips.reduce((sum, trip) => {
      const purchases = trip.diesel_purchases || [];
      return sum + purchases.reduce((pSum, purchase) => pSum + (purchase.diesel_quantity || 0), 0);
    }, 0);

    return { totalTrips, totalCost, avgCost, totalDiesel };
  };

  const FilterButton: React.FC<{
    title: string;
    isActive: boolean;
    onPress: () => void;
    icon: keyof typeof Ionicons.glyphMap;
  }> = ({ title, isActive, onPress, icon }) => (
    <TouchableOpacity
      style={[styles.filterButton, isActive && styles.filterButtonActive]}
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
          styles.filterButtonText,
          isActive && styles.filterButtonTextActive,
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

  const renderTripItem = ({ item, index }: { item: Trip; index: number }) => (
    <TripCard
      trip={item}
      truckName={truck.name}
      onPress={() => { }}
      onEdit={() => navigation.navigate('AddTrip', { trip: item as TripWithRelations })}
      onDelete={() => { }}
      index={index}
    />
  );

  const stats = getTruckStats();
  const filteredTrips = getFilteredTrips();

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Trips...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={COLORS.secondaryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{truck.name}</Text>
            <Text style={styles.headerSubtitle}>
              {truck.truck_number} • {truck.model}
            </Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="car-sport" size={28} color={COLORS.textInverse} />
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Total Trips"
            value={stats.totalTrips.toString()}
            icon="trending-up"
            color={COLORS.secondary}
          />
          <StatCard
            title="Total Cost"
            value={formatCurrency(stats.totalCost)}
            icon="wallet"
            color={COLORS.success}
          />
          <StatCard
            title="Avg. Cost"
            value={formatCurrency(stats.avgCost)}
            icon="analytics"
            color={COLORS.warning}
          />
          <StatCard
            title="Diesel Used"
            value={`${stats.totalDiesel}L`}
            icon="car"
            color={COLORS.fuel}
          />
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <FilterButton
            title="All Trips"
            isActive={filter === 'all'}
            onPress={() => setFilter('all')}
            icon="list"
          />
          <FilterButton
            title="Recent"
            isActive={filter === 'recent'}
            onPress={() => setFilter('recent')}
            icon="time"
          />
          <FilterButton
            title="High Cost"
            isActive={filter === 'high-cost'}
            onPress={() => setFilter('high-cost')}
            icon="trending-up"
          />
        </View>

        {/* Add Trip Button */}
        <View style={styles.addButtonContainer}>
          <CustomButton
            title="Add New Trip"
            onPress={() => { }}
            icon="add-circle"
            variant="secondary"
            size="large"
            fullWidth
          />
        </View>

        {/* Trips List */}
        <FlatList
          data={filteredTrips}
          renderItem={renderTripItem}
          keyExtractor={(item) => item.id}
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
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="car-outline" size={64} color={COLORS.textTertiary} />
              <Text style={styles.emptyTitle}>No Trips Found</Text>
              <Text style={styles.emptySubtitle}>
                {filter === 'all'
                  ? `No trips recorded for ${truck.name}`
                  : `No trips match the "${filter}" filter`}
              </Text>
              <CustomButton
                title="Add Trip"
                onPress={() => { }}
                icon="add-circle"
                variant="outline"
                size="medium"
                style={styles.emptyButton}
              />
            </View>
          }
        />
      </View>
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
    flexWrap: 'wrap',
    marginTop: SIZES.spacingLg,
    marginBottom: SIZES.spacingXl,
    justifyContent: 'space-between',
    gap: SIZES.spacingMd,
  },
  statCard: {
    width: '48%',
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
  filterContainer: {
    flexDirection: 'row',
    marginBottom: SIZES.spacingLg,
    gap: SIZES.spacingSm,
  },
  filterButton: {
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
  filterButtonActive: {
    backgroundColor: COLORS.secondary,
  },
  filterButtonText: {
    fontSize: SIZES.fontSizeSm,
    fontWeight: '600' as const,
    color: COLORS.secondary,
    marginLeft: SIZES.spacingXs,
  },
  filterButtonTextActive: {
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

export default TruckTripsScreen;
