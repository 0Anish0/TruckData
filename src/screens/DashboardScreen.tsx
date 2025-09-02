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
import { useAuth } from '../contexts/AuthContext';
import { truckService } from '../services/truckService';
import { tripService } from '../services/tripService';
import { supabase } from '../lib/supabase';
import TruckCard from '../components/TruckCard';
import TripCard from '../components/TripCard';
import CustomButton from '../components/CustomButton';

interface DashboardData {
  trucks: any[];
  trips: any[];
  totalTrips: number;
  totalCost: number;
}

const DashboardScreen: React.FC<any> = ({ navigation }) => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<DashboardData>({
    trucks: [],
    trips: [],
    totalTrips: 0,
    totalCost: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [trucks, trips, tripStats] = await Promise.all([
        truckService.getTrucks(),
        tripService.getTrips(),
        tripService.getTripStats(),
      ]);

      setData({
        trucks,
        trips,
        totalTrips: tripStats.totalTrips,
        totalCost: tripStats.totalCost,
      });
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load dashboard data');
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getTruckTripCount = (truckId: string) => {
    return data.trips.filter(trip => trip.truck_id === truckId).length;
  };

  const getTruckTotalCost = (truckId: string) => {
    return data.trips
      .filter(trip => trip.truck_id === truckId)
      .reduce((total, trip) => total + Number(trip.total_cost), 0);
  };

  const handleAddTrip = () => {
    navigation.navigate('AddTrip');
  };

  const handleTruckPress = (truck: any) => {
    navigation.navigate('TruckTrips', { truck });
  };

  const handleTripPress = (trip: any) => {
    // Navigate to trip details (you can implement this later)
    console.log('Trip pressed:', trip);
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase.auth.signOut();
            } catch (error) {
              console.error('Sign out error:', error);
            }
          }
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Truck Fleet Manager</Text>
          <TouchableOpacity style={styles.profileButton} onPress={handleSignOut} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={32} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="car" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.statValue}>{data.trucks.length}</Text>
            <Text style={styles.statLabel}>Trucks</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="map" size={20} color={COLORS.secondary} />
            </View>
            <Text style={styles.statValue}>{data.totalTrips}</Text>
            <Text style={styles.statLabel}>Trips</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="wallet" size={20} color={COLORS.fuel} />
            </View>
            <Text style={styles.statValue}>₹{(data.totalCost / 1000).toFixed(1)}K</Text>
            <Text style={styles.statLabel}>Total Cost</Text>
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

        {/* Trucks Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Trucks</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Trucks')} activeOpacity={0.7}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {data.trucks.length > 0 ? (
            data.trucks.slice(0, 3).map(truck => (
              <TruckCard
                key={truck.id}
                truck={{
                  id: truck.id,
                  name: truck.name,
                  truckNumber: truck.truck_number,
                  model: truck.model,
                  createdAt: new Date(truck.created_at),
                }}
                tripCount={getTruckTripCount(truck.id)}
                totalCost={getTruckTotalCost(truck.id)}
                onPress={() => handleTruckPress(truck)}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="car-outline" size={48} color={COLORS.textTertiary} />
              <Text style={styles.emptyStateText}>No trucks yet</Text>
              <Text style={styles.emptyStateSubtext}>Add your first truck to get started</Text>
            </View>
          )}
        </View>

        {/* Recent Trips Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Trips</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Trips')} activeOpacity={0.7}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {data.trips.length > 0 ? (
            data.trips.slice(0, 3).map(trip => (
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
                truckName={trip.trucks?.name || 'Unknown Truck'}
                onPress={() => handleTripPress(trip)}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="map-outline" size={48} color={COLORS.textTertiary} />
              <Text style={styles.emptyStateText}>No trips yet</Text>
              <Text style={styles.emptyStateSubtext}>Add your first trip to get started</Text>
            </View>
          )}
        </View>

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SIZES.spacingXl,
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
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  profileButton: {
    padding: SIZES.spacingXs,
    borderRadius: SIZES.radius,
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
    fontSize: SIZES.fontSizeXl,
    fontWeight: '800',
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
  section: {
    marginBottom: SIZES.spacingXl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacingLg,
    marginBottom: SIZES.spacingLg,
  },
  sectionTitle: {
    fontSize: SIZES.fontSizeLg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  seeAllText: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SIZES.spacingXl,
    paddingHorizontal: SIZES.spacingLg,
  },
  emptyStateText: {
    fontSize: SIZES.fontSizeLg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SIZES.spacingMd,
    marginBottom: SIZES.spacingSm,
  },
  emptyStateSubtext: {
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

export default DashboardScreen;
