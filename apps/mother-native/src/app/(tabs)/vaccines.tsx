import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useHealthSummary } from '../../hooks/useHealthSummary';
import { useLanguageStore } from '../../store/languageStore';
import { calculateDaysDifference } from '@totoafya/business-logic';
import { CheckCircle2, Circle, AlertTriangle, Calendar } from 'lucide-react-native';

export default function VaccinesScreen() {
  const { activeChild, immunizations, recordImmunization } = useHealthSummary();
  const { t } = useLanguageStore();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'given':
        return { bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-800' };
      case 'overdue':
        return { bg: 'bg-red-50 border-red-100', text: 'text-red-800' };
      case 'due':
        return { bg: 'bg-amber-50 border-amber-100', text: 'text-amber-800' };
      default:
        return { bg: 'bg-slate-50 border-slate-100', text: 'text-slate-500' };
    }
  };

  const handleMarkAdministered = async (id: string, name: string) => {
    Alert.alert(
      t('vaccination_schedule'),
      `Mark ${name} as administered today?`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('done'),
          onPress: async () => {
            setLoadingId(id);
            try {
              const todayStr = new Date().toISOString().split('T')[0];
              await recordImmunization({
                id,
                given_date: todayStr,
                facility: activeChild?.birth_facility || 'Local Clinic',
              });
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to update vaccine record');
            } finally {
              setLoadingId(null);
            }
          },
        },
      ]
    );
  };

  if (!activeChild) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center p-6">
        <AlertTriangle color="#A0A0A0" size={32} className="mb-2" />
        <Text className="text-slate-500 text-sm font-semibold text-center">
          Please select or add a child profile on the home dashboard to track vaccinations.
        </Text>
      </View>
    );
  }

  // Sort immunizations by scheduled age or scheduled date
  const sortedImmunizations = [...immunizations].sort((a, b) => {
    return (a.age_weeks || 0) - (b.age_weeks || 0);
  });

  return (
    <ScrollView className="bg-slate-50 flex-1 px-4 py-6">
      <View className="mb-6 bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex-row items-center justify-between">
        <View>
          <Text className="text-slate-500 text-xs uppercase tracking-wider font-bold mb-1">Active Child</Text>
          <Text className="text-slate-800 font-bold text-lg">{activeChild.full_name}</Text>
        </View>
        <View className="bg-emerald-50 px-4 py-2 rounded-2xl">
          <Text className="text-emerald-800 font-bold text-xs">
            {immunizations.filter(i => i.status === 'given').length} / {immunizations.length} Given
          </Text>
        </View>
      </View>

      <Text className="text-slate-800 text-lg font-bold mb-4">{t('vaccination_schedule')}</Text>

      {sortedImmunizations.length === 0 ? (
        <View className="bg-white rounded-3xl p-8 items-center justify-center border border-slate-100">
          <Text className="text-slate-400 text-sm font-semibold">{t('no_data')}</Text>
        </View>
      ) : (
        <View className="space-y-4">
          {sortedImmunizations.map((item, index) => {
            const isGiven = item.status === 'given';
            let displayStatus = item.status || 'scheduled';
            
            // Re-evaluate due/overdue status locally based on current date
            if (!isGiven) {
              const diffDays = calculateDaysDifference(item.scheduled_date);
              if (diffDays < 0) {
                displayStatus = 'overdue';
              } else if (diffDays <= 7) {
                displayStatus = 'due';
              }
            }

            const badge = getStatusBadgeStyles(displayStatus);

            return (
              <View 
                key={item.id} 
                className={`bg-white rounded-3xl p-5 mb-4 border flex-row items-center justify-between shadow-sm ${isGiven ? 'border-slate-100 opacity-80' : displayStatus === 'overdue' ? 'border-red-200' : displayStatus === 'due' ? 'border-amber-200' : 'border-slate-100'}`}
              >
                <View className="flex-1 mr-4">
                  <View className="flex-row items-center space-x-2 flex-wrap mb-1.5">
                    <Text className="text-slate-800 font-bold text-base mr-2">{item.vaccine_name}</Text>
                    <View className={`px-2 py-0.5 rounded-full border ${badge.bg} ml-2`}>
                      <Text className={`font-bold text-[9px] uppercase ${badge.text}`}>
                        {displayStatus === 'given' ? t('given') : displayStatus === 'overdue' ? t('overdue') : displayStatus === 'due' ? t('due_soon') : t('upcoming')}
                      </Text>
                    </View>
                  </View>
                  
                  <Text className="text-slate-400 text-xs">
                    Target: {item.age_weeks === 0 ? 'Birth' : `${item.age_weeks} Weeks`}
                  </Text>
                  
                  <View className="flex-row items-center mt-2">
                    <Calendar color="#A0A0A0" size={12} className="mr-1" />
                    <Text className="text-slate-500 text-xs ml-1">
                      {isGiven 
                        ? `Given: ${item.given_date}` 
                        : `Scheduled: ${item.scheduled_date}`}
                    </Text>
                  </View>
                </View>

                {/* Mark Administered Button */}
                {isGiven ? (
                  <CheckCircle2 color="#2E7A5D" size={26} />
                ) : (
                  <Pressable
                    disabled={loadingId === item.id}
                    onPress={() => handleMarkAdministered(item.id, item.vaccine_name)}
                    className="p-1 active:scale-95"
                  >
                    {loadingId === item.id ? (
                      <ActivityIndicator color="#1B6B5A" size="small" />
                    ) : (
                      <Circle color={displayStatus === 'overdue' ? '#E51010' : '#A0A0A0'} size={26} />
                    )}
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>
      )}
      <View className="h-10" />
    </ScrollView>
  );
}
