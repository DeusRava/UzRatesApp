import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import RatesScreen from './src/screens/RatesScreen';
import ConverterScreen from './src/screens/ConverterScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { COLORS, RADIUS } from './src/utils/theme';

const Tab = createBottomTabNavigator();

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={[styles.tabItem, focused && styles.tabItemActive]}>
      <Text style={styles.tabEmoji}>{emoji}</Text>
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
        }}
      >
        <Tab.Screen
          name="Rates"
          component={RatesScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon emoji="💱" label="Курсы" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Converter"
          component={ConverterScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon emoji="🔄" label="Конвертер" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" label="О боте" focused={focused} />,
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
    height: 70,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    minWidth: 70,
  },
  tabItemActive: {
    backgroundColor: COLORS.accentSoft,
  },
  tabEmoji: { fontSize: 20 },
  tabLabel: { color: COLORS.textMuted, fontSize: 10, marginTop: 2, fontWeight: '600' },
  tabLabelActive: { color: COLORS.accent },
});
