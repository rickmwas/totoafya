import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useLanguageStore } from '../store/languageStore';

export default function LockScreen() {
  const { user, unlockSession, logout } = useAuthStore();
  const { language } = useLanguageStore();
  const [pin, setPin] = useState('');

  const handleKeyPress = async (num: number) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      
      if (nextPin.length === 4) {
        const success = await unlockSession(nextPin);
        if (!success) {
          Alert.alert(
            language === 'sw' ? 'Msimbo Sio Sahihi' : 'Incorrect PIN',
            language === 'sw' ? 'Tafadhali jaribu tena.' : 'Please try again.'
          );
          setPin('');
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <View className="flex-1 bg-slate-900 justify-center items-center px-6">
      {/* Header */}
      <View className="items-center mb-10">
        <View className="w-20 h-20 bg-emerald-700 rounded-3xl justify-center items-center mb-4 shadow-lg shadow-emerald-950">
          <Text className="text-white text-3xl font-bold font-serif">
            {user?.full_name ? user.full_name[0].toUpperCase() : 'M'}
          </Text>
        </View>
        <Text className="text-white text-xl font-bold">{user?.full_name || 'Caregiver'}</Text>
        <Text className="text-slate-400 text-xs mt-1">
          {language === 'sw' ? 'Weka PIN yako kufungua programu' : 'Enter PIN to unlock app'}
        </Text>
      </View>

      {/* Dots indicator */}
      <View className="flex-row gap-6 mb-12">
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            className={`w-4.5 h-4.5 rounded-full border-2 border-slate-700 ${
              pin.length >= i ? 'bg-emerald-500 border-emerald-500 shadow-lg' : 'bg-transparent'
            }`}
          />
        ))}
      </View>

      {/* Numeric Keypad */}
      <View className="w-full max-w-[280px] flex-row flex-wrap justify-between gap-y-4 mb-10">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Pressable
            key={num}
            onPress={() => handleKeyPress(num)}
            className="w-20 h-20 rounded-full bg-slate-800 border border-slate-700 justify-center items-center active:bg-slate-700"
          >
            <Text className="text-white text-2xl font-semibold">{num}</Text>
          </Pressable>
        ))}

        <Pressable
          onPress={() => setPin('')}
          className="w-20 h-20 rounded-full justify-center items-center active:opacity-60"
        >
          <Text className="text-slate-400 text-xs font-semibold">
            {language === 'sw' ? 'Futa' : 'Clear'}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => handleKeyPress(0)}
          className="w-20 h-20 rounded-full bg-slate-800 border border-slate-700 justify-center items-center active:bg-slate-700"
        >
          <Text className="text-white text-2xl font-semibold">0</Text>
        </Pressable>

        <Pressable
          onPress={handleBackspace}
          className="w-20 h-20 rounded-full justify-center items-center active:opacity-60"
        >
          <Text className="text-slate-400 text-xs font-semibold">
            {language === 'sw' ? 'Rudisha' : 'Delete'}
          </Text>
        </Pressable>
      </View>

      {/* Sign Out Fallback */}
      <Pressable onPress={logout} className="active:opacity-60 py-2">
        <Text className="text-slate-400 text-xs font-bold underline">
          {language === 'sw' ? 'Toka kwenye Akaunti' : 'Sign Out Account'}
        </Text>
      </Pressable>
    </View>
  );
}
