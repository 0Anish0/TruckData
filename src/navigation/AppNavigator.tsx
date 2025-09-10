import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';

// Screens
import AuthScreen from '../screens/AuthScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AddTripScreen from '../screens/AddTripScreen';
import AddTruckScreen from '../screens/AddTruckScreen';
import TripsScreen from '../screens/TripsScreen';
import TrucksScreen from '../screens/TrucksScreen';
import TruckTripsScreen from '../screens/TruckTripsScreen';
import EditTripScreen from '../screens/EditTripScreen';
import EditTruckScreen from '../screens/EditTruckScreen';
import DriversScreen from '../screens/DriversScreen';
import AddDriverScreen from '../screens/AddDriverScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const DashboardStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DashboardMain" component={DashboardScreen} />
    <Stack.Screen name="AddTrip" component={AddTripScreen} />
    <Stack.Screen name="AddTruck" component={AddTruckScreen} />
    <Stack.Screen name="TruckTrips" component={TruckTripsScreen} />
    <Stack.Screen name="EditTrip" component={EditTripScreen} />
    <Stack.Screen name="EditTruck" component={EditTruckScreen} />
  </Stack.Navigator>
);

const TripsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="TripsMain" component={TripsScreen} />
    <Stack.Screen name="AddTrip" component={AddTripScreen} />
    <Stack.Screen name="EditTrip" component={EditTripScreen} />
  </Stack.Navigator>
);

const TrucksStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="TrucksMain" component={TrucksScreen} />
    <Stack.Screen name="AddTruck" component={AddTruckScreen} />
    <Stack.Screen name="EditTrip" component={EditTripScreen} />
    <Stack.Screen name="EditTruck" component={EditTruckScreen} />
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
          <Stack.Screen name="Auth" component={AuthScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <SafeAreaView style={styles.container} edges={['top']}>
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
                height: 60 + insets.bottom,
                ...SIZES.shadowStrong,
              },
              tabBarLabelStyle: {
                fontSize: SIZES.fontSizeXs,
                fontWeight: '600',
                marginTop: SIZES.spacingXs,
              },
              headerShown: false,
            })}
          >
            <Tab.Screen name="Dashboard" component={DashboardStack} />
            <Tab.Screen name="Trips" component={TripsStack} />
            <Tab.Screen name="Trucks" component={TrucksStack} />
            <Tab.Screen name="Drivers" component={DriversStack} />
          </Tab.Navigator>
        </SafeAreaView>
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
