import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, Image, RefreshControl, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { driverService } from '../services/driverService';
import CustomButton from '../components/CustomButton';
import { Driver } from '../types';

interface DriversScreenProps {
  navigation: {
    navigate: (screen: string) => void;
  };
}

const DriversScreen: React.FC<DriversScreenProps> = ({ navigation }) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [selectedLicenseImage, setSelectedLicenseImage] = useState<string>('');
  const [selectedDriverName, setSelectedDriverName] = useState<string>('');

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const data = await driverService.getDrivers();
      setDrivers(data);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to load drivers';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDrivers();
    setRefreshing(false);
  };

  const getDriverStats = () => {
    const totalDrivers = drivers.length;
    const driversWithLicense = drivers.filter(d => d.license_number).length;
    const driversWithPhone = drivers.filter(d => d.phone).length;
    
    return {
      totalDrivers,
      driversWithLicense,
      driversWithPhone,
    };
  };

  const handleLicenseImagePress = (licenseImageUrl: string, driverName: string) => {
    setSelectedLicenseImage(licenseImageUrl);
    setSelectedDriverName(driverName);
    setShowLicenseModal(true);
  };

  const closeLicenseModal = () => {
    setShowLicenseModal(false);
    setSelectedLicenseImage('');
    setSelectedDriverName('');
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const stats = getDriverStats();

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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Drivers</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddDriver')} activeOpacity={0.7}>
          <Ionicons name="add" size={28} color={COLORS.surface} />
        </TouchableOpacity>
      </View>

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
              <Ionicons name="people" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.statValue}>{stats.totalDrivers}</Text>
            <Text style={styles.statLabel}>Total Drivers</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="card" size={20} color={COLORS.secondary} />
            </View>
            <Text style={styles.statValue}>{stats.driversWithLicense}</Text>
            <Text style={styles.statLabel}>With License</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="call" size={20} color={COLORS.fuel} />
            </View>
            <Text style={styles.statValue}>{stats.driversWithPhone}</Text>
            <Text style={styles.statLabel}>With Phone</Text>
          </View>
        </View>

        {/* Add Driver Button */}
        <View style={styles.addDriverContainer}>
          <CustomButton
            title="Add New Driver"
            onPress={() => navigation.navigate('AddDriver')}
            variant="outline"
            size="large"
          />
        </View>

        {/* Drivers List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Drivers</Text>
          </View>
          
          {drivers.length > 0 ? (
            drivers.map(driver => (
              <View key={driver.id} style={styles.driverCard}>
                <View style={styles.driverCardContent}>
                  <View style={styles.driverInfo}>
                    {driver.license_image_url ? (
                      <TouchableOpacity 
                        onPress={() => handleLicenseImagePress(driver.license_image_url!, driver.name)}
                        activeOpacity={0.7}
                        style={styles.avatarContainer}
                      >
                        <Image source={{ uri: `data:image/jpeg;base64,${driver.license_image_url}` }} style={styles.avatar} />
                        <View style={styles.avatarOverlay}>
                          <Ionicons name="eye" size={16} color={COLORS.surface} />
                        </View>
                      </TouchableOpacity>
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Ionicons name="person" size={20} color={COLORS.surface} />
                    </View>
                  )}
                    <View style={styles.driverDetails}>
                      <Text style={styles.driverName}>{driver.name}</Text>
                      {driver.phone && <Text style={styles.driverPhone}>{driver.phone}</Text>}
                      {driver.license_number && <Text style={styles.driverLicense}>License: {driver.license_number}</Text>}
                    </View>
                </View>
              </View>
            </View>
          ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={COLORS.textTertiary} />
              <Text style={styles.emptyStateText}>No drivers yet</Text>
              <Text style={styles.emptyStateSubtext}>Add your first driver to get started</Text>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* License Image Modal */}
      <Modal
        visible={showLicenseModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeLicenseModal}
      >
        <TouchableOpacity 
          style={styles.licenseModalOverlay}
          activeOpacity={1}
          onPress={closeLicenseModal}
        >
          <TouchableOpacity 
            style={styles.licenseModalContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.licenseModalHeader}>
              <Text style={styles.licenseModalTitle}>{selectedDriverName}'s License</Text>
              <TouchableOpacity
                onPress={closeLicenseModal}
                style={styles.licenseModalCloseButton}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <View style={styles.licenseImageContainer}>
              {/* Debug Info */}
              <View style={styles.debugContainer}>
                <Text style={styles.debugText}>Image Data Length: {selectedLicenseImage.length}</Text>
                <Text style={styles.debugText}>Driver: {selectedDriverName}</Text>
              </View>
              
              <Image
                source={{ uri: `data:image/jpeg;base64,${selectedLicenseImage}` }}
                style={styles.licenseImage}
                resizeMode="contain"
                onLoad={() => console.log('✅ License image loaded successfully!')}
                onError={(error) => {
                  console.log('❌ License image failed to load:', error);
                  console.log('Image data length:', selectedLicenseImage.length);
                  console.log('First 100 chars:', selectedLicenseImage.substring(0, 100));
                }}
              />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
  addDriverContainer: {
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
  driverCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    marginHorizontal: SIZES.spacingLg,
    marginBottom: SIZES.spacingMd,
    ...SIZES.shadowSubtle,
  },
  driverCardContent: {
    padding: SIZES.spacingLg,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverDetails: {
    flex: 1,
    marginLeft: SIZES.spacingMd,
  },
  driverName: {
    fontSize: SIZES.fontSizeLg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacingXs,
  },
  driverPhone: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacingXs,
  },
  driverLicense: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.textSecondary,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
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
  licenseModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.spacingLg,
  },
  licenseModalContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  licenseModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.spacingLg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  licenseModalTitle: {
    fontSize: SIZES.fontSizeLg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  licenseModalCloseButton: {
    padding: SIZES.spacingSm,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.background,
  },
  licenseImageContainer: {
    flex: 1,
    padding: SIZES.spacingLg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  licenseImage: {
    width: '100%',
    height: 400,
    maxWidth: 350,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
  },
  debugContainer: {
    backgroundColor: COLORS.primaryLight,
    padding: SIZES.spacingSm,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.spacingMd,
    alignItems: 'center',
  },
  debugText: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
});

export default DriversScreen;