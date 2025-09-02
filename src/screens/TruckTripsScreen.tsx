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
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { tripService } from '../services/tripService';
import TripCard from '../components/TripCard';
import CustomButton from '../components/CustomButton';

const TruckTripsScreen: React.FC<any> = ({ route, navigation }) => {
  const { truck } = route.params;
  const [refreshing, setRefreshing] = useState(false);
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalCost: 0,
    avgCost: 0,
  });

  useEffect(() => {
    loadTruckTrips();
  }, [truck.id]);

  const loadTruckTrips = async () => {
    try {
      setLoading(true);
      const [tripsData, tripStats] = await Promise.all([
        tripService.getTripsByTruck(truck.id),
        tripService.getTruckTripStats(truck.id),
      ]);

      setTrips(tripsData);
      setStats(tripStats);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load truck trips');
      console.error('Load truck trips error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTruckTrips();
    setRefreshing(false);
  };

  const handleTripPress = (trip: any) => {
    // Navigate to trip details
    console.log('Trip pressed:', trip);
  };

  const handleEditTrip = (trip: any) => {
    // Navigate to edit trip
    console.log('Edit trip:', trip);
  };

  const handleDeleteTrip = (trip: any) => {
    Alert.alert(
      'Delete Trip',
      'Are you sure you want to delete this trip?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await tripService.deleteTrip(trip.id);
              await loadTruckTrips(); // Reload data
              Alert.alert('Success', 'Trip deleted successfully');
            } catch (error: any) {
              Alert.alert('Error', 'Failed to delete trip');
            }
          },
        },
      ]
    );
  };

  const handleAddTrip = () => {
    navigation.navigate('AddTrip', { truckId: truck.id });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading trips...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={28} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>{truck.name}</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddTrip} activeOpacity={0.7}>
          <Ionicons name="add" size={28} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Truck Info */}
      <View style={styles.truckInfo}>
        <Text style={styles.truckNumber}>{truck.truck_number}</Text>
        <Text style={styles.truckModel}>{truck.model}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="map" size={18} color={COLORS.secondary} />
          </View>
          <Text style={styles.statValue}>{stats.totalTrips}</Text>
          <Text style={styles.statLabel}>Total Trips</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="wallet" size={18} color={COLORS.fuel} />
          </View>
          <Text style={styles.statValue}>₹{(stats.totalCost / 1000).toFixed(1)}K</Text>
          <Text style={styles.statLabel}>Total Cost</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="trending-up" size={18} color={COLORS.primary} />
          </View>
          <Text style={styles.statValue}>₹{stats.avgCost.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Avg Cost</Text>
        </View>
      </View>

      {/* Add Trip Button */}
      <View style={styles.addTripContainer}>
        <CustomButton
          title="Add New Trip"
          onPress={handleAddTrip}
          variant="primary"
          size="large"
        />
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
        {trips.length > 0 ? (
          trips.map(trip => (
            <TripCard
              key={trip.id}
              trip={{
                id: trip.id,
                truckId: trip.truck_id,
                source: trip.source,
                destination: trip.destination,
                dieselQuantity: Number(trip.diesel_quantity),
                dieselPricePerLiter: Number(trip.diesel_price_per_liter),
                fastTagCost: Number(trip.fast_tag_cost),
                mcdCost: Number(trip.mcd_cost),
                greenTaxCost: Number(trip.green_tax_cost),
                totalCost: Number(trip.total_cost),
                tripDate: new Date(trip.trip_date),
                createdAt: new Date(trip.created_at),
              }}
              truckName={truck.name}
              onPress={() => handleTripPress(trip)}
              onEdit={() => handleEditTrip(trip)}
              onDelete={() => handleDeleteTrip(trip)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="map-outline" size={64} color={COLORS.textTertiary} />
            <Text style={styles.emptyStateTitle}>No trips yet</Text>
            <Text style={styles.emptyStateSubtitle}>
              Add your first trip for this truck to get started
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.spacingLg,
    paddingTop: SIZES.spacingLg,
    paddingBottom: SIZES.spacingLg,
    backgroundColor: COLORS.surface,
    ...SIZES.shadowSubtle,
  },
  backButton: {
    padding: SIZES.spacingSm,
    borderRadius: SIZES.radius,
  },
  title: {
    fontSize: SIZES.fontSizeXl,
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
  truckInfo: {
    paddingHorizontal: SIZES.spacingLg,
    paddingVertical: SIZES.spacingMd,
    backgroundColor: COLORS.surface,
    marginHorizontal: SIZES.spacingLg,
    marginTop: SIZES.spacingLg,
    borderRadius: SIZES.radiusLg,
    ...SIZES.shadowSubtle,
  },
  truckNumber: {
    fontSize: SIZES.fontSizeLg,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: SIZES.spacingXs,
  },
  truckModel: {
    fontSize: SIZES.fontSizeMd,
    color: COLORS.textSecondary,
    fontWeight: '500',
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
    marginBottom: SIZES.spacingXl,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: SIZES.fontSizeLg,
    color: COLORS.textSecondary,
  },
});

export default TruckTripsScreen;
