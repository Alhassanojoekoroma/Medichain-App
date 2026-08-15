import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight } from '../theme';
import { useStore } from '../store/useStore';
import { MobileSessionGuard } from '../components/MobileSessionGuard';
import { recordMobileSessionActivity } from '../services/sessionActivity';

// ── Auth & Onboarding screens ─────────────────────────────────────────────────
import SplashScreen          from '../screens/SplashScreen';
import OnboardingScreen      from '../screens/OnboardingScreen';
import LoginScreen           from '../screens/LoginScreen';
import CreateAccountScreen   from '../screens/CreateAccountScreen';

// ── Tab screens ───────────────────────────────────────────────────────────────
import HomeScreen            from '../screens/HomeScreen';
import ProfileScreen         from '../screens/ProfileScreen';

// ── Home stack screens ────────────────────────────────────────────────────────
import RecordsScreen         from '../screens/RecordsScreen';
import RecordDetailScreen    from '../screens/RecordDetailScreen';
import AccessLogScreen       from '../screens/AccessLogScreen';
import { AccessRequestsScreen } from '../screens/AccessRequestsScreen';
import SessionManagementScreen from '../screens/SessionManagementScreen';
import AccountRecoveryScreen from '../screens/AccountRecoveryScreen';
import LanguageScreen from '../screens/LanguageScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// ─── 3-tab bottom navigator ───────────────────────────────────────────────────
// Exactly 3 tabs — always visible: Home | Records | Profile

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          height:          64,
          paddingBottom:   12,
          paddingTop:       8,
          backgroundColor: Colors.white,
          borderTopWidth:  1,
          borderTopColor:  Colors.border,
          elevation:        0,
          shadowOpacity:    0,
        },
        tabBarLabelStyle: {
          fontSize:   FontSize.label,
          fontWeight: FontWeight.medium,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, [string, string]> = {
            Home:    ['home',        'home-outline'],
            Records: ['document-text', 'document-text-outline'],
            Profile: ['person',      'person-outline'],
          };
          const [active, inactive] = icons[route.name] ?? ['help-circle', 'help-circle-outline'];
          return <Ionicons name={(focused ? active : inactive) as any} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home"    component={HomeScreen}    options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Records" component={RecordsScreen} options={{ tabBarLabel: 'Records' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

// ─── Root navigator ───────────────────────────────────────────────────────────

export default function AppNavigator() {
  const isAuthenticated = useStore((s) => s.isAuthenticated);

  return (
    <View style={{ flex: 1 }} onTouchEnd={recordMobileSessionActivity}>
      <MobileSessionGuard />
      <NavigationContainer onStateChange={recordMobileSessionActivity}>
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>

          {!isAuthenticated ? (
            // ── Unauthenticated flow ──────────────────────────────────────
            <>
              <Stack.Screen name="Splash"      component={SplashScreen}        options={{ animation: 'fade' }} />
              <Stack.Screen name="Onboarding"  component={OnboardingScreen}    options={{ animation: 'slide_from_bottom' }} />
              <Stack.Screen name="Login"        component={LoginScreen} />
              <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
            </>
          ) : (
            // ── Authenticated app ─────────────────────────────────────────
            <>
              {/* 3-tab bottom navigator */}
              <Stack.Screen name="Main" component={TabNavigator} />

              {/* ── Home-tab stacked screens ────────────────────────────── */}
              <Stack.Screen name="Records"         component={RecordsScreen} />
              <Stack.Screen name="RecordDetail"    component={RecordDetailScreen} />
              <Stack.Screen name="AccessLog"       component={AccessLogScreen} />
              <Stack.Screen name="AccessRequests"  component={AccessRequestsScreen} />
              <Stack.Screen name="Sessions"        component={SessionManagementScreen} />
              <Stack.Screen name="AccountRecovery" component={AccountRecoveryScreen} />
              <Stack.Screen name="Language"        component={LanguageScreen} />
            </>
          )}

        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}
