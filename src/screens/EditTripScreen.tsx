import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { TripFormData, TripFormErrors, DieselPurchaseFormData, RtoEventFormData, DtoEventFormData, MunicipalitiesEventFormData, BorderEventFormData } from '../types';
import { truckService } from '../services/truckService';
import { tripService } from '../services/tripService';
import { supabase } from '../lib/supabase';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import DieselPurchaseForm from '../components/DieselPurchaseForm';
import AmountList from '../components/AmountList';

interface EditTripScreenProps {
  navigation: any;
  route: {
    params: {
      trip: any;
    };
  };
}

const EditTripScreen: React.FC<EditTripScreenProps> = ({ navigation, route }) => {
  const { trip } = route.params;
  
  const buildFormDataFromTrip = (t: any): TripFormData => ({
    truck_id: t.truck_id,
    source: t.source,
    destination: t.destination,
    diesel_purchases: (t.diesel_purchases || [])
      .slice()
      .sort((a: any, b: any) => {
        const ad = new Date(a.purchase_date || a.created_at || 0).getTime();
        const bd = new Date(b.purchase_date || b.created_at || 0).getTime();
        if (ad !== bd) return ad - bd;
        const ac = new Date(a.created_at || 0).getTime();
        const bc = new Date(b.created_at || 0).getTime();
        return ac - bc;
      })
      .map((p: any) => ({
      state: p.state,
      city: p.city || '',
      diesel_quantity: Number(p.diesel_quantity) || 0,
      diesel_price_per_liter: Number(p.diesel_price_per_liter) || 0,
      purchase_date: p.purchase_date,
    })) || [{
      state: '',
      city: '',
      diesel_quantity: 0,
      diesel_price_per_liter: 0,
      purchase_date: new Date().toISOString().split('T')[0],
    }],
    fast_tag_costs: (t.fast_tag_events || []).map((e: any) => Number(e.amount || 0)),
    mcd_costs: (t.mcd_events || []).map((e: any) => Number(e.amount || 0)),
    green_tax_costs: (t.green_tax_events || []).map((e: any) => Number(e.amount || 0)),
    rto_costs: (t.rto_events || []).map((e: any) => ({
      state: e.state || '',
      checkpoint: e.checkpoint || '',
      amount: Number(e.amount || 0),
      notes: e.notes || '',
      event_time: e.event_time || new Date().toISOString(),
    })),
    dto_costs: (t.dto_events || []).map((e: any) => ({
      state: e.state || '',
      checkpoint: e.checkpoint || '',
      amount: Number(e.amount || 0),
      notes: e.notes || '',
      event_time: e.event_time || new Date().toISOString(),
    })),
    municipalities_costs: (t.municipalities_events || []).map((e: any) => ({
      state: e.state || '',
      checkpoint: e.checkpoint || '',
      amount: Number(e.amount || 0),
      notes: e.notes || '',
      event_time: e.event_time || new Date().toISOString(),
    })),
    border_costs: (t.border_events || []).map((e: any) => ({
      state: e.state || '',
      checkpoint: e.checkpoint || '',
      amount: Number(e.amount || 0),
      notes: e.notes || '',
      event_time: e.event_time || new Date().toISOString(),
    })),
    repair_cost: Number((t as any).repair_cost || 0),
  });

  const [formData, setFormData] = useState<TripFormData>(buildFormDataFromTrip(trip));

  const [errors, setErrors] = useState<TripFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [trucks, setTrucks] = useState<any[]>([]);
  const [, setLoadingTrucks] = useState(true);

  useEffect(() => {
    loadTrucks();
    // Ensure fresh trip data (with diesel purchases and relations)
    (async () => {
      try {
        const fullTrip = await tripService.getTrip(trip.id);
        if (fullTrip) {
          setFormData(buildFormDataFromTrip(fullTrip));
        }
      } catch {
        console.warn('Failed to refresh trip, using route data');
      }
    })();
  }, []);

  const loadTrucks = async () => {
    try {
      setLoadingTrucks(true);
      const trucksData = await truckService.getTrucks();
      setTrucks(trucksData);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load trucks');
      console.error('Load trucks error:', error);
    } finally {
      setLoadingTrucks(false);
    }
  };

  const calculateTotalCost = () => {
    // Calculate totals from arrays
    const fastTagTotal = formData.fast_tag_costs.reduce((sum, cost) => sum + cost, 0);
    const mcdTotal = formData.mcd_costs.reduce((sum, cost) => sum + cost, 0);
    const greenTaxTotal = formData.green_tax_costs.reduce((sum, cost) => sum + cost, 0);
    const rtoTotal = formData.rto_costs.reduce((sum, cost) => sum + cost.amount, 0);
    const dtoTotal = formData.dto_costs.reduce((sum, cost) => sum + cost.amount, 0);
    const municipalitiesTotal = formData.municipalities_costs.reduce((sum, cost) => sum + cost.amount, 0);
    const borderTotal = formData.border_costs.reduce((sum, cost) => sum + cost.amount, 0);

    return tripService.calculateTotalCost({
      diesel_purchases: formData.diesel_purchases,
      fast_tag_cost: fastTagTotal,
      mcd_cost: mcdTotal,
      green_tax_cost: greenTaxTotal,
      rto_cost: rtoTotal,
      dto_cost: dtoTotal,
      municipalities_cost: municipalitiesTotal,
      border_cost: borderTotal,
      repair_cost: (formData as any).repair_cost || 0,
    });
  };

  const validateForm = (): boolean => {
    const newErrors: TripFormErrors = {};

    if (!formData.truck_id) {
      newErrors.truck_id = 'Please select a truck';
    }

    if (!formData.source.trim()) {
      newErrors.source = 'Source is required';
    }

    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination is required';
    }

    if (formData.diesel_purchases.length === 0) {
      newErrors.diesel_purchases = 'At least one diesel purchase is required';
    } else {
      // Validate each diesel purchase
      for (let i = 0; i < formData.diesel_purchases.length; i++) {
        const purchase = formData.diesel_purchases[i];
        if (!purchase.state.trim()) {
          newErrors.diesel_purchases = `State is required for purchase #${i + 1}`;
          break;
        }
        if (purchase.diesel_quantity <= 0) {
          newErrors.diesel_purchases = `Diesel quantity must be greater than 0 for purchase #${i + 1}`;
          break;
        }
        if (purchase.diesel_price_per_liter <= 0) {
          newErrors.diesel_purchases = `Diesel price must be greater than 0 for purchase #${i + 1}`;
          break;
        }
        if (!purchase.purchase_date.trim()) {
          newErrors.diesel_purchases = `Purchase date is required for purchase #${i + 1}`;
          break;
        }
      }
    }

    // Validate cost arrays
    if (formData.fast_tag_costs.some(cost => cost < 0)) {
      newErrors.fast_tag_costs = 'Fast tag costs cannot be negative';
    }

    if (formData.mcd_costs.some(cost => cost < 0)) {
      newErrors.mcd_costs = 'MCD costs cannot be negative';
    }

    if (formData.green_tax_costs.some(cost => cost < 0)) {
      newErrors.green_tax_costs = 'Green tax costs cannot be negative';
    }

    if (formData.rto_costs.some(cost => cost.amount < 0 || !cost.state.trim())) {
      newErrors.rto_costs = 'RTO costs must have valid amounts and states';
    }

    if (formData.dto_costs.some(cost => cost.amount < 0 || !cost.state.trim())) {
      newErrors.dto_costs = 'DTO costs must have valid amounts and states';
    }

    if (formData.municipalities_costs.some(cost => cost.amount < 0 || !cost.state.trim())) {
      newErrors.municipalities_costs = 'Municipalities costs must have valid amounts and states';
    }

    if (formData.border_costs.some(cost => cost.amount < 0 || !cost.state.trim())) {
      newErrors.border_costs = 'Border costs must have valid amounts and states';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const totalCost = calculateTotalCost();
      
      // Calculate totals from arrays
      const fastTagTotal = formData.fast_tag_costs.reduce((sum, cost) => sum + cost, 0);
      const mcdTotal = formData.mcd_costs.reduce((sum, cost) => sum + cost, 0);
      const greenTaxTotal = formData.green_tax_costs.reduce((sum, cost) => sum + cost, 0);
      const rtoTotal = formData.rto_costs.reduce((sum, cost) => sum + cost.amount, 0);
      const dtoTotal = formData.dto_costs.reduce((sum, cost) => sum + cost.amount, 0);
      const municipalitiesTotal = formData.municipalities_costs.reduce((sum, cost) => sum + cost.amount, 0);
      const borderTotal = formData.border_costs.reduce((sum, cost) => sum + cost.amount, 0);

      await tripService.updateTrip(trip.id, {
        truck_id: formData.truck_id,
        source: formData.source.trim(),
        destination: formData.destination.trim(),
        fast_tag_cost: fastTagTotal,
        mcd_cost: mcdTotal,
        green_tax_cost: greenTaxTotal,
        rto_cost: rtoTotal,
        dto_cost: dtoTotal,
        municipalities_cost: municipalitiesTotal,
        border_cost: borderTotal,
        repair_cost: (formData as any).repair_cost + ((formData as any).repair_extras || []).reduce((s:number,n:number)=>s+n,0),
        total_cost: totalCost,
      });

      // Replace RTO events
      const existingRto = (trip as any).rto_events || [];
      for (const e of existingRto) {
        try { await supabase.from('rto_events').delete().eq('id', e.id); } catch (e) { console.warn('Error deleting rto event:', e); }
      }
      for (const rtoCost of formData.rto_costs) {
        await supabase.from('rto_events').insert([{
          trip_id: trip.id,
          state: rtoCost.state,
          checkpoint: rtoCost.checkpoint || null,
          amount: rtoCost.amount,
          notes: rtoCost.notes || null,
          event_time: rtoCost.event_time || new Date().toISOString(),
          currency: 'INR'
        }]);
      }

      // Replace DTO events
      const existingDto = (trip as any).dto_events || [];
      for (const e of existingDto) {
        try { await supabase.from('dto_events').delete().eq('id', e.id); } catch (e) { console.warn('Error deleting dto event:', e); }
      }
      for (const dtoCost of formData.dto_costs) {
        await supabase.from('dto_events').insert([{
          trip_id: trip.id,
          state: dtoCost.state,
          checkpoint: dtoCost.checkpoint || null,
          amount: dtoCost.amount,
          notes: dtoCost.notes || null,
          event_time: dtoCost.event_time || new Date().toISOString(),
          currency: 'INR'
        }]);
      }

      // Replace Municipalities events
      const existingMunicipalities = (trip as any).municipalities_events || [];
      for (const e of existingMunicipalities) {
        try { await supabase.from('municipalities_events').delete().eq('id', e.id); } catch (e) { console.warn('Error deleting municipalities event:', e); }
      }
      for (const municipalitiesCost of formData.municipalities_costs) {
        await supabase.from('municipalities_events').insert([{
          trip_id: trip.id,
          state: municipalitiesCost.state,
          checkpoint: municipalitiesCost.checkpoint || null,
          amount: municipalitiesCost.amount,
          notes: municipalitiesCost.notes || null,
          event_time: municipalitiesCost.event_time || new Date().toISOString(),
          currency: 'INR'
        }]);
      }

      // Replace Border events
      const existingBorder = (trip as any).border_events || [];
      for (const e of existingBorder) {
        try { await supabase.from('border_events').delete().eq('id', e.id); } catch (e) { console.warn('Error deleting border event:', e); }
      }
      for (const borderCost of formData.border_costs) {
        await supabase.from('border_events').insert([{
          trip_id: trip.id,
          state: borderCost.state,
          checkpoint: borderCost.checkpoint || null,
          amount: borderCost.amount,
          notes: borderCost.notes || null,
          event_time: borderCost.event_time || new Date().toISOString(),
          currency: 'INR'
        }]);
      }

      // Replace fast tag events
      const existingFastTag = (trip as any).fast_tag_events || [];
      for (const e of existingFastTag) {
        try { await supabase.from('fast_tag_events').delete().eq('id', e.id); } catch (e) { console.warn('Error deleting fast tag event:', e); }
      }
      for (const amount of formData.fast_tag_costs.filter(cost => cost > 0)) {
        await supabase.from('fast_tag_events').insert([{
          trip_id: trip.id,
          amount,
          event_time: new Date().toISOString(),
          currency: 'INR'
        }]);
      }

      // Replace MCD events
      const existingMcd = (trip as any).mcd_events || [];
      for (const e of existingMcd) {
        try { await supabase.from('mcd_events').delete().eq('id', e.id); } catch (e) { console.warn('Error deleting mcd event:', e); }
      }
      for (const amount of formData.mcd_costs.filter(cost => cost > 0)) {
        await supabase.from('mcd_events').insert([{
          trip_id: trip.id,
          amount,
          event_time: new Date().toISOString(),
          currency: 'INR'
        }]);
      }

      // Replace green tax events
      const existingGreenTax = (trip as any).green_tax_events || [];
      for (const e of existingGreenTax) {
        try { await supabase.from('green_tax_events').delete().eq('id', e.id); } catch (e) { console.warn('Error deleting green tax event:', e); }
      }
      for (const amount of formData.green_tax_costs.filter(cost => cost > 0)) {
        await supabase.from('green_tax_events').insert([{
          trip_id: trip.id,
          amount,
          event_time: new Date().toISOString(),
          currency: 'INR'
        }]);
      }

      Alert.alert(
        'Success',
        'Trip updated successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update trip');
      console.error('Update trip error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
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
              setLoading(true);
              await tripService.deleteTrip(trip.id);
              Alert.alert(
                'Success',
                'Trip deleted successfully',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  },
                ]
              );
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete trip');
              console.error('Delete trip error:', error);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const addDieselPurchase = () => {
    const newPurchase: DieselPurchaseFormData = {
      state: '',
      city: '',
      diesel_quantity: 0,
      diesel_price_per_liter: 0,
      purchase_date: new Date().toISOString().split('T')[0],
    };
    setFormData(prev => ({
      ...prev,
      diesel_purchases: [...prev.diesel_purchases, newPurchase],
    }));
  };

  const updateDieselPurchase = (index: number, purchase: DieselPurchaseFormData) => {
    setFormData(prev => ({
      ...prev,
      diesel_purchases: prev.diesel_purchases.map((p, i) => i === index ? purchase : p),
    }));
  };

  const removeDieselPurchase = (index: number) => {
    setFormData(prev => ({
      ...prev,
      diesel_purchases: prev.diesel_purchases.filter((_, i) => i !== index),
    }));
  };

  // RTO costs management
  const addRtoCost = () => {
    setFormData(prev => ({
      ...prev,
      rto_costs: [...prev.rto_costs, { state: '', checkpoint: '', amount: 0, notes: '', event_time: new Date().toISOString() }]
    }));
  };

  const updateRtoCost = (index: number, updated: Partial<RtoEventFormData>) => {
    setFormData(prev => ({
      ...prev,
      rto_costs: prev.rto_costs.map((item, i) => i === index ? { ...item, ...updated } : item)
    }));
  };

  const removeRtoCost = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rto_costs: prev.rto_costs.filter((_, i) => i !== index)
    }));
  };

  // DTO costs management
  const addDtoCost = () => {
    setFormData(prev => ({
      ...prev,
      dto_costs: [...prev.dto_costs, { state: '', checkpoint: '', amount: 0, notes: '', event_time: new Date().toISOString() }]
    }));
  };

  const updateDtoCost = (index: number, updated: Partial<DtoEventFormData>) => {
    setFormData(prev => ({
      ...prev,
      dto_costs: prev.dto_costs.map((item, i) => i === index ? { ...item, ...updated } : item)
    }));
  };

  const removeDtoCost = (index: number) => {
    setFormData(prev => ({
      ...prev,
      dto_costs: prev.dto_costs.filter((_, i) => i !== index)
    }));
  };

  // Municipalities costs management
  const addMunicipalitiesCost = () => {
    setFormData(prev => ({
      ...prev,
      municipalities_costs: [...prev.municipalities_costs, { state: '', checkpoint: '', amount: 0, notes: '', event_time: new Date().toISOString() }]
    }));
  };

  const updateMunicipalitiesCost = (index: number, updated: Partial<MunicipalitiesEventFormData>) => {
    setFormData(prev => ({
      ...prev,
      municipalities_costs: prev.municipalities_costs.map((item, i) => i === index ? { ...item, ...updated } : item)
    }));
  };

  const removeMunicipalitiesCost = (index: number) => {
    setFormData(prev => ({
      ...prev,
      municipalities_costs: prev.municipalities_costs.filter((_, i) => i !== index)
    }));
  };

  // Border costs management
  const addBorderCost = () => {
    setFormData(prev => ({
      ...prev,
      border_costs: [...prev.border_costs, { state: '', checkpoint: '', amount: 0, notes: '', event_time: new Date().toISOString() }]
    }));
  };

  const updateBorderCost = (index: number, updated: Partial<BorderEventFormData>) => {
    setFormData(prev => ({
      ...prev,
      border_costs: prev.border_costs.map((item, i) => i === index ? { ...item, ...updated } : item)
    }));
  };

  const removeBorderCost = (index: number) => {
    setFormData(prev => ({
      ...prev,
      border_costs: prev.border_costs.filter((_, i) => i !== index)
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.title}>Edit Trip</Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              activeOpacity={0.7}
            >
              <Ionicons name="trash" size={24} color={COLORS.error} />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Truck Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Truck</Text>
              <View style={styles.pickerContainer}>
                {trucks.map(truck => (
                  <TouchableOpacity
                    key={truck.id}
                    style={[
                      styles.truckOption,
                      formData.truck_id === truck.id && styles.truckOptionSelected,
                    ]}
                    onPress={() => setFormData({ ...formData, truck_id: truck.id })}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.truckOptionText,
                        formData.truck_id === truck.id && styles.truckOptionTextSelected,
                      ]}
                    >
                      {truck.name} - {truck.truck_number}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.truck_id && <Text style={styles.errorText}>{errors.truck_id}</Text>}
            </View>

            

            {/* Source and Destination */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <CustomInput
                  label="Source"
                  value={formData.source}
                  onChangeText={(text) => setFormData({ ...formData, source: text })}
                  placeholder="Enter source city"
                  error={errors.source}
                />
              </View>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <CustomInput
                  label="Destination"
                  value={formData.destination}
                  onChangeText={(text) => setFormData({ ...formData, destination: text })}
                  placeholder="Enter destination city"
                  error={errors.destination}
                />
              </View>
            </View>

            {/* Diesel Purchases */}
            <View style={styles.inputGroup}>
              <View style={styles.dieselHeader}>
                <Text style={styles.label}>Diesel Purchases</Text>
                <CustomButton
                  title="Add Purchase"
                  onPress={addDieselPurchase}
                  variant="outline"
                  size="small"
                />
              </View>
              
              {formData.diesel_purchases.map((purchase, index) => (
                <DieselPurchaseForm
                  key={index}
                  purchase={purchase}
                  errors={{}}
                  onUpdate={(updatedPurchase) => updateDieselPurchase(index, updatedPurchase)}
                  onRemove={() => removeDieselPurchase(index)}
                  index={index}
                  canRemove={formData.diesel_purchases.length > 1}
                />
              ))}
              
              {errors.diesel_purchases && (
                <Text style={styles.errorText}>{errors.diesel_purchases}</Text>
              )}
            </View>

            {/* Additional Costs */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Fast Tag Costs</Text>
                {formData.fast_tag_costs.map((cost, index) => (
                  <View key={index} style={styles.costItemContainer}>
                    <CustomInput
                      label={`#${index + 1} Fast Tag Cost (₹)`}
                      placeholder="0"
                      value={cost.toString()}
                      onChangeText={(text) => {
                        const newCosts = [...formData.fast_tag_costs];
                        newCosts[index] = parseFloat(text) || 0;
                        setFormData(prev => ({ ...prev, fast_tag_costs: newCosts }));
                      }}
                      keyboardType="numeric"
                      error={errors.fast_tag_costs}
                    />
                    {formData.fast_tag_costs.length > 1 && (
                      <CustomButton
                        title="Remove"
                        onPress={() => {
                          const newCosts = formData.fast_tag_costs.filter((_, i) => i !== index);
                          setFormData(prev => ({ ...prev, fast_tag_costs: newCosts }));
                        }}
                        variant="outline"
                        size="small"
                      />
                    )}
                  </View>
                ))}
                <CustomButton
                  title="Add Fast Tag Cost"
                  onPress={() => {
                    setFormData(prev => ({ ...prev, fast_tag_costs: [...prev.fast_tag_costs, 0] }));
                  }}
                  variant="outline"
                  size="small"
                />
              </View>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>MCD Costs</Text>
                {formData.mcd_costs.map((cost, index) => (
                  <View key={index} style={styles.costItemContainer}>
                    <CustomInput
                      label={`#${index + 1} MCD Cost (₹)`}
                      placeholder="0"
                      value={cost.toString()}
                      onChangeText={(text) => {
                        const newCosts = [...formData.mcd_costs];
                        newCosts[index] = parseFloat(text) || 0;
                        setFormData(prev => ({ ...prev, mcd_costs: newCosts }));
                      }}
                      keyboardType="numeric"
                      error={errors.mcd_costs}
                    />
                    {formData.mcd_costs.length > 1 && (
                      <CustomButton
                        title="Remove"
                        onPress={() => {
                          const newCosts = formData.mcd_costs.filter((_, i) => i !== index);
                          setFormData(prev => ({ ...prev, mcd_costs: newCosts }));
                        }}
                        variant="outline"
                        size="small"
                      />
                    )}
                  </View>
                ))}
                <CustomButton
                  title="Add MCD Cost"
                  onPress={() => {
                    setFormData(prev => ({ ...prev, mcd_costs: [...prev.mcd_costs, 0] }));
                  }}
                  variant="outline"
                  size="small"
                />
              </View>
            </View>

            {/* Other Costs */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Green Tax Costs</Text>
              {formData.green_tax_costs.map((cost, index) => (
                <View key={index} style={styles.costItemContainer}>
                  <CustomInput
                    label={`#${index + 1} Green Tax Cost (₹)`}
                    placeholder="0"
                    value={cost.toString()}
                    onChangeText={(text) => {
                      const newCosts = [...formData.green_tax_costs];
                      newCosts[index] = parseFloat(text) || 0;
                      setFormData(prev => ({ ...prev, green_tax_costs: newCosts }));
                    }}
                    keyboardType="numeric"
                    error={errors.green_tax_costs}
                  />
                  {formData.green_tax_costs.length > 1 && (
                    <CustomButton
                      title="Remove"
                      onPress={() => {
                        const newCosts = formData.green_tax_costs.filter((_, i) => i !== index);
                        setFormData(prev => ({ ...prev, green_tax_costs: newCosts }));
                      }}
                      variant="outline"
                      size="small"
                    />
                  )}
                </View>
              ))}
              <CustomButton
                title="Add Green Tax Cost"
                onPress={() => {
                  setFormData(prev => ({ ...prev, green_tax_costs: [...prev.green_tax_costs, 0] }));
                }}
                variant="outline"
                size="small"
              />
              <CustomInput
                label="Repair/Defect Cost (₹)"
                value={((formData as any).repair_cost || 0).toString()}
                onChangeText={(text) => setFormData({ ...formData, repair_cost: Number(text) || 0 } as any)}
                placeholder="0"
                keyboardType="numeric"
                error={(errors as any).repair_cost}
              />
              <AmountList
                title="Repair/Defect Cost (₹)"
                items={((formData as any).repair_extras || []) as any}
                onAdd={() => setFormData(prev => ({...prev, repair_extras: ([...(prev as any).repair_extras || [], 0]) as any}))}
                onUpdate={(i, val) => setFormData(prev => ({...prev, repair_extras: ([...(prev as any).repair_extras || []].map((n:number, idx:number)=> idx===i ? val : n)) as any}))}
                onRemove={(i) => setFormData(prev => ({...prev, repair_extras: ([...(prev as any).repair_extras || []].filter((_:number, idx:number)=> idx!==i)) as any}))}
              />
            </View>

            {/* RTO Costs */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>RTO Costs</Text>
              {formData.rto_costs.map((cost, index) => (
                <View key={index} style={styles.costItemContainer}>
                  <CustomInput
                    label={`#${index + 1} RTO Cost (₹)`}
                    placeholder="0"
                    value={cost.amount.toString()}
                    onChangeText={(text) => updateRtoCost(index, { amount: parseFloat(text) || 0 })}
                    keyboardType="numeric"
                    error={errors.rto_costs}
                  />
                  <CustomInput
                    label="State"
                    placeholder="e.g., Uttar Pradesh"
                    value={cost.state}
                    onChangeText={(text) => updateRtoCost(index, { state: text })}
                  />
                  <CustomInput
                    label="Checkpoint (optional)"
                    placeholder="e.g., Kanpur RTO"
                    value={cost.checkpoint || ''}
                    onChangeText={(text) => updateRtoCost(index, { checkpoint: text })}
                  />
                  <CustomInput
                    label="Notes (optional)"
                    placeholder="Additional details"
                    value={cost.notes || ''}
                    onChangeText={(text) => updateRtoCost(index, { notes: text })}
                  />
                  <CustomButton
                    title="Remove"
                    onPress={() => removeRtoCost(index)}
                    variant="outline"
                    size="small"
                  />
                </View>
              ))}
              <CustomButton
                title="Add RTO Cost"
                onPress={addRtoCost}
                variant="outline"
                size="small"
              />
            </View>

            {/* DTO Costs */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>DTO Costs</Text>
              {formData.dto_costs.map((cost, index) => (
                <View key={index} style={styles.costItemContainer}>
                  <CustomInput
                    label={`#${index + 1} DTO Cost (₹)`}
                    placeholder="0"
                    value={cost.amount.toString()}
                    onChangeText={(text) => updateDtoCost(index, { amount: parseFloat(text) || 0 })}
                    keyboardType="numeric"
                    error={errors.dto_costs}
                  />
                  <CustomInput
                    label="State"
                    placeholder="e.g., Uttar Pradesh"
                    value={cost.state}
                    onChangeText={(text) => updateDtoCost(index, { state: text })}
                  />
                  <CustomInput
                    label="Checkpoint (optional)"
                    placeholder="e.g., Kanpur DTO"
                    value={cost.checkpoint || ''}
                    onChangeText={(text) => updateDtoCost(index, { checkpoint: text })}
                  />
                  <CustomInput
                    label="Notes (optional)"
                    placeholder="Additional details"
                    value={cost.notes || ''}
                    onChangeText={(text) => updateDtoCost(index, { notes: text })}
                  />
                  <CustomButton
                    title="Remove"
                    onPress={() => removeDtoCost(index)}
                    variant="outline"
                    size="small"
                  />
                </View>
              ))}
              <CustomButton
                title="Add DTO Cost"
                onPress={addDtoCost}
                variant="outline"
                size="small"
              />
            </View>

            {/* Municipalities Costs */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Municipalities Costs</Text>
              {formData.municipalities_costs.map((cost, index) => (
                <View key={index} style={styles.costItemContainer}>
                  <CustomInput
                    label={`#${index + 1} Municipalities Cost (₹)`}
                    placeholder="0"
                    value={cost.amount.toString()}
                    onChangeText={(text) => updateMunicipalitiesCost(index, { amount: parseFloat(text) || 0 })}
                    keyboardType="numeric"
                    error={errors.municipalities_costs}
                  />
                  <CustomInput
                    label="State"
                    placeholder="e.g., Uttar Pradesh"
                    value={cost.state}
                    onChangeText={(text) => updateMunicipalitiesCost(index, { state: text })}
                  />
                  <CustomInput
                    label="Checkpoint (optional)"
                    placeholder="e.g., Kanpur Municipal Office"
                    value={cost.checkpoint || ''}
                    onChangeText={(text) => updateMunicipalitiesCost(index, { checkpoint: text })}
                  />
                  <CustomInput
                    label="Notes (optional)"
                    placeholder="Additional details"
                    value={cost.notes || ''}
                    onChangeText={(text) => updateMunicipalitiesCost(index, { notes: text })}
                  />
                  <CustomButton
                    title="Remove"
                    onPress={() => removeMunicipalitiesCost(index)}
                    variant="outline"
                    size="small"
                  />
                </View>
              ))}
              <CustomButton
                title="Add Municipalities Cost"
                onPress={addMunicipalitiesCost}
                variant="outline"
                size="small"
              />
            </View>

            {/* Border Costs */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Border Costs</Text>
              {formData.border_costs.map((cost, index) => (
                <View key={index} style={styles.costItemContainer}>
                  <CustomInput
                    label={`#${index + 1} Border Cost (₹)`}
                    placeholder="0"
                    value={cost.amount.toString()}
                    onChangeText={(text) => updateBorderCost(index, { amount: parseFloat(text) || 0 })}
                    keyboardType="numeric"
                    error={errors.border_costs}
                  />
                  <CustomInput
                    label="State"
                    placeholder="e.g., Uttar Pradesh"
                    value={cost.state}
                    onChangeText={(text) => updateBorderCost(index, { state: text })}
                  />
                  <CustomInput
                    label="Checkpoint (optional)"
                    placeholder="e.g., Agra Border"
                    value={cost.checkpoint || ''}
                    onChangeText={(text) => updateBorderCost(index, { checkpoint: text })}
                  />
                  <CustomInput
                    label="Notes (optional)"
                    placeholder="Additional details"
                    value={cost.notes || ''}
                    onChangeText={(text) => updateBorderCost(index, { notes: text })}
                  />
                  <CustomButton
                    title="Remove"
                    onPress={() => removeBorderCost(index)}
                    variant="outline"
                    size="small"
                  />
                </View>
              ))}
              <CustomButton
                title="Add Border Cost"
                onPress={addBorderCost}
                variant="outline"
                size="small"
              />
            </View>

            {/* Total Cost Display */}
            <View style={styles.totalCostContainer}>
              <Text style={styles.totalCostLabel}>Total Cost:</Text>
              <Text style={styles.totalCostValue}>₹{calculateTotalCost().toLocaleString('en-IN')}</Text>
              <Text style={styles.totalCostBreakdown}>
                Diesel: ₹{formData.diesel_purchases.reduce((total, purchase) => 
                  total + (purchase.diesel_quantity * purchase.diesel_price_per_liter), 0
                ).toLocaleString('en-IN')} | 
                Other: ₹{(formData.fast_tag_costs.reduce((sum, cost) => sum + cost, 0) + formData.mcd_costs.reduce((sum, cost) => sum + cost, 0) + formData.green_tax_costs.reduce((sum, cost) => sum + cost, 0) + formData.rto_costs.reduce((sum, cost) => sum + cost.amount, 0) + formData.dto_costs.reduce((sum, cost) => sum + cost.amount, 0) + formData.municipalities_costs.reduce((sum, cost) => sum + cost.amount, 0) + formData.border_costs.reduce((sum, cost) => sum + cost.amount, 0) + ((formData as any).repair_cost || 0)).toLocaleString('en-IN')}
              </Text>
            </View>

            {/* Submit Button */}
            <CustomButton
              title="Update Trip"
              onPress={handleSubmit}
              variant="primary"
              size="large"
              loading={loading}
              disabled={loading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoidingView: {
    flex: 1,
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
  backButton: {
    padding: SIZES.spacingXs,
    borderRadius: SIZES.radius,
  },
  title: {
    fontSize: SIZES.fontSizeXl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  deleteButton: {
    padding: SIZES.spacingXs,
    borderRadius: SIZES.radius,
  },
  form: {
    padding: SIZES.spacingLg,
  },
  inputGroup: {
    marginBottom: SIZES.spacingLg,
  },
  label: {
    fontSize: SIZES.fontSizeMd,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacingSm,
  },
  row: {
    flexDirection: 'row',
    gap: SIZES.spacingMd,
  },
  halfWidth: {
    flex: 1,
  },
  pickerContainer: {
    gap: SIZES.spacingSm,
  },
  truckOption: {
    padding: SIZES.spacingMd,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.surface,
  },
  truckOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  truckOptionText: {
    fontSize: SIZES.fontSizeMd,
    color: COLORS.textPrimary,
    textAlign: 'center',
    fontWeight: '500',
  },
  truckOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  totalCostContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.spacingLg,
    backgroundColor: COLORS.primaryLight,
    borderRadius: SIZES.radiusLg,
    marginBottom: SIZES.spacingXl,
  },
  totalCostLabel: {
    fontSize: SIZES.fontSizeLg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  totalCostValue: {
    fontSize: SIZES.fontSizeXl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  errorText: {
    color: COLORS.error,
    fontSize: SIZES.fontSizeSm,
    marginTop: SIZES.spacingXs,
  },
  dieselHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacingLg,
  },
  totalCostBreakdown: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.textTertiary,
    textAlign: 'center',
    fontWeight: '500',
    marginTop: SIZES.spacingSm,
  },
  costItemContainer: {
    marginBottom: SIZES.spacingMd,
  },
});

export default EditTripScreen;
