import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { Truck, Trip } from '../types';
import TruckCard from '../components/TruckCard';
import CustomButton from '../components/CustomButton';
import { truckService } from '../services/truckService';
import { tripService } from '../services/tripService';

const TrucksScreen: React.FC = ({ navigation }: any) => {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [trucksData, tripsData] = await Promise.all([
        truckService.getTrucks(),
        tripService.getTrips(),
      ]);
      setTrucks(trucksData);
      setTrips(tripsData);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load data');
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

  const getTruckStats = (truckId: string) => {
    const truckTrips = trips.filter(trip => trip.truck_id === truckId);
    const tripCount = truckTrips.length;
    const totalCost = truckTrips.reduce((sum, trip) => sum + trip.total_cost, 0);
    const totalDiesel = truckTrips.reduce((sum, trip) => sum + trip.diesel_quantity, 0);
    const avgCost = tripCount > 0 ? totalCost / tripCount : 0;

    return {
      tripCount,
      totalCost,
      totalDiesel,
      avgCost,
    };
  };

  const handleAddTruck = () => {
    navigation.navigate('AddTruck');
  };

  const handleTruckPress = (truck: Truck) => {
    navigation.navigate('TruckTrips', { truck });
  };

  const handleEditTruck = (truck: Truck) => {
    // TODO: Implement edit truck functionality
    Alert.alert(
      'Edit Truck',
      `Edit ${truck.name} - This feature will be implemented soon`,
      [{ text: 'OK' }]
    );
  };

  const handleDeleteTruck = async (truck: Truck) => {
    Alert.alert(
      'Delete Truck',
      `Are you sure you want to delete ${truck.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await truckService.deleteTruck(truck.id);
              await loadData(); // Refresh the data
              Alert.alert('Success', 'Truck deleted successfully');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete truck');
            }
          }
        },
      ]
    );
  };

  const totalTrucks = trucks.length;
  const totalTrips = trips.length;
  const totalCost = trips.reduce((sum, trip) => sum + trip.total_cost, 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Your Trucks</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddTruck} activeOpacity={0.7}>
          <Ionicons name="add" size={28} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Overall Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="car" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.statValue}>{totalTrucks}</Text>
          <Text style={styles.statLabel}>Total Trucks</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="map" size={20} color={COLORS.secondary} />
          </View>
          <Text style={styles.statValue}>{totalTrips}</Text>
          <Text style={styles.statLabel}>Total Trips</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="wallet" size={20} color={COLORS.fuel} />
          </View>
          <Text style={styles.statValue}>₹{(totalCost / 1000).toFixed(1)}K</Text>
          <Text style={styles.statLabel}>Total Cost</Text>
        </View>
      </View>

      {/* Add Truck Button */}
      <View style={styles.addTruckContainer}>
        <CustomButton
          title="Add New Truck"
          onPress={handleAddTruck}
          variant="outline"
          size="large"
        />
      </View>

      {/* Trucks List */}
      <ScrollView
        style={styles.trucksList}
        contentContainerStyle={styles.trucksListContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading trucks...</Text>
          </View>
        ) : trucks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="car-outline" size={64} color={COLORS.textTertiary} />
            <Text style={styles.emptyTitle}>No trucks yet</Text>
            <Text style={styles.emptySubtitle}>Add your first truck to get started</Text>
          </View>
        ) : (
          trucks.map(truck => {
            const stats = getTruckStats(truck.id);
            return (
              <TruckCard
                key={truck.id}
                truck={truck}
                tripCount={stats.tripCount}
                totalCost={stats.totalCost}
                onPress={() => handleTruckPress(truck)}
                onEdit={() => handleEditTruck(truck)}
                onDelete={() => handleDeleteTruck(truck)}
              />
            );
          })
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
  addTruckContainer: {
    paddingHorizontal: SIZES.spacingLg,
    marginBottom: SIZES.spacingXl,
  },
  trucksList: {
    flex: 1,
  },
  trucksListContent: {
    paddingBottom: SIZES.spacingXl,
  },
  bottomSpacing: {
    height: SIZES.spacingXl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SIZES.spacingXxl,
  },
  loadingText: {
    fontSize: SIZES.fontSizeMd,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SIZES.spacingXxl,
    paddingHorizontal: SIZES.spacingLg,
  },
  emptyTitle: {
    fontSize: SIZES.fontSizeXl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SIZES.spacingLg,
    marginBottom: SIZES.spacingSm,
  },
  emptySubtitle: {
    fontSize: SIZES.fontSizeMd,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default TrucksScreen;
