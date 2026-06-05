import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../theme';

// Screens
import HomeScreen from '../screens/HomeScreen';
import RecordsScreen from '../screens/RecordsScreen';
import AppointmentsScreen from '../screens/AppointmentsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ExploreDoctorsScreen from '../screens/ExploreDoctorsScreen';
import MedicationsScreen from '../screens/MedicationsScreen';
import DoctorProfileScreen from '../screens/DoctorProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import LoginScreen from '../screens/LoginScreen';
import SecurityScreen from '../screens/SecurityScreen';
import DoctorScanScreen from '../screens/DoctorScanScreen';
import AllergiesScreen from '../screens/AllergiesScreen';
import HelpCenterScreen from '../screens/HelpCenterScreen';
import DataPrivacyScreen from '../screens/DataPrivacyScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import QRGenerateScreen from '../screens/QRGenerateScreen';
import ConsentManagerScreen from '../screens/ConsentManagerScreen';
import AccessHistoryScreen from '../screens/AccessHistoryScreen';
import { AccessRequestsScreen } from '../screens/AccessRequestsScreen';
import { useStore } from '../store/useStore';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Records') {
            iconName = focused ? 'file-document' : 'file-document-outline';
          } else if (route.name === 'Appointments') {
            iconName = focused ? 'calendar-check' : 'calendar-blank-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account' : 'account-outline';
          }

          return <MaterialCommunityIcons name={iconName} size={28} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.neutral400,
        headerShown: false,
        tabBarStyle: {
          height: 64,
          paddingBottom: 12,
          paddingTop: 8,
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.neutral200,
          borderWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: FontSize.bodySmall,
          fontWeight: FontWeight.bold,
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Records" component={RecordsScreen} />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  // Auth-gated navigation: always starts at Login if not authenticated
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // Auth screens
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          // App screens — only accessible when authenticated
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="ExploreDoctors" component={ExploreDoctorsScreen} />
            <Stack.Screen name="Medications" component={MedicationsScreen} />
            <Stack.Screen name="DoctorProfile" component={DoctorProfileScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Security" component={SecurityScreen} />
            <Stack.Screen name="DoctorScan" component={DoctorScanScreen} />
            <Stack.Screen name="Allergies" component={AllergiesScreen} />
            <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
            <Stack.Screen name="DataPrivacy" component={DataPrivacyScreen} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
            <Stack.Screen name="QRGenerate" component={QRGenerateScreen} />
            <Stack.Screen name="ConsentManager" component={ConsentManagerScreen} />
            <Stack.Screen name="AccessHistory" component={AccessHistoryScreen} />
            <Stack.Screen name="AccessRequests" component={AccessRequestsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

