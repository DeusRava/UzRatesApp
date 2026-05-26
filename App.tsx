import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import RatesScreen from './src/screens/RatesScreen';
import ConverterScreen from './src/screens/ConverterScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { COLORS, RADIUS, SPACING } from './src/utils/theme';

const Tab = createBottomTabNavigator();

function TabIcon({ label, focused, icon }: { label: string; focused: boolean; icon: string }) {
  return (
    <View style={[styles.tabItem, focused && styles.tabItemActive]}>
      <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>{icon}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarShowLabel: false,
          tabBarHideOnKeyboard: true,
        }}
      >
        <Tab.Screen
          name="Rates"
          component={RatesScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon icon="◈" label="Курсы" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Converter"
          component={ConverterScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon icon="⇄" label="Конвертер" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon icon="◉" label="О боте" focused={focused} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.bgCard,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: 72,
    paddingBottom: 10,
    paddingTop: 8,
    paddingHorizontal: SPACING.sm,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    minWidth: 80,
  },
  tabItemActive: {
    backgroundColor: COLORS.accentSoft,
  },
  tabIcon: {
    fontSize: 18,
    color: COLORS.textMuted,
  },
  tabIconActive: {
    color: COLORS.accent,
  },
  tabLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 3,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  tabLabelActive: {
    color: COLORS.accent,
  },
});
