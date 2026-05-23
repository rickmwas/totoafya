import React from 'react';
import { Tabs } from 'expo-router';
import { useLanguageStore } from '../../store/languageStore';
import { Home, Syringe, TrendingUp, MessageSquare, Settings } from 'lucide-react-native';

export default function TabLayout() {
  const { t } = useLanguageStore();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1B6B5A',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#F2F2F7',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: '#1B6B5A',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('home'),
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          headerShown: false, // Custom header for homepage
        }}
      />
      <Tabs.Screen
        name="vaccines"
        options={{
          title: t('vaccines'),
          tabBarIcon: ({ color, size }) => <Syringe color={color} size={size} />,
          headerTitle: t('vaccination_schedule'),
        }}
      />
      <Tabs.Screen
        name="growth"
        options={{
          title: t('growth'),
          tabBarIcon: ({ color, size }) => <TrendingUp color={color} size={size} />,
          headerTitle: t('growth_tracker'),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: t('ai_assistant'),
          tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size} />,
          headerTitle: t('ai_health_analysis'),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings'),
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
          headerTitle: t('settings'),
        }}
      />
    </Tabs>
  );
}
