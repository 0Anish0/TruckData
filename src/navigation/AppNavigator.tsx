import React from 'react';
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

// Enhanced Screens
import EnhancedAuthScreen from '../screens/AuthScreen';
import EnhancedDashboardScreen from '../screens/DashboardScreen';
import EnhancedTripsScreen from '../screens/TripsScreen';
import EnhancedTrucksScreen from '../screens/TrucksScreen';
import EnhancedDriversScreen from '../screens/DriversScreen';
import EnhancedAddTripScreen from '../screens/AddTripScreen';
import EnhancedAddTruckScreen from '../screens/AddTruckScreen';
import EnhancedAddDriverScreen from '../screens/AddDriverScreen';
import EnhancedTruckTripsScreen from '../screens/TruckTripsScreen';

const Tab = createBottomTabNavigator<RootStackParamList>();
const Stack = createStackNavigator();

const DashboardStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DashboardMain" component={EnhancedDashboardScreen} />
    <Stack.Screen name="AddTrip" component={EnhancedAddTripScreen} />
    <Stack.Screen name="AddTruck" component={EnhancedAddTruckScreen} />
    <Stack.Screen name="TruckTrips" component={EnhancedTruckTripsScreen as React.ComponentType} />
    <Stack.Screen name="EditTrip" component={EnhancedAddTripScreen} />
    <Stack.Screen name="EditTruck" component={EnhancedAddTruckScreen} />
  </Stack.Navigator>
);

const TripsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="TripsMain" component={EnhancedTripsScreen} />
    <Stack.Screen name="AddTrip" component={EnhancedAddTripScreen} />
    <Stack.Screen name="EditTrip" component={EnhancedAddTripScreen} />
  </Stack.Navigator>
);

const TrucksStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="TrucksMain" component={EnhancedTrucksScreen} />
    <Stack.Screen name="AddTruck" component={EnhancedAddTruckScreen} />
    <Stack.Screen name="EditTrip" component={EnhancedAddTripScreen} />
    <Stack.Screen name="EditTruck" component={EnhancedAddTruckScreen} />
  </Stack.Navigator>
);

const DriversStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DriversMain" component={EnhancedDriversScreen} />
    <Stack.Screen name="AddDriver" component={EnhancedAddDriverScreen} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { user, loading } = useAuth();
  const insets = useSafeAreaInsets();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Auth" component={EnhancedAuthScreen} />
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
