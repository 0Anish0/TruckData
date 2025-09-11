import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/MockAuthContext';
import { mockTripService, mockTruckService } from '../services/mockService';
import { COLORS, SIZES, ANIMATIONS } from '../constants/theme';
import EnhancedTripCard from '../components/EnhancedTripCard';
import EnhancedCustomButton from '../components/EnhancedCustomButton';
import { Trip, Truck, DashboardStats, DashboardScreenNavigationProp, TripWithRelations } from '../types';

const { width } = Dimensions.get('window');

interface EnhancedDashboardScreenProps {
  navigation: DashboardScreenNavigationProp;
}

const EnhancedDashboardScreen: React.FC<EnhancedDashboardScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalTrips: 0,
    totalCost: 0,
    totalDiesel: 0,
    avgCost: 0,
  });
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
      
      const [tripsData, trucksData, statsData] = await Promise.all([
        mockTripService.getTrips(),
        mockTruckService.getTrucks(),
        mockTripService.getTripStats(),
      ]);

      setTrips(tripsData);
      setTrucks(trucksData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getDisplayName = (user: { user_metadata?: { full_name?: string }; name?: string; email?: string }) => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.name) {
      return user.name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getTruckName = (truckId: string) => {
    const truck = trucks.find(t => t.id === truckId);
    return truck?.name || 'Unknown Truck';
  };

  const StatCard: React.FC<{
    title: string;
    value: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    gradient: readonly [string, string, ...string[]];
  }> = ({ title, value, icon, color, gradient }) => (
    <Animated.View
      style={[
        styles.statCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.statCardGradient}
      >
        <View style={styles.statCardContent}>
          <View style={[styles.statIcon, { backgroundColor: color + '30' }]}>
            <Ionicons name={icon} size={20} color={color} />
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statTitle}>{title}</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sticky Header */}
      <LinearGradient
        colors={COLORS.primaryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.userName}>{getDisplayName(user || {})}</Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="car" size={32} color={COLORS.textInverse} />
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Total Trips"
            value={stats.totalTrips.toString()}
            icon="trending-up"
            color={COLORS.info}
            gradient={COLORS.infoGradient}
          />
          <StatCard
            title="Total Cost"
            value={formatCurrency(stats.totalCost)}
            icon="wallet"
            color={COLORS.success}
            gradient={COLORS.successGradient}
          />
          <StatCard
            title="Diesel Used"
            value={`${stats.totalDiesel}L`}
            icon="car"
            color={COLORS.fuel}
            gradient={COLORS.fuelGradient}
          />
          <StatCard
            title="Avg. Cost"
            value={formatCurrency(stats.avgCost)}
            icon="analytics"
            color={COLORS.warning}
            gradient={COLORS.warningGradient}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <EnhancedCustomButton
              title="Add Trip"
              onPress={() => navigation.navigate('AddTrip')}
              icon="add-circle"
              variant="primary"
              size="medium"
              style={styles.quickActionButton}
            />
            <EnhancedCustomButton
              title="Add Truck"
              onPress={() => navigation.navigate('AddTruck')}
              icon="car-sport"
              variant="secondary"
              size="medium"
              style={styles.quickActionButton}
            />
          </View>
        </View>

        {/* Recent Trips */}
        <View style={styles.recentTripsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Trips</Text>
            <EnhancedCustomButton
              title="View All"
              onPress={() => navigation.navigate('Trips')}
              variant="ghost"
              size="small"
              icon="arrow-forward"
              iconPosition="right"
            />
          </View>
          
          {trips.slice(0, 3).map((trip, index) => (
            <EnhancedTripCard
              key={trip.id}
              trip={trip}
              truckName={getTruckName(trip.truck_id)}
              onPress={() => navigation.navigate('EditTrip', { trip: trip as TripWithRelations })}
              onEdit={() => navigation.navigate('EditTrip', { trip: trip as TripWithRelations })}
              onDelete={() => {
                // TODO: Implement delete functionality
                console.log('Delete trip:', trip.id);
              }}
              index={index}
            />
          ))}
        </View>

        {/* Fleet Overview */}
        <View style={styles.fleetContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Fleet Overview</Text>
            <EnhancedCustomButton
              title="Manage"
              onPress={() => navigation.navigate('Trucks')}
              variant="ghost"
              size="small"
              icon="settings"
              iconPosition="right"
            />
          </View>
          
          <View style={styles.fleetStats}>
            <View style={styles.fleetStatItem}>
              <Ionicons name="car-sport" size={24} color={COLORS.primary} />
              <Text style={styles.fleetStatValue}>{trucks.length}</Text>
              <Text style={styles.fleetStatLabel}>Active Trucks</Text>
            </View>
            <View style={styles.fleetStatItem}>
              <Ionicons name="people" size={24} color={COLORS.secondary} />
              <Text style={styles.fleetStatValue}>3</Text>
              <Text style={styles.fleetStatLabel}>Drivers</Text>
            </View>
            <View style={styles.fleetStatItem}>
              <Ionicons name="trending-up" size={24} color={COLORS.success} />
              <Text style={styles.fleetStatValue}>95%</Text>
              <Text style={styles.fleetStatLabel}>Efficiency</Text>
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
    marginTop: 120, // Add margin to account for sticky header height
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SIZES.spacingXl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: SIZES.fontSizeLg,
    color: COLORS.textSecondary,
    fontWeight: '600',
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
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: SIZES.fontSizeLg,
    color: COLORS.textInverse,
    opacity: 0.9,
    fontWeight: '500',
  },
  userName: {
    fontSize: SIZES.fontSizeXxl,
    color: COLORS.textInverse,
    fontWeight: '700',
    marginTop: SIZES.spacingXs,
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.glassLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SIZES.spacingLg,
    marginTop: SIZES.spacingLg,
    marginBottom: SIZES.spacingXl,
    justifyContent: 'space-between',
    gap: SIZES.spacingSm,
  },
  statCard: {
    width: (width - SIZES.spacingLg * 2 - SIZES.spacingSm) / 2,
    marginBottom: SIZES.spacingMd,
    borderRadius: SIZES.radiusLg,
    ...SIZES.shadowMedium,
    minHeight: 120,
  },
  statCardGradient: {
    padding: SIZES.spacingLg,
    borderRadius: SIZES.radiusLg,
  },
  statCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.spacingMd,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statTextContainer: {
    flex: 1,
    minWidth: 0, // Allow text to wrap properly
  },
  statValue: {
    fontSize: SIZES.fontSizeLg,
    fontWeight: '800',
    color: COLORS.textInverse,
    marginBottom: SIZES.spacingXs,
    lineHeight: SIZES.fontSizeLg * 1.2,
  },
  statTitle: {
    fontSize: SIZES.fontSizeXs,
    color: COLORS.textInverse,
    opacity: 0.9,
    fontWeight: '600',
    lineHeight: SIZES.fontSizeXs * 1.3,
  },
  quickActionsContainer: {
    paddingHorizontal: SIZES.spacingLg,
    marginBottom: SIZES.spacingLg,
  },
  sectionTitle: {
    fontSize: SIZES.fontSizeXl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacingMd,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SIZES.spacingMd,
  },
  quickActionButton: {
    flex: 1,
    minHeight: 48,
  },
  recentTripsContainer: {
    marginBottom: SIZES.spacingLg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacingLg,
    marginBottom: SIZES.spacingMd,
  },
  fleetContainer: {
    paddingHorizontal: SIZES.spacingLg,
    marginBottom: SIZES.spacingLg,
  },
  fleetStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.spacingLg,
    ...SIZES.shadow,
    minHeight: 100,
  },
  fleetStatItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: SIZES.spacingXs,
  },
  fleetStatValue: {
    fontSize: SIZES.fontSizeXl,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: SIZES.spacingSm,
    marginBottom: SIZES.spacingXs,
    textAlign: 'center',
  },
  fleetStatLabel: {
    fontSize: SIZES.fontSizeXs,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: SIZES.fontSizeXs * 1.3,
  },
  bottomSpacing: {
    height: SIZES.spacingXl,
  },
});

export default EnhancedDashboardScreen;
