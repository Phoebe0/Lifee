import { NavigationContainer, DefaultTheme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { theme } from '../../design/theme'
import { isSupabaseConfigured } from '../../core/config/env'
import { useAuthStore } from '../../stores/authStore'
import { HomeScreen } from '../../features/analytics/screens/HomeScreen'
import { TransactionListScreen } from '../../features/finance/screens/TransactionListScreen'
import { CreateTransactionScreen } from '../../features/finance/screens/CreateTransactionScreen'
import { AssetsScreen } from '../../features/asset/screens/AssetsScreen'
import { ProfileScreen } from '../../features/profile/screens/ProfileScreen'
import { SignInScreen } from '../../features/auth/screens/SignInScreen'
import type { AppTabParamList, RootStackParamList } from './types'

const RootStack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<AppTabParamList>()

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: theme.color.brand,
    background: theme.color.background,
    card: theme.color.surface,
    text: theme.color.text,
    border: theme.color.border
  }
}

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.color.brand,
        tabBarInactiveTintColor: theme.color.textSecondary,
        tabBarStyle: { height: 64, paddingTop: 8, paddingBottom: 8 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' }
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: '首页' }} />
      <Tab.Screen name="Transactions" component={TransactionListScreen} options={{ title: '明细' }} />
      <Tab.Screen name="Assets" component={AssetsScreen} options={{ title: '资产' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: '我的' }} />
    </Tab.Navigator>
  )
}

export function AppNavigator() {
  const session = useAuthStore(state => state.session)
  const requiresAuth = isSupabaseConfigured && !session

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootStack.Navigator>
        {requiresAuth ? (
          <RootStack.Screen name="Auth" component={SignInScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <RootStack.Screen name="Main" component={AppTabs} options={{ headerShown: false }} />
            <RootStack.Screen
              name="CreateTransaction"
              component={CreateTransactionScreen}
              options={{ headerShown: false, presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
            />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  )
}
