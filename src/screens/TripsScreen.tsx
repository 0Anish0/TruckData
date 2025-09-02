import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { Trip } from '../types';
import TripCard from '../components/TripCard';

// Mock trips data
const mockTrips: Trip[] = [
  {
    id: '1',
    truckId: '1',
    source: 'Delhi',
    destination: 'Kolkata',
    dieselQuantity: 120,
    dieselPricePerLiter: 95,
    fastTagCost: 2500,
    mcdCost: 800,
    greenTaxCost: 150,
    totalCost: 14250,
    tripDate: new Date('2024-01-15'),
    createdAt: new Date(),
  },
  {
    id: '2',
    truckId: '2',
    source: 'Mumbai',
    destination: 'Pune',
    dieselQuantity: 80,
    dieselPricePerLiter: 98,
    fastTagCost: 1200,
    mcdCost: 500,
    greenTaxCost: 100,
    totalCost: 9640,
    tripDate: new Date('2024-01-14'),
    createdAt: new Date(),
  },
  {
    id: '3',
    truckId: '1',
    source: 'Kolkata',
    destination: 'Delhi',
    dieselQuantity: 125,
    dieselPricePerLiter: 96,
    fastTagCost: 2500,
    mcdCost: 800,
    greenTaxCost: 150,
    totalCost: 14850,
    tripDate: new Date('2024-01-10'),
    createdAt: new Date(),
  },
  {
    id: '4',
    truckId: '2',
    source: 'Pune',
    destination: 'Mumbai',
    dieselQuantity: 75,
    dieselPricePerLiter: 97,
    fastTagCost: 1200,
    mcdCost: 500,
    greenTaxCost: 100,
    totalCost: 8775,
    tripDate: new Date('2024-01-08'),
    createdAt: new Date(),
  },
];

const mockTrucks = [
  { id: '1', name: 'Truck 1' },
  { id: '2', name: 'Truck 2' },
];

const TripsScreen: React.FC = ({ navigation }: any) => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getTruckName = (truckId: string) => {
    const truck = mockTrucks.find(t => t.id === truckId);
    return truck ? truck.name : 'Unknown Truck';
  };

  const filteredTrips = mockTrips.filter(trip => {
    // Filter by truck
    if (selectedFilter !== 'all' && trip.truckId !== selectedFilter) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        trip.source.toLowerCase().includes(query) ||
        trip.destination.toLowerCase().includes(query) ||
        getTruckName(trip.truckId).toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  const totalTrips = filteredTrips.length;
  const totalCost = filteredTrips.reduce((sum, trip) => sum + trip.totalCost, 0);
  const avgCost = totalTrips > 0 ? totalCost / totalTrips : 0;

  const handleTripPress = (trip: Trip) => {
    // Navigate to trip details
    console.log('Trip pressed:', trip);
  };

  const handleEditTrip = (trip: Trip) => {
    // Navigate to edit trip
    console.log('Edit trip:', trip);
  };

  const handleDeleteTrip = (trip: Trip) => {
    // Show delete confirmation
    console.log('Delete trip:', trip);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>All Trips</Text>
        <TouchableOpacity style={styles.addButton} activeOpacity={0.7}>
          <Ionicons name="add" size={28} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="map" size={18} color={COLORS.secondary} />
          </View>
          <Text style={styles.statValue}>{totalTrips}</Text>
          <Text style={styles.statLabel}>Total Trips</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="wallet" size={18} color={COLORS.fuel} />
          </View>
          <Text style={styles.statValue}>₹{(totalCost / 1000).toFixed(1)}K</Text>
          <Text style={styles.statLabel}>Total Cost</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="trending-up" size={18} color={COLORS.primary} />
          </View>
          <Text style={styles.statValue}>₹{avgCost.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Avg Cost</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilter === 'all' && styles.filterChipSelected,
            ]}
            onPress={() => setSelectedFilter('all')}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.filterChipText,
              selectedFilter === 'all' && styles.filterChipTextSelected,
            ]}>
              All Trucks
            </Text>
          </TouchableOpacity>
          
          {mockTrucks.map(truck => (
            <TouchableOpacity
              key={truck.id}
              style={[
                styles.filterChip,
                selectedFilter === truck.id && styles.filterChipSelected,
              ]}
              onPress={() => setSelectedFilter(truck.id)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.filterChipText,
                selectedFilter === truck.id && styles.filterChipTextSelected,
              ]}>
                {truck.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Trips List */}
      <ScrollView
        style={styles.tripsList}
        contentContainerStyle={styles.tripsListContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredTrips.length > 0 ? (
          filteredTrips.map(trip => (
            <TripCard
              key={trip.id}
              trip={trip}
              truckName={getTruckName(trip.truckId)}
              onPress={() => handleTripPress(trip)}
              onEdit={() => handleEditTrip(trip)}
              onDelete={() => handleDeleteTrip(trip)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="map-outline" size={64} color={COLORS.textTertiary} />
            <Text style={styles.emptyStateTitle}>No trips found</Text>
            <Text style={styles.emptyStateSubtitle}>
              {searchQuery ? 'Try adjusting your search' : 'Add your first trip to get started'}
            </Text>
          </View>
        )}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacingLg,
    paddingTop: SIZES.spacingLg,
    paddingBottom: SIZES.spacingLg,
    backgroundColor: COLORS.surface,
    ...SIZES.shadowSubtle,
  },
  title: {
    fontSize: SIZES.fontSizeXxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  addButton: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...SIZES.shadowSubtle,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.spacingLg,
    marginTop: SIZES.spacingLg,
    marginBottom: SIZES.spacingXl,
    gap: SIZES.spacingMd,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.spacingMd,
    alignItems: 'center',
    aspectRatio: 1,
    justifyContent: 'center',
    ...SIZES.shadow,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.spacingSm,
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
    fontWeight: '600',
  },
  filtersContainer: {
    paddingHorizontal: SIZES.spacingLg,
    marginBottom: SIZES.spacingLg,
  },
  filterChip: {
    paddingHorizontal: SIZES.spacingLg,
    paddingVertical: SIZES.spacingMd,
    borderRadius: SIZES.radiusLg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SIZES.spacingSm,
    ...SIZES.shadowSubtle,
  },
  filterChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    ...SIZES.shadow,
  },
  filterChipText: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  filterChipTextSelected: {
    color: COLORS.surface,
  },
  tripsList: {
    flex: 1,
  },
  tripsListContent: {
    paddingBottom: SIZES.spacingXl,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.spacingXxl,
  },
  emptyStateTitle: {
    fontSize: SIZES.fontSizeLg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SIZES.spacingMd,
    marginBottom: SIZES.spacingSm,
  },
  emptyStateSubtitle: {
    fontSize: SIZES.fontSizeMd,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  bottomSpacing: {
    height: SIZES.spacingXl,
  },
});

export default TripsScreen;
