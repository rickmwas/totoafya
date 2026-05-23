import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useHealthSummary } from '../hooks/useHealthSummary';
import { useLanguageStore } from '../store/languageStore';
import { useAuthStore } from '../store/authStore';
import { BloodGroup, PregnancyStatus } from '@totoafya/types';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

export default function OnboardingScreen() {
  const { updateMotherProfile } = useHealthSummary();
  const { t } = useLanguageStore();
  const { user } = useAuthStore();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [ancNumber, setAncNumber] = useState('');
  const [county, setCounty] = useState('Nairobi');
  const [pregnancyStatus, setPregnancyStatus] = useState<PregnancyStatus>('pregnant');
  const [lmp, setLmp] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('Unknown');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!fullName || !phone || !county) {
      Alert.alert('Error', 'Full Name, Phone Number, and County are required');
      return;
    }

    if (pregnancyStatus === 'pregnant' && lmp) {
      // Validate date format
      const dateParts = lmp.split('-');
      if (dateParts.length !== 3 || isNaN(Date.parse(lmp))) {
        Alert.alert('Error', 'Please enter Last Menstrual Period (LMP) in YYYY-MM-DD format');
        return;
      }
    }

    setLoading(true);
    try {
      let edd = '';
      if (pregnancyStatus === 'pregnant' && lmp) {
        const lmpDate = new Date(lmp);
        // Naegele's rule: LMP + 280 days
        const eddDate = new Date(lmpDate.getTime() + 280 * 24 * 60 * 60 * 1000);
        edd = eddDate.toISOString().split('T')[0];
      }

      await updateMotherProfile({
        full_name: fullName,
        phone,
        national_id: nationalId || undefined,
        anc_number: ancNumber || undefined,
        county,
        pregnancy_status: pregnancyStatus,
        lmp: lmp || undefined,
        edd: edd || undefined,
        blood_group: bloodGroup,
        profile_complete: true,
      });

      Alert.alert('Success', 'Profile completed successfully!');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-slate-50 px-6 py-12">
      <View className="mb-8">
        <Text className="text-emerald-800 text-3xl font-bold">{t('welcome')}</Text>
        <Text className="text-slate-500 text-sm mt-1">Let's complete your profile to customize your experience.</Text>
      </View>

      <View className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200 border border-slate-100 mb-8">
        {/* Name */}
        <View className="mb-4">
          <Text className="text-slate-600 text-xs font-semibold mb-1">{t('full_name')} *</Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="Jane Doe"
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800"
          />
        </View>

        {/* Phone */}
        <View className="mb-4">
          <Text className="text-slate-600 text-xs font-semibold mb-1">{t('phone_number')} *</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="e.g. +254 712 345 678"
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800"
          />
        </View>

        {/* National ID */}
        <View className="mb-4">
          <Text className="text-slate-600 text-xs font-semibold mb-1">National ID Number</Text>
          <TextInput
            value={nationalId}
            onChangeText={setNationalId}
            keyboardType="numeric"
            placeholder="e.g. 12345678"
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800"
          />
        </View>

        {/* County */}
        <View className="mb-4">
          <Text className="text-slate-600 text-xs font-semibold mb-1">{t('county')} *</Text>
          <TextInput
            value={county}
            onChangeText={setCounty}
            placeholder="e.g. Nairobi, Mombasa, Kisumu"
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800"
          />
        </View>

        {/* Pregnancy Status */}
        <View className="mb-4">
          <Text className="text-slate-600 text-xs font-semibold mb-2">Are you currently pregnant?</Text>
          <View className="flex-row space-x-2 flex-wrap">
            <Pressable
              onPress={() => setPregnancyStatus('pregnant')}
              className={`flex-1 min-w-[100px] border py-3 px-2 rounded-xl items-center justify-center mb-2 mr-2 ${pregnancyStatus === 'pregnant' ? 'bg-emerald-50 border-emerald-700' : 'bg-slate-50 border-slate-200'}`}
            >
              <Text className={`font-semibold text-xs ${pregnancyStatus === 'pregnant' ? 'text-emerald-800' : 'text-slate-600'}`}>Yes, Pregnant</Text>
            </Pressable>
            <Pressable
              onPress={() => setPregnancyStatus('postpartum')}
              className={`flex-1 min-w-[100px] border py-3 px-2 rounded-xl items-center justify-center mb-2 mr-2 ${pregnancyStatus === 'postpartum' ? 'bg-emerald-50 border-emerald-700' : 'bg-slate-50 border-slate-200'}`}
            >
              <Text className={`font-semibold text-xs ${pregnancyStatus === 'postpartum' ? 'text-emerald-800' : 'text-slate-600'}`}>Postpartum</Text>
            </Pressable>
          </View>
        </View>

        {/* LMP (if pregnant) */}
        {pregnancyStatus === 'pregnant' && (
          <View className="mb-4 animate-fade-in">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-slate-600 text-xs font-semibold">Last Menstrual Period (LMP)</Text>
              <Text className="text-[10px] text-emerald-600">YYYY-MM-DD</Text>
            </View>
            <TextInput
              value={lmp}
              onChangeText={setLmp}
              placeholder="e.g. 2026-01-15"
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800"
            />
          </View>
        )}

        {/* ANC Number */}
        {pregnancyStatus === 'pregnant' && (
          <View className="mb-4">
            <Text className="text-slate-600 text-xs font-semibold mb-1">{t('enter_anc')}</Text>
            <TextInput
              value={ancNumber}
              onChangeText={setAncNumber}
              placeholder="e.g. ANC-12345"
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800"
            />
          </View>
        )}

        {/* Blood Group */}
        <View className="mb-6">
          <Text className="text-slate-600 text-xs font-semibold mb-2">Blood Group</Text>
          <View className="flex-row flex-wrap">
            {BLOOD_GROUPS.map((bg) => (
              <Pressable
                key={bg}
                onPress={() => setBloodGroup(bg)}
                className={`border p-2 rounded-lg items-center justify-center m-1 w-[60px] ${bloodGroup === bg ? 'bg-emerald-50 border-emerald-700' : 'bg-slate-50 border-slate-200'}`}
              >
                <Text className={`font-semibold text-xs ${bloodGroup === bg ? 'text-emerald-800' : 'text-slate-600'}`}>{bg}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Submit */}
        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          className="bg-emerald-700 rounded-xl py-4 items-center justify-center active:bg-emerald-800"
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-base">{t('register')}</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}
