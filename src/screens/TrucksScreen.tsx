import React, { useState } from 'react';
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

// Mock data
const mockTrucks: Truck[] = [
  {
    id: '1',
    name: 'Truck 1',
    truckNumber: 'DL-01-AB-1234',
    model: 'Tata 407',
    createdAt: new Date('2023-06-15'),
  },
  {
    id: '2',
    name: 'Truck 2',
    truckNumber: 'DL-02-CD-5678',
    model: 'Ashok Leyland Dost',
    createdAt: new Date('2023-08-20'),
  },
  {
    id: '3',
    name: 'Truck 3',
    truckNumber: 'DL-03-EF-9012',
    model: 'Mahindra Bolero Pickup',
    createdAt: new Date('2023-12-10'),
  },
];

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
];

const TrucksScreen: React.FC = ({ navigation }: any) => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getTruckStats = (truckId: string) => {
    const truckTrips = mockTrips.filter(trip => trip.truckId === truckId);
    const tripCount = truckTrips.length;
    const totalCost = truckTrips.reduce((sum, trip) => sum + trip.totalCost, 0);
    const totalDiesel = truckTrips.reduce((sum, trip) => sum + trip.dieselQuantity, 0);
    const avgCost = tripCount > 0 ? totalCost / tripCount : 0;

    return {
      tripCount,
      totalCost,
      totalDiesel,
      avgCost,
    };
  };

  const handleAddTruck = () => {
    Alert.alert(
      'Add New Truck',
      'This feature will be implemented when we integrate with Supabase',
      [{ text: 'OK' }]
    );
  };

  const handleTruckPress = (truck: Truck) => {
    // Navigate to truck details/trips
    console.log('Truck pressed:', truck);
  };

  const handleEditTruck = (truck: Truck) => {
    Alert.alert(
      'Edit Truck',
      `Edit ${truck.name} - This feature will be implemented when we integrate with Supabase`,
      [{ text: 'OK' }]
    );
  };

  const handleDeleteTruck = (truck: Truck) => {
    Alert.alert(
      'Delete Truck',
      `Are you sure you want to delete ${truck.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            console.log('Delete truck:', truck);
            Alert.alert('Success', 'Truck deleted successfully');
          }
        },
      ]
    );
  };

  const totalTrucks = mockTrucks.length;
  const totalTrips = mockTrips.length;
  const totalCost = mockTrips.reduce((sum, trip) => sum + trip.totalCost, 0);

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
        {mockTrucks.map(truck => {
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
        })}
        
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
});

export default TrucksScreen;
