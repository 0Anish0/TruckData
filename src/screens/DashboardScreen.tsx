import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
  Dimensions,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { tripService, truckService, driverService } from '../services';
import { COLORS, SIZES, ANIMATIONS } from '../constants/theme';
import TripCard from '../components/TripCard';
import CustomButton from '../components/CustomButton';
import Loader from '../components/Loader';
import { Trip, Truck, Driver, DashboardStats, DashboardScreenNavigationProp, TripWithRelations } from '../types';

const { width } = Dimensions.get('window');

interface DashboardScreenProps {
  navigation: DashboardScreenNavigationProp;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
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

      const [tripsData, trucksData, driversData, statsData] = await Promise.all([
        tripService.getTrips(),
        truckService.getTrucks(),
        driverService.getDrivers(),
        tripService.getTripStats(),
      ]);

      setTrips(tripsData);
      setTrucks(trucksData);
      setDrivers(driversData);
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

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error: unknown) {
              const message = error instanceof Error ? error.message : 'Failed to logout';
              Alert.alert('Error', message);
            }
          },
        },
      ]
    );
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
          <View style={styles.statIcon}>
            <Ionicons name={icon} size={20} color={COLORS.textInverse} />
          </View>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {loading && <Loader message="Loading Dashboard..." size="large" iconName="analytics" />}
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
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={30} color={COLORS.textInverse} />
            </TouchableOpacity>
            <View style={styles.headerIcon}>
              <Ionicons name="car-sport" size={30} color={COLORS.textInverse} />
            </View>
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
            title="All Trips"
            value={stats.totalTrips.toString()}
            icon="trending-up"
            color={COLORS.info}
            gradient={COLORS.infoGradient}
          />
          <StatCard
            title="All Trucks"
            value={trucks.length.toString()}
            icon="car-sport"
            color={COLORS.secondary}
            gradient={COLORS.secondaryGradient}
          />
          <StatCard
            title="All Drivers"
            value={drivers.length.toString()}
            icon="people"
            color={COLORS.accent}
            gradient={COLORS.accentGradient}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <CustomButton
              title="Add Trip"
              onPress={() => navigation.navigate('AddTrip', {})}
              icon="add-circle"
              variant="primary"
              size="medium"
              style={styles.quickActionButton}
            />
            <CustomButton
              title="Add Truck"
              onPress={() => navigation.navigate('AddTruck', {})}
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
            <CustomButton
              title="View All"
              onPress={() => navigation.navigate('Trips')}
              variant="ghost"
              size="small"
              icon="arrow-forward"
              iconPosition="right"
            />
          </View>

          {trips.slice(0, 3).map((trip, index) => (
            <TripCard
              key={trip.id}
              trip={trip}
              truckName={getTruckName(trip.truck_id)}
              onPress={() => navigation.navigate('EditTrip', { trip: trip as TripWithRelations })}
              onEdit={() => navigation.navigate('AddTrip', { trip: trip as TripWithRelations })}
              onDelete={() => {
                // TODO: Implement delete functionality
                console.log('Delete trip:', trip.id);
              }}
              onExport={() => { }} // Export functionality will be handled by the ExportButton component
              index={index}
            />
          ))}
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
    marginTop: 140, // Add margin to account for sticky header height
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SIZES.spacingXl,
    paddingTop: SIZES.spacingSm,
    paddingHorizontal: SIZES.spacingLg,
  },
  header: {
    paddingHorizontal: SIZES.spacingLg,
    paddingTop: SIZES.spacingXl + 20, // Align with other screens' header top padding
    paddingBottom: SIZES.spacingLg, // Align with other screens' header bottom padding
    height: 140, // Match other screens' header height
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacingMd,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.glassLight,
    alignItems: 'center',
    justifyContent: 'center',
    ...SIZES.shadowSubtle,
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
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.glassLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: SIZES.spacingLg,
    marginBottom: SIZES.spacingXl,
    justifyContent: 'space-between',
    gap: SIZES.spacingMd,
  },
  statCard: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: SIZES.radiusLg,
    ...SIZES.shadowMedium,
  },
  statCardGradient: {
    padding: SIZES.spacingLg,
    borderRadius: SIZES.radiusLg,
    flex: 1,
  },
  statCardContent: {
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.spacingSm,
  },
  statValue: {
    fontSize: SIZES.fontSizeLg,
    fontWeight: '800' as const,
    color: COLORS.textInverse,
    marginBottom: SIZES.spacingXs,
  },
  statTitle: {
    fontSize: SIZES.fontSizeXs * 0.9,
    color: COLORS.textInverse,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  quickActionsContainer: {
    marginBottom: SIZES.spacingLg,
  },
  sectionTitle: {
    fontSize: SIZES.fontSizeXl,
    fontWeight: '700' as const,
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacingLg,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SIZES.spacingLg,
  },
  quickActionButton: {
    flex: 1,
    minHeight: 56,
  },
  recentTripsContainer: {
    marginBottom: SIZES.spacingXl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacingLg,
  },
  bottomSpacing: {
    height: SIZES.spacingXl,
  },
});

export default DashboardScreen;
