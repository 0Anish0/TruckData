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
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Debug: Log user object to see what's available
  useEffect(() => {
    if (user) {
      console.log('User object in DashboardScreen:', user);
      console.log('User email:', user.email);
      console.log('User metadata:', user.user_metadata);
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Debug: Check current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      console.log('Dashboard - Current user ID:', currentUser?.id);
      console.log('Dashboard - Current user email:', currentUser?.email);
      console.log('Dashboard - Auth context user ID:', user?.id);
      
      // Debug database state first
      await tripService.debugDatabaseState();

      const [trucks, trips, tripStats] = await Promise.all([
        truckService.getTrucks(),
        tripService.getTrips(),
        tripService.getTripStats(),
      ]);

      console.log('Dashboard - Loaded trucks:', trucks.length);
      console.log('Dashboard - Loaded trips:', trips.length);
      console.log('Dashboard - Trip stats:', tripStats);

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

  // Add session refresh check
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // Session is null, user should be redirected to auth
          return;
        }
        
        // Check if session is about to expire (within 5 minutes)
        if (session.expires_at) {
          const expiresAt = new Date(session.expires_at * 1000);
          const now = new Date();
          const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
          
          if (expiresAt <= fiveMinutesFromNow) {
            console.log('Session expiring soon, refreshing...');
            const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
            if (error) {
              console.error('Failed to refresh session:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };

    // Check session every 2 minutes
    const interval = setInterval(checkSession, 2 * 60 * 1000);
    
    // Initial check
    checkSession();

    return () => clearInterval(interval);
  }, []);

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

  const handleEditTrip = (trip: any) => {
    navigation.navigate('EditTrip', { trip });
  };

  const handleDeleteTrip = (trip: any) => {
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
              // Refresh the dashboard data after deletion
              loadDashboardData();
              Alert.alert('Success', 'Trip deleted successfully');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete trip');
              console.error('Delete trip error:', error);
            }
          },
        },
      ]
    );
  };

  const handleEditTruck = (truck: any) => {
    navigation.navigate('EditTruck', { truck });
  };

  const handleDeleteTruck = (truck: any) => {
    Alert.alert(
      'Delete Truck',
      `Are you sure you want to delete ${truck.name}? This will also delete all associated trips.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await truckService.deleteTruck(truck.id);
              // Refresh the dashboard data after deletion
              loadDashboardData();
              Alert.alert('Success', 'Truck deleted successfully');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete truck');
              console.error('Delete truck error:', error);
            }
          },
        },
      ]
    );
  };

  const handleSignOut = async () => {
    setShowProfileDropdown(false);
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

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const formatEmailDisplay = (email: string | undefined) => {
    if (!email) return 'No email available';
    
    // If email is already masked (contains asterisks), show it as is
    if (email.includes('*')) return email;
    
    // Otherwise, show the full email
    return email;
  };

  const getDisplayName = (user: any) => {
    // Try to get name from user metadata first
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    
    // Try to get from email if not masked
    if (user?.email && !user.email.includes('*')) {
      return user.email.split('@')[0];
    }
    
    // Fallback to a generic name
    return 'User';
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
      {/* Header - Fixed/Sticky */}
      <View style={styles.header}>
        <Text style={styles.title}>Truck Fleet Manager</Text>
        <View style={styles.profileContainer}>
          <TouchableOpacity style={styles.profileButton} onPress={toggleProfileDropdown} activeOpacity={0.7}>
            <Ionicons name="person-circle" size={32} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Dropdown - Positioned outside header to avoid clipping */}
      {showProfileDropdown && (
        <>
          <TouchableOpacity 
            style={styles.backdrop} 
            onPress={() => setShowProfileDropdown(false)} 
            activeOpacity={1}
          />
          <View style={styles.profileDropdown}>
            <View style={styles.profileInfo}>
              <Ionicons name="person-circle" size={48} color={COLORS.primary} />
              <Text style={styles.profileName}>{getDisplayName(user)}</Text>
              <Text style={styles.profileEmail}>{formatEmailDisplay(user?.email)}</Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut} activeOpacity={0.7}>
              <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >

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
                  truck_number: truck.truck_number,
                  model: truck.model,
                  created_at: truck.created_at,
                  updated_at: truck.updated_at,
                  user_id: truck.user_id,
                }}
                tripCount={getTruckTripCount(truck.id)}
                totalCost={getTruckTotalCost(truck.id)}
                onPress={() => handleTruckPress(truck)}
                onEdit={() => handleEditTruck(truck)}
                onDelete={() => handleDeleteTruck(truck)}
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
                onEdit={() => handleEditTrip(trip)}
                onDelete={() => handleDeleteTrip(trip)}
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
    zIndex: 1000,
  },
  title: {
    fontSize: SIZES.fontSizeXxl,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  profileContainer: {
    position: 'relative',
    zIndex: 10001,
  },
  backdrop: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 9999,
  },
  profileButton: {
    padding: SIZES.spacingXs,
    borderRadius: SIZES.radius,
  },
  profileDropdown: {
    position: 'absolute',
    top: 120,
    right: SIZES.spacingLg,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.spacingLg,
    minWidth: 200,
    maxHeight: 300,
    ...SIZES.shadowStrong,
    zIndex: 10000,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: SIZES.spacingLg,
    paddingBottom: SIZES.spacingLg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  profileName: {
    fontSize: SIZES.fontSizeLg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SIZES.spacingSm,
    marginBottom: SIZES.spacingXs,
  },
  profileEmail: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.spacingMd,
    paddingHorizontal: SIZES.spacingLg,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.background,
  },
  logoutText: {
    fontSize: SIZES.fontSizeMd,
    fontWeight: '600',
    color: COLORS.error,
    marginLeft: SIZES.spacingSm,
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
