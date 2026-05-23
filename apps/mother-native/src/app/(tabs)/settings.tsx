import React from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useLanguageStore } from '../../store/languageStore';
import { useHealthSummary } from '../../hooks/useHealthSummary';
import { Globe, User, Phone, LogOut, ShieldAlert } from 'lucide-react-native';

export default function SettingsScreen() {
  const { user, logout } = useAuthStore();
  const { language, setLanguage, t } = useLanguageStore();
  const { mother, children } = useHealthSummary();

  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      'Are you sure you want to sign out?',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('logout'),
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  return (
    <ScrollView className="bg-slate-50 flex-1 px-4 py-6">
      {/* Profile Card */}
      <View className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-6 flex-row items-center space-x-4">
        <View className="h-16 w-16 bg-emerald-50 rounded-2xl items-center justify-center">
          <User color="#1B6B5A" size={32} />
        </View>
        <View className="flex-1">
          <Text className="text-slate-800 font-bold text-lg">{mother?.full_name || user?.full_name || 'Mother'}</Text>
          <Text className="text-slate-400 text-xs mt-1">County: {mother?.county || 'Not Set'}</Text>
          {mother?.phone && (
            <View className="flex-row items-center mt-2">
              <Phone color="#A0A0A0" size={12} className="mr-1" />
              <Text className="text-slate-500 text-xs ml-1">{mother.phone}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Language Section */}
      <Text className="text-slate-800 text-base font-bold mb-3">{t('language')}</Text>
      <View className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm mb-6">
        <Pressable 
          onPress={() => setLanguage('en')}
          className="flex-row justify-between items-center py-3 border-b border-slate-100 active:opacity-60"
        >
          <View className="flex-row items-center space-x-3">
            <Globe color="#1B6B5A" size={18} className="mr-3" />
            <Text className="text-slate-850 font-bold text-sm ml-1">{t('english')}</Text>
          </View>
          {language === 'en' && (
            <View className="h-2 w-2 rounded-full bg-emerald-700" />
          )}
        </Pressable>

        <Pressable 
          onPress={() => setLanguage('sw')}
          className="flex-row justify-between items-center py-3 active:opacity-60"
        >
          <View className="flex-row items-center space-x-3">
            <Globe color="#1B6B5A" size={18} className="mr-3" />
            <Text className="text-slate-850 font-bold text-sm ml-1">{t('swahili')}</Text>
          </View>
          {language === 'sw' && (
            <View className="h-2 w-2 rounded-full bg-emerald-700" />
          )}
        </Pressable>
      </View>

      {/* App Info & Stats */}
      <Text className="text-slate-800 text-base font-bold mb-3">Health Statistics</Text>
      <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-8">
        <View className="flex-row justify-between py-2 border-b border-slate-100">
          <Text className="text-slate-500 text-sm">Registered Children</Text>
          <Text className="text-slate-800 font-bold text-sm">{children.length}</Text>
        </View>
        <View className="flex-row justify-between py-2 border-b border-slate-100">
          <Text className="text-slate-500 text-sm">Pregnancy Status</Text>
          <Text className="text-slate-800 font-bold text-sm uppercase">
            {mother?.pregnancy_status === 'pregnant' ? 'Pregnant' : mother?.pregnancy_status === 'postpartum' ? 'Postpartum' : 'Not Pregnant'}
          </Text>
        </View>
        <View className="flex-row justify-between py-2">
          <Text className="text-slate-500 text-sm">App Version</Text>
          <Text className="text-slate-400 text-sm font-semibold">1.0.0 (Expo SDK 56)</Text>
        </View>
      </View>

      {/* Logout */}
      <Pressable 
        onPress={handleLogout}
        className="bg-red-50 border border-red-100 rounded-3xl py-4 flex-row items-center justify-center space-x-2 active:bg-red-100 mb-12"
      >
        <LogOut color="#E51010" size={18} className="mr-2" />
        <Text className="text-red-700 font-bold text-sm ml-1">{t('logout')}</Text>
      </Pressable>
    </ScrollView>
  );
}
