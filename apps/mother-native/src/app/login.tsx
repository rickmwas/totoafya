import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useLanguageStore } from '../store/languageStore';
import { db } from '@totoafya/api-client';

export default function LoginScreen() {
  const { login } = useAuthStore();
  const { language, setLanguage, t } = useLanguageStore();

  const [authType, setAuthType] = useState<'national_id' | 'anc_number'>('national_id');
  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [activationCode, setActivationCode] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [loading, setLoading] = useState(false);

  const isSupabase = (process.env.EXPO_PUBLIC_DATABASE_PROVIDER === 'supabase' || 
                     process.env.VITE_DATABASE_PROVIDER === 'supabase');

  const handleAuth = async () => {
    if (!identifier) {
      Alert.alert(t('error') || 'Error', language === 'sw' ? 'Tafadhali jaza nambari' : 'Please enter your ID/ANC number');
      return;
    }

    if (isActivating) {
      if (!activationCode || !pin || !confirmPin) {
        Alert.alert(t('error') || 'Error', language === 'sw' ? 'Tafadhali jaza sehemu zote' : 'Please fill in all activation fields');
        return;
      }
      if (pin.trim().length !== 6) {
        Alert.alert(t('error') || 'Error', language === 'sw' ? 'PIN mpya lazima iwe nambari 6' : 'New PIN must be exactly 6 digits');
        return;
      }
      if (pin !== confirmPin) {
        Alert.alert(t('error') || 'Error', language === 'sw' ? 'PIN hazilingani' : 'PIN codes do not match');
        return;
      }
    } else {
      if (!pin) {
        Alert.alert(t('error') || 'Error', language === 'sw' ? 'Tafadhali jaza PIN yako' : 'Please enter your Security PIN');
        return;
      }
      if (pin.trim().length !== 6) {
        Alert.alert(t('error') || 'Error', language === 'sw' ? 'PIN lazima iwe nambari 6' : 'PIN must be exactly 6 digits');
        return;
      }
    }
    
    setLoading(true);
    try {
      if (isActivating) {
        const mockUser = await db.auth.signInWithNationalIdOrAnc(identifier, pin, activationCode);
        await login({
          id: mockUser.id,
          email: mockUser.email || '',
          full_name: mockUser.full_name || '',
          role: 'user',
          facility_id: mockUser.facility_id,
          mother_id: mockUser.mother_id,
          profile_complete: true,
        }, pin);
      } else {
        const mockUser = await db.auth.signInWithNationalIdOrAnc(identifier, pin);
        await login({
          id: mockUser.id,
          email: mockUser.email || '',
          full_name: mockUser.full_name || '',
          role: 'user',
          facility_id: mockUser.facility_id,
          mother_id: mockUser.mother_id,
          profile_complete: mockUser.profile_complete ?? true,
        }, pin);
      }
    } catch (err: any) {
      Alert.alert(t('error') || 'Error', err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const selectMockUser = async (role: 'user' | 'new_mother') => {
    setLoading(true);
    try {
      if (role === 'new_mother') {
        const mockUser = await db.auth.signUpMother(`anc-9988-mock`, '123456', {
          full_name: 'New Mother',
          facility_id: 'fac-a-id',
        });
        await login({
          id: mockUser.id,
          email: mockUser.email || '',
          full_name: mockUser.full_name || '',
          role: 'user',
          facility_id: mockUser.facility_id,
          mother_id: mockUser.mother_id,
          profile_complete: false,
        });
      } else {
        // Normal mother
        const mockUser = await db.auth.signInWithNationalIdOrAnc('mother-a', '123456').catch(async () => {
          return await db.auth.signUpMother('mother-a', '123456', {
            full_name: 'Jane Doe',
            facility_id: 'fac-a-id',
          });
        });

        // Ensure Jane Doe Mother record is created in localDB
        const mothers = await db.entities.Mother.filter({ user_id: mockUser.id });
        let motherId = mothers[0]?.id;
        if (!motherId) {
          const newMother = await db.entities.Mother.create({
            user_id: mockUser.id,
            full_name: mockUser.full_name || 'Jane Doe',
            phone: '+254712345678',
            county: 'Nairobi',
            anc_number: 'ANC-8839-22',
            pregnancy_status: 'pregnant',
            lmp: new Date(Date.now() - 20 * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 20 weeks pregnant
            blood_group: 'O+',
            profile_complete: true,
          });
          motherId = newMother.id;
        }

        await login({
          id: mockUser.id,
          email: mockUser.email || '',
          full_name: mockUser.full_name || '',
          role: 'user',
          facility_id: mockUser.facility_id,
          mother_id: motherId,
          profile_complete: true,
        });
      }
    } catch (err: any) {
      if (err.message && (err.message.includes('SUB_LIMIT_REACHED') || err.message.includes('SUB_EXPIRED'))) {
        Alert.alert(
          'Facility Capacity Reached',
          'Your assigned facility has reached its maximum patient limit. Please contact the facility administration.'
        );
      } else {
        Alert.alert('Error', err.message || 'Mock login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-slate-50 justify-center px-6 py-12">
      {/* Language Selector */}
      <View className="absolute top-12 right-6 bg-emerald-100 rounded-full p-1 flex-row">
        <Pressable 
          onPress={() => setLanguage('en')}
          className={`px-3 py-1 rounded-full ${language === 'en' ? 'bg-emerald-700' : ''}`}
        >
          <Text className={`font-semibold text-xs ${language === 'en' ? 'text-white' : 'text-emerald-800'}`}>EN</Text>
        </Pressable>
        <Pressable 
          onPress={() => setLanguage('sw')}
          className={`px-3 py-1 rounded-full ${language === 'sw' ? 'bg-emerald-700' : ''}`}
        >
          <Text className={`font-semibold text-xs ${language === 'sw' ? 'text-white' : 'text-emerald-800'}`}>SW</Text>
        </Pressable>
      </View>

      {/* Header */}
      <View className="items-center mb-8 mt-8">
        <Text className="text-emerald-800 text-4xl font-bold tracking-tight" style={{ fontFamily: 'Inter' }}>
          TotoAfya
        </Text>
        <Text className="text-slate-500 text-sm mt-1 text-center leading-relaxed">
          {language === 'sw' ? 'Msaidizi wako wa uzazi na chanjo' : 'Your maternal and child health assistant'}
        </Text>
      </View>

      {/* Auth Card */}
      <View className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200 border border-slate-100">
        <Text className="text-slate-800 text-xl font-bold mb-4">
          {isActivating 
            ? (language === 'sw' ? 'Wezesha Wasifu' : 'Activate Profile') 
            : (language === 'sw' ? 'Ingia Kwenye Portal' : 'Patient Portal Sign In')
          }
        </Text>

        {/* Toggle Identifier Type */}
        <View className="flex-row bg-slate-100 p-1 rounded-xl mb-4">
          <Pressable
            onPress={() => { setAuthType('national_id'); setIdentifier(''); }}
            className={`flex-1 py-2 rounded-lg items-center ${authType === 'national_id' ? 'bg-white shadow-sm' : ''}`}
          >
            <Text className={`text-xs font-bold ${authType === 'national_id' ? 'text-slate-900' : 'text-slate-500'}`}>
              {language === 'sw' ? 'Kitambulisho' : 'National ID'}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => { setAuthType('anc_number'); setIdentifier(''); }}
            className={`flex-1 py-2 rounded-lg items-center ${authType === 'anc_number' ? 'bg-white shadow-sm' : ''}`}
          >
            <Text className={`text-xs font-bold ${authType === 'anc_number' ? 'text-slate-900' : 'text-slate-500'}`}>
              {language === 'sw' ? 'Namba ya ANC' : 'ANC Card Number'}
            </Text>
          </Pressable>
        </View>

        <View className="mb-4">
          <Text className="text-slate-600 text-xs font-semibold mb-1">
            {authType === 'national_id' 
              ? (language === 'sw' ? 'Nambari ya Kitambulisho' : 'National ID Number')
              : (language === 'sw' ? 'Nambari ya Kadi ya ANC' : 'ANC card registration number')
            }
          </Text>
          <TextInput
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
            placeholder={authType === 'national_id' ? 'e.g. 12345678' : 'e.g. ANC-2026-0041'}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800"
          />
        </View>

        {isActivating && (
          <View className="mb-4">
            <Text className="text-slate-600 text-xs font-semibold mb-1">
              {language === 'sw' ? 'Msimbo wa Uanzishaji' : 'Activation PIN Code'}
            </Text>
            <TextInput
              value={activationCode}
              onChangeText={setActivationCode}
              keyboardType="numeric"
              maxLength={6}
              placeholder="e.g. 982104"
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800"
            />
          </View>
        )}

        <View className="mb-6">
          <Text className="text-slate-600 text-xs font-semibold mb-1">
            {isActivating
              ? (language === 'sw' ? 'Unda PIN mpya (Nambari 6)' : 'Create 6-Digit Security PIN')
              : (language === 'sw' ? 'PIN ya Siri (Nambari 6)' : '6-Digit Security PIN')
            }
          </Text>
          <TextInput
            value={pin}
            onChangeText={setPin}
            secureTextEntry
            keyboardType="numeric"
            maxLength={6}
            placeholder="••••••"
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 tracking-widest text-lg"
          />
        </View>

        {isActivating && (
          <View className="mb-6">
            <Text className="text-slate-600 text-xs font-semibold mb-1">
              {language === 'sw' ? 'Thibitisha PIN mpya' : 'Confirm New PIN'}
            </Text>
            <TextInput
              value={confirmPin}
              onChangeText={setConfirmPin}
              secureTextEntry
              keyboardType="numeric"
              maxLength={6}
              placeholder="••••••"
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 tracking-widest text-lg"
            />
          </View>
        )}

        <Pressable
          onPress={handleAuth}
          disabled={loading}
          className="bg-emerald-700 rounded-xl py-4 items-center justify-center active:bg-emerald-800"
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-base">
              {isActivating 
                ? (language === 'sw' ? 'Wezesha' : 'Activate Profile') 
                : (language === 'sw' ? 'Thibitisha na Uingie' : 'Verify & Sign In')
              }
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => setIsActivating(!isActivating)}
          className="mt-4 items-center"
        >
          <Text className="text-emerald-700 text-xs font-semibold">
            {isActivating 
              ? (language === 'sw' ? 'Tayari una akaunti? Ingia' : 'Already have an account? Sign In') 
              : (language === 'sw' ? 'Hujajisajili bado? Wezesha wasifu' : "First time using TotoAfya? Activate profile")
            }
          </Text>
        </Pressable>
      </View>

      {/* Quick Test/Mock Section */}
      <View className="mt-8 border-t border-slate-200 pt-6">
        <Text className="text-center text-xs text-slate-400 font-semibold mb-4">
          QUICK SIMULATION & TESTING PROFILES
        </Text>
        <View className="flex-row justify-between space-x-4 flex-wrap">
          <Pressable
            onPress={() => selectMockUser('user')}
            disabled={loading}
            className="flex-1 min-w-[45%] bg-emerald-50 border border-emerald-100 rounded-xl py-3 px-2 items-center justify-center mb-3 active:bg-emerald-100"
          >
            <Text className="text-emerald-800 font-bold text-xs text-center">Jane Doe (Pregnant)</Text>
            <Text className="text-[10px] text-emerald-600 text-center mt-1">Jane Doe Profile</Text>
          </Pressable>

          <Pressable
            onPress={() => selectMockUser('new_mother')}
            disabled={loading}
            className="flex-1 min-w-[45%] bg-teal-50 border border-teal-100 rounded-xl py-3 px-2 items-center justify-center mb-3 active:bg-teal-100"
          >
            <Text className="text-teal-800 font-bold text-xs text-center">New Mother</Text>
            <Text className="text-[10px] text-teal-600 text-center mt-1">Complete Profile Flow</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
