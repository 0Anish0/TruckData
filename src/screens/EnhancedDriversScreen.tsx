import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { mockDriverService } from '../services/mockService';
import { COLORS, SIZES, ANIMATIONS } from '../constants/theme';
import EnhancedCustomButton from '../components/EnhancedCustomButton';
import { Driver } from '../types';

const EnhancedDriversScreen: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'age' | 'experience'>('name');

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
      const driversData = await mockDriverService.getDrivers();
      setDrivers(driversData);
    } catch (error) {
      console.error('Error loading drivers data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getSortedDrivers = () => {
    const sortedDrivers = [...drivers];
    
    switch (sortBy) {
      case 'age':
        return sortedDrivers.sort((a, b) => (b.age || 0) - (a.age || 0));
      case 'experience':
        // Mock experience based on age
        return sortedDrivers.sort((a, b) => {
          const expA = (a.age || 0) - 18; // Assume driving since 18
          const expB = (b.age || 0) - 18;
          return expB - expA;
        });
      default:
        return sortedDrivers.sort((a, b) => a.name.localeCompare(b.name));
    }
  };

  const getTotalStats = () => {
    const totalDrivers = drivers.length;
    const avgAge = drivers.length > 0 
      ? Math.round(drivers.reduce((sum, driver) => sum + (driver.age || 0), 0) / drivers.length)
      : 0;
    const activeDrivers = drivers.length; // All drivers are active in mock data
    const totalExperience = drivers.reduce((sum, driver) => {
      const experience = (driver.age || 0) - 18;
      return sum + Math.max(0, experience);
    }, 0);

    return { totalDrivers, avgAge, activeDrivers, totalExperience };
  };

  const SortButton: React.FC<{
    title: string;
    isActive: boolean;
    onPress: () => void;
    icon: keyof typeof Ionicons.glyphMap;
  }> = ({ title, isActive, onPress, icon }) => (
    <TouchableOpacity
      style={[styles.sortButton, isActive && styles.sortButtonActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={icon}
        size={16}
        color={isActive ? COLORS.textInverse : COLORS.accent}
      />
      <Text
        style={[
          styles.sortButtonText,
          isActive && styles.sortButtonTextActive,
        ]}
      >
        {title}
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

  const DriverCard: React.FC<{
    driver: Driver;
    index: number;
  }> = ({ driver, index }) => {
    const cardFadeAnim = useRef(new Animated.Value(0)).current;
    const cardSlideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
      const delay = index * 100;
      Animated.parallel([
        Animated.timing(cardFadeAnim, {
          toValue: 1,
          duration: ANIMATIONS.normal,
          delay,
          useNativeDriver: true,
        }),
        Animated.spring(cardSlideAnim, {
          toValue: 0,
          delay,
          useNativeDriver: true,
          ...ANIMATIONS.springGentle,
        }),
      ]).start();
    }, [index]);

    const experience = Math.max(0, (driver.age || 0) - 18);

    return (
      <Animated.View
        style={[
          styles.driverCard,
          {
            opacity: cardFadeAnim,
            transform: [{ translateY: cardSlideAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={COLORS.accentGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.driverCardHeader}
        >
          <View style={styles.driverAvatar}>
            <Ionicons name="person" size={24} color={COLORS.textInverse} />
          </View>
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>{driver.name}</Text>
            <Text style={styles.driverLicense}>{driver.license_number}</Text>
          </View>
          <View style={styles.driverStatus}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Active</Text>
          </View>
        </LinearGradient>

        <View style={styles.driverCardContent}>
          <View style={styles.driverDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar" size={16} color={COLORS.textSecondary} />
              <Text style={styles.detailLabel}>Age</Text>
              <Text style={styles.detailValue}>{driver.age} years</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons name="time" size={16} color={COLORS.textSecondary} />
              <Text style={styles.detailLabel}>Experience</Text>
              <Text style={styles.detailValue}>{experience} years</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons name="call" size={16} color={COLORS.textSecondary} />
              <Text style={styles.detailLabel}>Phone</Text>
              <Text style={styles.detailValue}>{driver.phone}</Text>
            </View>
          </View>

          <View style={styles.driverActions}>
            <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
              <Ionicons name="pencil" size={18} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
              <Ionicons name="trash" size={18} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderDriverItem = ({ item, index }: { item: Driver; index: number }) => (
    <DriverCard driver={item} index={index} />
  );

  const stats = getTotalStats();
  const sortedDrivers = getSortedDrivers();

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Drivers...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sticky Header */}
      <LinearGradient
        colors={COLORS.accentGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Driver Management</Text>
            <Text style={styles.headerSubtitle}>
              Manage your driver team efficiently
            </Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="people" size={28} color={COLORS.textInverse} />
          </View>
        </View>
      </LinearGradient>

      {/* Make entire screen scrollable using FlatList as root */}
      <FlatList
        data={sortedDrivers}
        renderItem={renderDriverItem}
        keyExtractor={(item) => item.id}
        style={styles.content}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.accent]}
            tintColor={COLORS.accent}
          />
        }
        ListHeaderComponent={
          <View>
            {/* Stats Cards */}
            <View style={styles.statsContainer}>
              <StatCard
                title="Total Drivers"
                value={stats.totalDrivers.toString()}
                icon="people"
                color={COLORS.accent}
              />
              <StatCard
                title="Active"
                value={stats.activeDrivers.toString()}
                icon="checkmark-circle"
                color={COLORS.success}
              />
            </View>

            {/* Sort Buttons */}
            <View style={styles.sortContainer}>
              <SortButton
                title="Name"
                isActive={sortBy === 'name'}
                onPress={() => setSortBy('name')}
                icon="text"
              />
              <SortButton
                title="Age"
                isActive={sortBy === 'age'}
                onPress={() => setSortBy('age')}
                icon="calendar"
              />
              <SortButton
                title="Experience"
                isActive={sortBy === 'experience'}
                onPress={() => setSortBy('experience')}
                icon="time"
              />
            </View>

            {/* Add Driver Button */}
            <View style={styles.addButtonContainer}>
              <EnhancedCustomButton
                title="Add New Driver"
                onPress={() => {}}
                icon="person-add"
                variant="primary"
                size="large"
                fullWidth
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={COLORS.textTertiary} />
            <Text style={styles.emptyTitle}>No Drivers Found</Text>
            <Text style={styles.emptySubtitle}>
              Start by adding your first driver to the team
            </Text>
            <EnhancedCustomButton
              title="Add Driver"
              onPress={() => {}}
              icon="person-add"
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
    flexWrap: 'nowrap',
    marginTop: SIZES.spacingLg,
    marginBottom: SIZES.spacingXl,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '49%',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.spacingLg,
    marginBottom: SIZES.spacingMd,
    alignItems: 'center',
    ...SIZES.shadow,
    minHeight: 120,
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
  sortContainer: {
    flexDirection: 'row',
    marginBottom: SIZES.spacingLg,
    gap: SIZES.spacingSm,
  },
  sortButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.spacingMd,
    paddingHorizontal: SIZES.spacingLg,
    borderRadius: SIZES.radiusMd,
    borderWidth: 2,
    borderColor: COLORS.accent,
    backgroundColor: COLORS.surface,
  },
  sortButtonActive: {
    backgroundColor: COLORS.accent,
  },
  sortButtonText: {
    fontSize: SIZES.fontSizeSm,
    fontWeight: '600' as const,
    color: COLORS.accent,
    marginLeft: SIZES.spacingXs,
  },
  sortButtonTextActive: {
    color: COLORS.textInverse,
  },
  addButtonContainer: {
    marginBottom: SIZES.spacingLg,
  },
  listContainer: {
    paddingBottom: SIZES.spacingXl,
  },
  driverCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    marginBottom: SIZES.spacingLg,
    overflow: 'hidden',
    ...SIZES.shadowMedium,
  },
  driverCardHeader: {
    padding: SIZES.spacingLg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.glassLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.spacingMd,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: SIZES.fontSizeLg,
    fontWeight: '700' as const,
    color: COLORS.textInverse,
    marginBottom: SIZES.spacingXs,
  },
  driverLicense: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.textInverse,
    opacity: 0.9,
    fontWeight: '500' as const,
  },
  driverStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glassLight,
    paddingHorizontal: SIZES.spacingSm,
    paddingVertical: SIZES.spacingXs,
    borderRadius: SIZES.radius,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: SIZES.spacingXs,
  },
  statusText: {
    fontSize: SIZES.fontSizeXs,
    color: COLORS.textInverse,
    fontWeight: '600' as const,
  },
  driverCardContent: {
    padding: SIZES.spacingLg,
  },
  driverDetails: {
    marginBottom: SIZES.spacingLg,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacingSm,
  },
  detailLabel: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.textSecondary,
    fontWeight: '600' as const,
    marginLeft: SIZES.spacingSm,
    marginRight: SIZES.spacingSm,
    minWidth: 80,
  },
  detailValue: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.textPrimary,
    fontWeight: '600' as const,
    flex: 1,
  },
  driverActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SIZES.spacingSm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SIZES.shadowSubtle,
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

export default EnhancedDriversScreen;
