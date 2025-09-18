import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import {
  RootStackParamList
} from '../types/navigation';

// Screens
import SplashScreen from '../screens/SplashScreen';
import AuthScreen from '../screens/AuthScreen';
import DashboardScreen from '../screens/DashboardScreen';
import TripsScreen from '../screens/TripsScreen';
import TrucksScreen from '../screens/TrucksScreen';
import DriversScreen from '../screens/DriversScreen';
import AddTripScreen from '../screens/AddTripScreen';
import AddTruckScreen from '../screens/AddTruckScreen';
import AddDriverScreen from '../screens/AddDriverScreen';
import TruckTripsScreen from '../screens/TruckTripsScreen';

const Tab = createBottomTabNavigator<RootStackParamList>();
const Stack = createStackNavigator();

const DashboardStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DashboardMain" component={DashboardScreen} />
    <Stack.Screen name="AddTrip" component={AddTripScreen} />
    <Stack.Screen name="AddTruck" component={AddTruckScreen} />
    <Stack.Screen name="TruckTrips" component={TruckTripsScreen as React.ComponentType} />
    <Stack.Screen name="EditTrip" component={AddTripScreen} />
    <Stack.Screen name="EditTruck" component={AddTruckScreen} />
  </Stack.Navigator>
);

const TripsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="TripsMain" component={TripsScreen} />
    <Stack.Screen name="AddTrip" component={AddTripScreen} />
    <Stack.Screen name="EditTrip" component={AddTripScreen} />
  </Stack.Navigator>
);

const TrucksStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="TrucksMain" component={TrucksScreen} />
    <Stack.Screen name="AddTruck" component={AddTruckScreen} />
    <Stack.Screen name="EditTrip" component={AddTripScreen} />
    <Stack.Screen name="EditTruck" component={AddTruckScreen} />
  </Stack.Navigator>
);

const DriversStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DriversMain" component={DriversScreen} />
    <Stack.Screen name="AddDriver" component={AddDriverScreen} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { user, loading } = useAuth();
  const insets = useSafeAreaInsets();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show splash screen for initial app load
    if (!loading) {
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 4500); // Match splash screen duration

      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Show splash screen on initial load
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // Show loading while checking auth state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Show auth screen if not logged in
  if (!user) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Auth" component={AuthScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap;

              if (route.name === 'Dashboard') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Trips') {
                iconName = focused ? 'map' : 'map-outline';
              } else if (route.name === 'Trucks') {
                iconName = focused ? 'car-sport' : 'car-sport-outline';
              } else if (route.name === 'Drivers') {
                iconName = focused ? 'person' : 'person-outline';
              } else {
                iconName = 'help-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: COLORS.textTertiary,
            tabBarStyle: {
              backgroundColor: COLORS.surface,
              borderTopWidth: 1,
              borderTopColor: COLORS.border,
              paddingTop: SIZES.spacingSm,
              paddingBottom: insets.bottom,
              height: 70 + insets.bottom,
              ...SIZES.shadowStrong,
            },
            tabBarLabelStyle: {
              fontSize: SIZES.fontSizeXs,
              fontWeight: '600',
              marginTop: SIZES.spacingXs,
              marginBottom: SIZES.spacingXs,
            },
            tabBarItemStyle: {
              paddingVertical: SIZES.spacingXs,
            },
            headerShown: false,
          })}
        >
          <Tab.Screen name="Dashboard" component={DashboardStack} />
          <Tab.Screen name="Trips" component={TripsStack} />
          <Tab.Screen name="Trucks" component={TrucksStack} />
          <Tab.Screen name="Drivers" component={DriversStack} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
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
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: SIZES.fontSizeLg,
    color: COLORS.textSecondary,
  },
});

export default AppNavigator;
