import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { driverService } from '../services/driverService';

const DriversScreen: React.FC<any> = ({ navigation }) => {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const data = await driverService.getDrivers();
      setDrivers(data);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Drivers</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddDriver')} activeOpacity={0.7}>
          <Ionicons name="add" size={28} color={COLORS.surface} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : drivers.length === 0 ? (
          <Text style={styles.emptyText}>No drivers yet</Text>
        ) : (
          drivers.map(d => (
            <View key={d.id} style={styles.card}>
              <View style={styles.cardRowBetween}>
                <View style={styles.rowLeft}>
                  {d.license_image_url ? (
                    <Image source={{ uri: `data:image/jpeg;base64,${d.license_image_url}` }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Ionicons name="person" size={20} color={COLORS.surface} />
                    </View>
                  )}
                  <View>
                    <Text style={styles.cardTitle}>{d.name}</Text>
                    {d.phone ? <Text style={styles.cardSub}>{d.phone}</Text> : null}
                  </View>
                </View>
                <View>
                  {d.license_number ? <Text style={styles.cardSub}>License: {d.license_number}</Text> : null}
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SIZES.spacingLg, paddingTop: SIZES.spacingLg, paddingBottom: SIZES.spacingLg,
    backgroundColor: COLORS.surface, ...SIZES.shadowSubtle,
  },
  title: { fontSize: SIZES.fontSizeXxl, fontWeight: '700', color: COLORS.textPrimary },
  addButton: { width: 44, height: 44, backgroundColor: COLORS.primary, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  list: { flex: 1 },
  listContent: { padding: SIZES.spacingLg },
  loadingText: { color: COLORS.textSecondary },
  emptyText: { color: COLORS.textSecondary, textAlign: 'center', marginTop: SIZES.spacingXl },
  card: { backgroundColor: COLORS.surface, borderRadius: SIZES.radiusLg, padding: SIZES.spacingLg, marginBottom: SIZES.spacingMd, ...SIZES.shadowSubtle },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: SIZES.spacingSm, marginBottom: SIZES.spacingXs },
  cardRowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: SIZES.spacingMd },
  cardTitle: { fontSize: SIZES.fontSizeLg, fontWeight: '700', color: COLORS.textPrimary },
  cardSub: { fontSize: SIZES.fontSizeSm, color: COLORS.textSecondary },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
});

export default DriversScreen;


