import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useHealthSummary } from '../../hooks/useHealthSummary';
import { useLanguageStore } from '../../store/languageStore';
import { Scale, Ruler, CheckCircle, AlertTriangle } from 'lucide-react-native';
import { classifyNutritionStatus } from '@totoafya/business-logic';

export default function GrowthScreen() {
  const { activeChild, growthRecords, addGrowthRecord, activeChildNutritionStatus } = useHealthSummary();
  const { t } = useLanguageStore();

  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [muac, setMuac] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!activeChild) return;
    if (!weight) {
      Alert.alert('Error', 'Please provide at least Weight (kg)');
      return;
    }

    setLoading(true);
    try {
      const weightNum = parseFloat(weight);
      const heightNum = height ? parseFloat(height) : undefined;
      const muacNum = muac ? parseFloat(muac) : undefined;

      if (isNaN(weightNum) || (height && isNaN(heightNum!)) || (muac && isNaN(muacNum!))) {
        Alert.alert('Error', 'Please enter valid numerical values');
        setLoading(false);
        return;
      }

      // Calculate age in months
      const dob = new Date(activeChild.date_of_birth);
      const today = new Date();
      const diffTime = today.getTime() - dob.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      const ageMonths = Math.floor(diffDays / 30.4) || 0;
      const ageWeeks = Math.floor(diffDays / 7) || 0;

      await addGrowthRecord({
        child_id: activeChild.id,
        recorded_date: new Date().toISOString().split('T')[0],
        age_months: ageMonths,
        age_weeks: ageWeeks,
        weight_kg: weightNum,
        height_cm: heightNum,
        muac_cm: muacNum,
        notes: notes || undefined,
        recorded_by: 'Mother',
      });

      // Clear input fields
      setWeight('');
      setHeight('');
      setMuac('');
      setNotes('');
      Alert.alert('Success', 'Measurement added successfully');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add growth measurement');
    } finally {
      setLoading(false);
    }
  };

  if (!activeChild) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center p-6">
        <AlertTriangle color="#A0A0A0" size={32} className="mb-2" />
        <Text className="text-slate-500 text-sm font-semibold text-center">
          Please select or add a child profile on the home dashboard to track growth.
        </Text>
      </View>
    );
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sam': return 'Severe Acute Malnutrition (SAM) - Consult a doctor immediately!';
      case 'mam': return 'Moderate Acute Malnutrition (MAM) - Provide feeding support.';
      case 'overweight': return 'Overweight - Maintain balanced feeding.';
      default: return 'Normal Weight - Keep up the healthy habits!';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sam': return 'text-red-700 bg-red-50 border-red-200';
      case 'mam': return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'overweight': return 'text-blue-800 bg-blue-50 border-blue-200';
      default: return 'text-emerald-800 bg-emerald-50 border-emerald-200';
    }
  };

  return (
    <ScrollView className="bg-slate-50 flex-1 px-4 py-6">
      {/* Nutrition status banner */}
      {growthRecords.length > 0 && (
        <View className={`rounded-3xl p-5 mb-6 border ${getStatusColor(activeChildNutritionStatus)}`}>
          <Text className="font-bold text-sm uppercase tracking-wider mb-1">Nutrition Status</Text>
          <Text className="font-extrabold text-lg">{activeChildNutritionStatus.toUpperCase()}</Text>
          <Text className="text-xs mt-2 font-medium opacity-90">{getStatusText(activeChildNutritionStatus)}</Text>
        </View>
      )}

      {/* Input measurement form */}
      <View className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-6">
        <Text className="text-slate-800 text-lg font-bold mb-4">{t('add_measurement')}</Text>

        <View className="flex-row space-x-4 flex-wrap mb-4">
          <View className="flex-1 min-w-[45%] mr-2">
            <Text className="text-slate-600 text-xs font-semibold mb-1">{t('weight')} (kg) *</Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Scale color="#A0A0A0" size={16} className="mr-2" />
              <TextInput
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                placeholder="e.g. 7.5"
                className="flex-1 text-slate-800 text-sm ml-1"
              />
            </View>
          </View>

          <View className="flex-1 min-w-[45%]">
            <Text className="text-slate-600 text-xs font-semibold mb-1">{t('height')} (cm)</Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Ruler color="#A0A0A0" size={16} className="mr-2" />
              <TextInput
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
                placeholder="e.g. 68.2"
                className="flex-1 text-slate-800 text-sm ml-1"
              />
            </View>
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-slate-600 text-xs font-semibold mb-1">{t('muac')} (cm)</Text>
          <TextInput
            value={muac}
            onChangeText={setMuac}
            keyboardType="numeric"
            placeholder="e.g. 12.5"
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm"
          />
        </View>

        <View className="mb-6">
          <Text className="text-slate-600 text-xs font-semibold mb-1">Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g. Exclusive breastfeeding"
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm"
          />
        </View>

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

      {/* Historical List */}
      <Text className="text-slate-800 text-lg font-bold mb-4">Measurement History</Text>
      {growthRecords.length === 0 ? (
        <View className="bg-white rounded-3xl p-8 items-center justify-center border border-slate-100 shadow-sm">
          <Text className="text-slate-400 text-sm font-semibold">{t('no_data')}</Text>
        </View>
      ) : (
        [...growthRecords]
          .sort((a, b) => new Date(b.recorded_date).getTime() - new Date(a.recorded_date).getTime())
          .map((item) => (
            <View 
              key={item.id} 
              className="bg-white rounded-3xl p-5 mb-4 border border-slate-100 shadow-sm flex-row justify-between items-center"
            >
              <View>
                <Text className="text-slate-800 font-bold text-base">
                  {item.weight_kg} kg
                  {item.height_cm ? ` / ${item.height_cm} cm` : ''}
                </Text>
                {item.muac_cm && (
                  <Text className="text-slate-500 text-xs mt-1">MUAC: {item.muac_cm} cm</Text>
                )}
                <Text className="text-slate-400 text-[10px] mt-2">
                  Recorded: {item.recorded_date} ({item.age_months} Months Old)
                </Text>
              </View>
              <View className="bg-emerald-50 px-3 py-1.5 rounded-xl">
                <Text className="text-emerald-800 font-bold text-xs">
                  {classifyNutritionStatus(item.weight_kg, item.age_months || 0, item.muac_cm).toUpperCase()}
                </Text>
              </View>
            </View>
          ))
      )}
      <View className="h-10" />
    </ScrollView>
  );
}
