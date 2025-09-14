import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Animated,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { mockTripService, mockTruckService } from '../services/mockService';
import { COLORS, SIZES, ANIMATIONS } from '../constants/theme';
import EnhancedTripCard from '../components/EnhancedTripCard';
import EnhancedCustomButton from '../components/EnhancedCustomButton';
import { Trip, Truck, TripsScreenNavigationProp, TripWithRelations } from '../types';
const { width } = Dimensions.get('window');

interface EnhancedTripsScreenProps {
  navigation: TripsScreenNavigationProp;
}

const EnhancedTripsScreen: React.FC<EnhancedTripsScreenProps> = ({ navigation }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);

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
      
      const [tripsData, trucksData] = await Promise.all([
        mockTripService.getTrips(),
        mockTruckService.getTrucks(),
      ]);

      setTrips(tripsData);
      setTrucks(trucksData);
    } catch (error) {
      console.error('Error loading trips data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getTruckName = (truckId: string) => {
    const truck = trucks.find(t => t.id === truckId);
    return truck?.name || 'Unknown Truck';
  };

  const getFilteredTrips = () => {
    if (!selectedTruckId) {
      return trips;
    }
    return trips.filter(trip => trip.truck_id === selectedTruckId);
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getTotalStats = () => {
    const totalTrips = trips.length;
    const totalCost = trips.reduce((sum, trip) => sum + (trip.total_cost || 0), 0);
    const avgCost = totalTrips > 0 ? totalCost / totalTrips : 0;

    return { totalTrips, totalCost, avgCost };
  };

  const TruckFilterButton: React.FC<{
    truck: Truck;
    isActive: boolean;
    onPress: () => void;
  }> = ({ truck, isActive, onPress }) => (
    <TouchableOpacity
      style={[styles.truckFilterButton, isActive && styles.truckFilterButtonActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons
        name="car-sport"
        size={16}
        color={isActive ? COLORS.textInverse : COLORS.primary}
      />
      <Text
        style={[
          styles.truckFilterButtonText,
          isActive && styles.truckFilterButtonTextActive,
        ]}
        numberOfLines={1}
      >
        {truck.name}
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
    <EnhancedTripCard
      trip={item}
      truckName={getTruckName(item.truck_id)}
      onPress={() => {}}
      onEdit={() => navigation.navigate('AddTrip', { trip: item as TripWithRelations })}
      onDelete={() => {}}
      index={index}
    />
  );

  const stats = getTotalStats();
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
      {/* Sticky Header */}
      <LinearGradient
        colors={COLORS.primaryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Trip Management</Text>
            <Text style={styles.headerSubtitle}>
              Track and manage all your trips
            </Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="list" size={28} color={COLORS.textInverse} />
          </View>
        </View>
      </LinearGradient>

      {/* Make entire screen scrollable using FlatList as root */}
      <FlatList
        data={filteredTrips}
        renderItem={renderTripItem}
        keyExtractor={(item) => item.id}
        style={styles.content}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListHeaderComponent={
          <View>
            {/* Stats Cards */}
            <View style={styles.statsContainer}>
              <StatCard
                title="Total Trips"
                value={stats.totalTrips.toString()}
                icon="trending-up"
                color={COLORS.info}
              />
              <StatCard
                title="Total Cost"
                value={formatCurrency(stats.totalCost)}
                icon="wallet"
                color={COLORS.success}
              />
            </View>

            {/* Truck Filter */}
            <View style={styles.filterContainer}>
              <Text style={styles.filterTitle}>Filter by Truck</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.truckFilterScrollContent}
              >
                <TouchableOpacity
                  style={[styles.truckFilterButton, !selectedTruckId && styles.truckFilterButtonActive]}
                  onPress={() => setSelectedTruckId(null)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="list"
                    size={16}
                    color={!selectedTruckId ? COLORS.textInverse : COLORS.primary}
                  />
                  <Text
                    style={[
                      styles.truckFilterButtonText,
                      !selectedTruckId && styles.truckFilterButtonTextActive,
                    ]}
                  >
                    All Trips
                  </Text>
                </TouchableOpacity>
                
                {trucks.map((truck) => (
                  <TruckFilterButton
                    key={truck.id}
                    truck={truck}
                    isActive={selectedTruckId === truck.id}
                    onPress={() => setSelectedTruckId(truck.id)}
                  />
                ))}
              </ScrollView>
            </View>

            {/* Add Trip Button */}
            <View style={styles.addButtonContainer}>
              <EnhancedCustomButton
                title="Add New Trip"
                onPress={() => navigation.navigate('AddTrip')}
                icon="add-circle"
                variant="primary"
                size="large"
                fullWidth
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="car-outline" size={64} color={COLORS.textTertiary} />
            <Text style={styles.emptyTitle}>No Trips Found</Text>
            <Text style={styles.emptySubtitle}>
              {!selectedTruckId
                ? 'Start by adding your first trip'
                : `No trips found for ${getTruckName(selectedTruckId)}`}
            </Text>
            <EnhancedCustomButton
              title="Add Trip"
              onPress={() => navigation.navigate('AddTrip')}
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
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: SIZES.spacingLg,
    marginBottom: SIZES.spacingXl,
    gap: SIZES.spacingMd,
  },
  statCard: {
    width: (width - SIZES.spacingLg * 2 - SIZES.spacingMd) / 2,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.spacingLg,
    marginBottom: SIZES.spacingMd,
    alignItems: 'center',
    ...SIZES.shadow,
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
    marginBottom: SIZES.spacingLg,
  },
  filterTitle: {
    fontSize: SIZES.fontSizeMd,
    fontWeight: '600' as const,
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacingMd,
  },
  truckFilterScrollContent: {
    paddingHorizontal: SIZES.spacingXs,
    gap: SIZES.spacingSm,
  },
  truckFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.spacingMd,
    paddingHorizontal: SIZES.spacingLg,
    borderRadius: SIZES.radiusMd,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
    minWidth: 120,
  },
  truckFilterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  truckFilterButtonText: {
    fontSize: SIZES.fontSizeSm,
    fontWeight: '600' as const,
    color: COLORS.primary,
    marginLeft: SIZES.spacingXs,
    flexShrink: 1,
  },
  truckFilterButtonTextActive: {
    color: COLORS.textInverse,
  },
  addButtonContainer: {
    marginBottom: SIZES.spacingLg,
  },
  tripsList: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: SIZES.spacingXl,
    flexGrow: 1,
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

export default EnhancedTripsScreen;
