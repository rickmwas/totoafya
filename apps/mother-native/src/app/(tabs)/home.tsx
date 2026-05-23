import React from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useHealthSummary } from '../../hooks/useHealthSummary';
import { useLanguageStore } from '../../store/languageStore';
import { useAuthStore } from '../../store/authStore';
import { AlertCircle, PlusCircle, Calendar, Phone, Heart, Activity } from 'lucide-react-native';
import { colors } from '@totoafya/design-system';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { t } = useLanguageStore();
  const { 
    mother, 
    children, 
    activeChild, 
    setActiveChildId,
    pregnancyWeeks, 
    edd,
    activeChildNutritionStatus,
    alerts,
    isLoading 
  } = useHealthSummary();

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return t('good_morning');
    if (hrs < 18) return t('good_afternoon');
    return t('good_evening');
  };

  const getDaysRemaining = (eddString: string) => {
    const eddDate = new Date(eddString);
    const today = new Date();
    const diffTime = eddDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const formatAge = (dobString: string) => {
    const dob = new Date(dobString);
    const today = new Date();
    const diffTime = today.getTime() - dob.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${t('weeks_old')}`;
    }
    const months = Math.floor(diffDays / 30.4);
    if (months < 24) {
      return `${months} ${t('months_old')}`;
    }
    const years = Math.floor(months / 12);
    return `${years} ${t('years_old')}`;
  };

  return (
    <ScrollView className="bg-slate-50 flex-1 px-4 py-8 mt-6">
      {/* Greeting Header */}
      <View className="flex-row justify-between items-center mb-6">
        <View>
          <Text className="text-slate-500 text-sm">{getGreeting()},</Text>
          <Text className="text-slate-800 text-2xl font-bold">{mother?.full_name || user?.full_name || 'Mother'}</Text>
        </View>
        <Pressable 
          onPress={() => router.push('/(tabs)/settings')}
          className="bg-emerald-100 rounded-full h-10 w-10 items-center justify-center"
        >
          <Heart color="#1B6B5A" size={20} />
        </Pressable>
      </View>

      {/* Pregnancy Tracker (if pregnant) */}
      {mother?.pregnancy_status === 'pregnant' && (
        <View className="bg-emerald-800 rounded-3xl p-6 mb-6 shadow-lg shadow-emerald-900/20">
          <View className="flex-row items-center space-x-2 mb-3">
            <Calendar color="#FFFFFF" size={18} className="mr-2" />
            <Text className="text-emerald-100 text-xs font-bold uppercase tracking-wider">Pregnancy Progress</Text>
          </View>
          <Text className="text-white text-3xl font-extrabold mb-1">
            {pregnancyWeeks} {t('weeks_pregnant')}
          </Text>
          {edd && (
            <View className="mt-4 pt-4 border-t border-emerald-700 flex-row justify-between items-center">
              <View>
                <Text className="text-emerald-200 text-xs">Estimated Due Date (EDD)</Text>
                <Text className="text-white font-bold text-sm">{edd}</Text>
              </View>
              <View className="bg-emerald-700/50 px-3 py-2 rounded-xl">
                <Text className="text-white font-black text-sm">{getDaysRemaining(edd)} {t('days')} left</Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* My Children Section */}
      <View className="mb-6">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-slate-800 text-lg font-bold">{t('my_children')}</Text>
          <Pressable 
            onPress={() => router.push('/add-child')}
            className="flex-row items-center space-x-1"
          >
            <PlusCircle color="#1B6B5A" size={16} className="mr-1" />
            <Text className="text-emerald-700 font-bold text-sm">{t('add_child')}</Text>
          </Pressable>
        </View>

        {children.length === 0 ? (
          <Pressable 
            onPress={() => router.push('/add-child')}
            className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-8 items-center justify-center"
          >
            <Text className="text-slate-400 text-sm font-semibold mb-2">{t('no_data')}</Text>
            <Text className="text-emerald-700 font-bold text-sm">Register your child's profile</Text>
          </Pressable>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {children.map((child) => {
              const isActive = child.id === activeChild?.id;
              const nutritional = isActive ? activeChildNutritionStatus : 'normal';
              
              return (
                <Pressable
                  key={child.id}
                  onPress={() => setActiveChildId(child.id)}
                  className={`mr-4 rounded-3xl p-5 w-60 border shadow-sm ${isActive ? 'bg-white border-emerald-600 shadow-emerald-100' : 'bg-white border-slate-100'}`}
                >
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="bg-emerald-50 h-10 w-10 rounded-2xl items-center justify-center">
                      <Text className="text-emerald-800 font-black text-sm">{child.full_name[0]}</Text>
                    </View>
                    <View className={`px-3 py-1 rounded-full ${nutritional === 'sam' || nutritional === 'mam' ? 'bg-red-50' : 'bg-emerald-50'}`}>
                      <Text className={`font-bold text-[10px] uppercase ${nutritional === 'sam' || nutritional === 'mam' ? 'text-red-700' : 'text-emerald-800'}`}>
                        {nutritional === 'sam' ? t('critical') : nutritional === 'mam' ? t('at_risk') : t('healthy')}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-slate-800 font-bold text-base truncate">{child.full_name}</Text>
                  <Text className="text-slate-400 text-xs mt-1">Gender: {child.gender === 'male' ? 'Boy' : 'Girl'}</Text>
                  <Text className="text-slate-500 font-medium text-xs mt-1">Age: {formatAge(child.date_of_birth)}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* AI Alerts Section */}
      <View className="mb-6">
        <Text className="text-slate-800 text-lg font-bold mb-3">AI Health Alerts</Text>
        {alerts.length === 0 ? (
          <View className="bg-emerald-50 border border-emerald-100 rounded-3xl p-5 flex-row items-center space-x-3">
            <Activity color="#1B6B5A" size={20} className="mr-3" />
            <Text className="text-emerald-800 font-medium text-sm flex-1">
              No anomalies detected. All child growth and maternal indicators are normal.
            </Text>
          </View>
        ) : (
          alerts.map((alert) => (
            <View 
              key={alert.id} 
              className={`rounded-3xl p-4 mb-3 border flex-row items-start space-x-3 ${alert.severity === 'critical' ? 'bg-red-50 border-red-100' : alert.severity === 'warning' ? 'bg-amber-50 border-amber-100' : 'bg-blue-50 border-blue-100'}`}
            >
              <AlertCircle 
                color={alert.severity === 'critical' ? '#E51010' : alert.severity === 'warning' ? '#D97706' : '#208AEF'} 
                size={20} 
                className="mr-3 mt-0.5"
              />
              <View className="flex-grow flex-1">
                <Text className="text-slate-800 font-bold text-sm">{alert.title}</Text>
                <Text className="text-slate-600 text-xs mt-1">{alert.message}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Emergency Facility Contact */}
      {mother?.facility_name && (
        <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-12">
          <Text className="text-slate-500 text-xs uppercase tracking-wider font-bold mb-2">Assigned Clinic</Text>
          <Text className="text-slate-800 font-bold text-base mb-1">{mother.facility_name}</Text>
          {mother.facility_phone && (
            <View className="flex-row items-center mt-3 pt-3 border-t border-slate-100">
              <Phone color="#1B6B5A" size={16} className="mr-2" />
              <Text className="text-emerald-700 font-bold text-sm ml-2">{mother.facility_phone}</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}
