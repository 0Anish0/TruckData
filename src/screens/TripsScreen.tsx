import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { Trip, TripWithRelations, Truck } from '../types';
import TripCard from '../components/TripCard';
import CustomButton from '../components/CustomButton';
import { tripService } from '../services/tripService';
import { truckService } from '../services/truckService';

interface TripsScreenProps {
  navigation: {
    navigate: (screen: string, params?: { trip?: TripWithRelations }) => void;
  };
}

const TripsScreen: React.FC<TripsScreenProps> = ({ navigation }) => {
  const [trips, setTrips] = useState<TripWithRelations[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    try {
      const [tripsData, trucksData] = await Promise.all([
        tripService.getTrips(),
        truckService.getTrucks(),
      ]);
      setTrips(tripsData);
      setTrucks(trucksData);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getTruckName = (trip: TripWithRelations) => {
    return trip.trucks?.name || 'Unknown Truck';
  };

  const filteredTrips = trips.filter(trip => {
    // Filter by truck
    if (selectedFilter !== 'all' && trip.truck_id !== selectedFilter) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        trip.source.toLowerCase().includes(query) ||
        trip.destination.toLowerCase().includes(query) ||
        getTruckName(trip).toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  const totalTrips = filteredTrips.length;
  const totalCost = filteredTrips.reduce((sum, trip) => sum + (trip.total_cost || 0), 0);
  const avgCost = totalTrips > 0 ? totalCost / totalTrips : 0;

  const handleTripPress = (trip: TripWithRelations) => {
    // Navigate to trip details
    console.log('Trip pressed:', trip);
  };

  const handleEditTrip = (trip: TripWithRelations) => {
    navigation.navigate('EditTrip', { trip });
  };

  const handleDeleteTrip = (trip: TripWithRelations) => {
    Alert.alert(
      'Delete Trip',
      'Are you sure you want to delete this trip? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await tripService.deleteTrip(trip.id);
              // Refresh the data after deletion
              loadData();
              Alert.alert('Success', 'Trip deleted successfully');
            } catch (error: unknown) {
              const errorMessage = error instanceof Error ? error.message : 'Failed to delete trip';
              Alert.alert('Error', errorMessage);
              console.error('Delete trip error:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>All Trips</Text>
        <TouchableOpacity style={styles.addButton} activeOpacity={0.7}>
          <Ionicons name="add" size={28} color={COLORS.surface} />
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
          <Text style={styles.statValue}>₹{((totalCost || 0) / 1000).toFixed(1)}K</Text>
          <Text style={styles.statLabel}>Total Cost</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="trending-up" size={18} color={COLORS.primary} />
          </View>
          <Text style={styles.statValue}>₹{(avgCost || 0).toFixed(0)}</Text>
          <Text style={styles.statLabel}>Avg Cost</Text>
        </View>
      </View>

      {/* Add Trip Button */}
      <View style={styles.addTripContainer}>
        <CustomButton
          title="Add New Trip"
          onPress={() => navigation.navigate('AddTrip')}
          variant="outline"
          size="large"
        />
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
          
          {trucks.map(truck => (
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
              truckName={getTruckName(trip)}
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
    backgroundColor: COLORS.primary,
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
  addTripContainer: {
    paddingHorizontal: SIZES.spacingLg,
    marginBottom: SIZES.spacingLg,
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
