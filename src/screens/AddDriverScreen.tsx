import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert, Image, TouchableOpacity } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { driverService } from '../services/driverService';
import * as ImagePicker from 'expo-image-picker';

const AddDriverScreen: React.FC<any> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState<string>('');
  const [phone, setPhone] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseBase64, setLicenseBase64] = useState('');
  const [loading, setLoading] = useState(false);

  const requestMediaPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow photo library access to pick images.');
      return false;
    }
    return true;
  };

  const handlePickImage = async () => {
    const ok = await requestMediaPermission();
    if (!ok) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setLicenseBase64(asset.base64 || '');
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Name is required');
      return;
    }
    setLoading(true);
    try {
      await driverService.createDriver({
        name: name.trim(),
        age: age ? Number(age) : undefined,
        phone: phone || undefined,
        license_number: licenseNumber || undefined,
        license_image_base64: licenseBase64 || undefined,
      });
      Alert.alert('Success', 'Driver added', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to add driver');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Add Driver</Text>

        <CustomInput label="Name" value={name} onChangeText={setName} placeholder="Driver name" required />
        <CustomInput label="Age" value={age} onChangeText={setAge} placeholder="e.g., 32" keyboardType="numeric" />
        <CustomInput label="Phone" value={phone} onChangeText={setPhone} placeholder="e.g., 9876543210" />
        <CustomInput label="License Number" value={licenseNumber} onChangeText={setLicenseNumber} placeholder="e.g., DL-XXXX" />
        <View style={styles.imagePickerRow}>
          <Text style={styles.label}>License Image</Text>
          <TouchableOpacity style={styles.pickButton} onPress={handlePickImage} activeOpacity={0.8}>
            <Text style={styles.pickButtonText}>{licenseBase64 ? 'Change Image' : 'Pick Image'}</Text>
          </TouchableOpacity>
        </View>
        {licenseBase64 ? (
          <Image
            source={{ uri: `data:image/jpeg;base64,${licenseBase64}` }}
            style={styles.preview}
          />
        ) : null}

        <CustomButton title="Save Driver" onPress={handleSubmit} variant="primary" size="large" loading={loading} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: SIZES.spacingLg },
  title: { fontSize: SIZES.fontSizeXl, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SIZES.spacingLg },
  imagePickerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.spacingMd },
  label: { fontSize: SIZES.fontSizeMd, fontWeight: '600', color: COLORS.textPrimary },
  pickButton: { paddingVertical: SIZES.spacingSm, paddingHorizontal: SIZES.spacingMd, backgroundColor: COLORS.primary, borderRadius: SIZES.radius },
  pickButtonText: { color: COLORS.surface, fontWeight: '700' },
  preview: { width: '100%', height: 160, borderRadius: SIZES.radiusLg, marginBottom: SIZES.spacingLg, backgroundColor: COLORS.background },
});

export default AddDriverScreen;


