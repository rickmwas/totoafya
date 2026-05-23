import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useHealthSummary } from '../hooks/useHealthSummary';
import { useLanguageStore } from '../store/languageStore';
import { Gender } from '@totoafya/types';

export default function AddChildScreen() {
  const router = useRouter();
  const { addChild, mother } = useHealthSummary();
  const { t } = useLanguageStore();

  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<Gender>('female');
  const [birthWeight, setBirthWeight] = useState('');
  const [birthHeight, setBirthHeight] = useState('');
  const [birthFacility, setBirthFacility] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!mother?.id) {
      Alert.alert('Error', 'Mother profile not loaded');
      return;
    }
    if (!fullName || !dob) {
      Alert.alert('Error', 'Full Name and Date of Birth are required');
      return;
    }

    // Validate DOB format (YYYY-MM-DD)
    const dateParts = dob.split('-');
    if (dateParts.length !== 3 || isNaN(Date.parse(dob))) {
      Alert.alert('Error', 'Please enter Date of Birth in YYYY-MM-DD format');
      return;
    }

    setLoading(true);
    try {
      const weightNum = birthWeight ? parseFloat(birthWeight) : undefined;
      const heightNum = birthHeight ? parseFloat(birthHeight) : undefined;

      await addChild({
        mother_id: mother.id,
        full_name: fullName,
        date_of_birth: dob,
        gender,
        birth_weight_kg: weightNum,
        birth_height_cm: heightNum,
        birth_facility: birthFacility || undefined,
        health_status: 'healthy',
      });

      Alert.alert('Success', 'Child profile created successfully!');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add child profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-slate-50 px-6 py-8">
      <View className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8">
        {/* Name */}
        <View className="mb-4">
          <Text className="text-slate-600 text-xs font-semibold mb-1">{t('full_name')} *</Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="e.g. John Doe"
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm"
          />
        </View>

        {/* DOB */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-slate-600 text-xs font-semibold">Date of Birth *</Text>
            <Text className="text-[10px] text-emerald-600">YYYY-MM-DD</Text>
          </View>
          <TextInput
            value={dob}
            onChangeText={setDob}
            placeholder="e.g. 2026-02-15"
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm"
          />
        </View>

        {/* Gender */}
        <View className="mb-4">
          <Text className="text-slate-600 text-xs font-semibold mb-2">Gender</Text>
          <View className="flex-row space-x-2">
            <Pressable
              onPress={() => setGender('female')}
              className={`flex-1 border py-3 rounded-xl items-center justify-center mr-2 ${gender === 'female' ? 'bg-emerald-50 border-emerald-700' : 'bg-slate-50 border-slate-200'}`}
            >
              <Text className={`font-semibold text-xs ${gender === 'female' ? 'text-emerald-800' : 'text-slate-600'}`}>Girl</Text>
            </Pressable>
            <Pressable
              onPress={() => setGender('male')}
              className={`flex-1 border py-3 rounded-xl items-center justify-center ${gender === 'male' ? 'bg-emerald-50 border-emerald-700' : 'bg-slate-50 border-slate-200'}`}
            >
              <Text className={`font-semibold text-xs ${gender === 'male' ? 'text-emerald-800' : 'text-slate-600'}`}>Boy</Text>
            </Pressable>
          </View>
        </View>

        {/* Birth Weight & Height */}
        <View className="flex-row space-x-4 mb-4">
          <View className="flex-grow flex-1 mr-2">
            <Text className="text-slate-600 text-xs font-semibold mb-1">Birth Weight (kg)</Text>
            <TextInput
              value={birthWeight}
              onChangeText={setBirthWeight}
              keyboardType="numeric"
              placeholder="e.g. 3.2"
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm"
            />
          </View>
          <View className="flex-grow flex-1">
            <Text className="text-slate-600 text-xs font-semibold mb-1">Birth Height (cm)</Text>
            <TextInput
              value={birthHeight}
              onChangeText={setBirthHeight}
              keyboardType="numeric"
              placeholder="e.g. 50"
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm"
            />
          </View>
        </View>

        {/* Birth Facility */}
        <View className="mb-6">
          <Text className="text-slate-600 text-xs font-semibold mb-1">Birth Facility / Clinic</Text>
          <TextInput
            value={birthFacility}
            onChangeText={setBirthFacility}
            placeholder="e.g. Pumwani Maternity Hospital"
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm"
          />
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
            <Text className="text-white font-bold text-base">{t('save')}</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}
