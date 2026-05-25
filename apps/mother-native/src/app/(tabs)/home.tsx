import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, Modal, TextInput, ActivityIndicator } from 'react-native';
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
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [phone, setPhone] = useState('');
  const [paywallStep, setPaywallStep] = useState<'select' | 'sending' | 'pin_sent' | 'success'>('select');
  const [paywallError, setPaywallError] = useState<string | null>(null);

  const price = selectedPlan === 'monthly' ? 150 : 1000;
  const isExpired = mother?.subscription_status === 'expired' || user?.subscription_status === 'expired';

  const handlePaywallSubmit = () => {
    if (!phone.match(/^(?:\+254|0)?(7|1)\d{8}$/)) {
      setPaywallError('Please enter a valid Safaricom M-Pesa number');
      return;
    }
    setPaywallError(null);
    setPaywallStep('sending');
    setTimeout(() => {
      setPaywallStep('pin_sent');
    }, 1500);
  };

  const handlePaywallSuccess = async () => {
    setPaywallStep('sending');
    try {
      const raw = localStorage.getItem('db_Mother') || '[]';
      const mothersStore = JSON.parse(raw);
      const motherId = mother?.id || user?.mother_id;
      const motherIdx = mothersStore.findIndex((m: any) => m.id === motherId || m.user_id === user?.id);
      
      if (motherIdx !== -1) {
        mothersStore[motherIdx].subscription_status = 'active';
        const expDate = new Date();
        if (selectedPlan === 'monthly') {
          expDate.setMonth(expDate.getMonth() + 1);
        } else {
          expDate.setFullYear(expDate.getFullYear() + 1);
        }
        mothersStore[motherIdx].subscription_expires_at = expDate.toISOString();
        localStorage.setItem('db_Mother', JSON.stringify(mothersStore));
      }

      setPaywallStep('success');
      setTimeout(() => {
        if (user) {
          useAuthStore.getState().updateUserProfile({
            subscription_status: 'active',
          });
        }
        setPaywallStep('select');
      }, 1500);
    } catch (err: any) {
      setPaywallError(err.message || 'Payment simulation failed');
      setPaywallStep('select');
    }
  };

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

      {/* M-Pesa Paywall Modal */}
      <Modal
        visible={isExpired}
        animationType="slide"
        transparent={true}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ width: '100%', maxWidth: 340, backgroundColor: '#FFFFFF', borderRadius: 28, padding: 24 }}>
            {paywallStep === 'select' && (
              <View>
                <View className="bg-amber-50 border border-amber-100 rounded-full py-1.5 px-3 self-center mb-4">
                  <Text className="text-amber-800 text-center font-bold text-[10px] uppercase tracking-wider">
                    ⚠️ Trial Period Expired
                  </Text>
                </View>
                
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#0F172A', textAlign: 'center', marginBottom: 8 }}>
                  Keep Your Child Protected
                </Text>
                <Text style={{ fontSize: 12, color: '#64748B', textAlign: 'center', lineHeight: 18, marginBottom: 20 }}>
                  Your 30-day grace trial has expired. Subscribe to continue receiving custom health alerts, vaccine schedules, and AI consultations.
                </Text>

                {/* Benefits */}
                <View className="bg-slate-50 border border-slate-100 rounded-2xl p-3 mb-5">
                  <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">PREMIUM FEATURES</Text>
                  <Text className="text-xs text-slate-700 font-semibold mb-1.5">✓ 24/7 Maternal AI Health Assistant</Text>
                  <Text className="text-xs text-slate-700 font-semibold mb-1.5">✓ WHO Smart Growth Tracking</Text>
                  <Text className="text-xs text-slate-700 font-semibold">✓ Vaccine Reminders via SMS & Push</Text>
                </View>

                {/* Plan Selector */}
                <View className="flex-row mb-5" style={{ gap: 12 }}>
                  <Pressable
                    onPress={() => setSelectedPlan('monthly')}
                    className={`flex-1 p-3 rounded-xl border ${selectedPlan === 'monthly' ? 'border-emerald-700 bg-emerald-50/10' : 'border-slate-200'}`}
                  >
                    <Text className="text-[9px] font-bold text-slate-400 uppercase">Monthly</Text>
                    <Text className="text-sm font-bold text-slate-900 mt-0.5">KES 150</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setSelectedPlan('yearly')}
                    className={`flex-1 p-3 rounded-xl border ${selectedPlan === 'yearly' ? 'border-emerald-700 bg-emerald-50/10' : 'border-slate-200'}`}
                  >
                    <Text className="text-[9px] font-bold text-slate-400 uppercase">Yearly</Text>
                    <Text className="text-sm font-bold text-slate-900 mt-0.5">KES 1,000</Text>
                  </Pressable>
                </View>

                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">M-Pesa Mobile Number</Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="e.g. 0712345678"
                  keyboardType="phone-pad"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-semibold text-sm mb-4"
                />

                {paywallError && (
                  <Text className="text-red-600 text-[11px] font-semibold mb-3 px-1">{paywallError}</Text>
                )}

                <Pressable
                  onPress={handlePaywallSubmit}
                  className="bg-emerald-700 rounded-xl py-3.5 items-center justify-center active:bg-emerald-800"
                >
                  <Text className="text-white font-bold text-sm">Pay KES {price} with M-Pesa</Text>
                </Pressable>
              </View>
            )}

            {paywallStep === 'sending' && (
              <View className="py-8 items-center justify-center">
                <ActivityIndicator size="large" color="#047857" className="mb-4" />
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0F172A', textAlign: 'center' }}>
                  Initiating M-Pesa STK Push...
                </Text>
                <Text style={{ fontSize: 12, color: '#64748B', textAlign: 'center', marginTop: 8 }}>
                  Sending payment request of KES {price} to {phone}.
                </Text>
              </View>
            )}

            {paywallStep === 'pin_sent' && (
              <View className="py-4 items-center justify-center">
                <Text style={{ fontSize: 32, marginBottom: 12 }}>📱</Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0F172A', textAlign: 'center', marginBottom: 8 }}>
                  Enter M-Pesa PIN
                </Text>
                <Text style={{ fontSize: 12, color: '#64748B', textAlign: 'center', lineHeight: 18, marginBottom: 20 }}>
                  A push prompt has been sent to {phone}. Please enter your M-Pesa PIN on your phone to approve the KES {price} subscription.
                </Text>

                <Pressable
                  onPress={handlePaywallSuccess}
                  className="bg-emerald-700 rounded-xl py-3.5 w-full items-center justify-center mb-3"
                >
                  <Text className="text-white font-bold text-sm">I Have Completed Payment</Text>
                </Pressable>

                <Pressable
                  onPress={() => setPaywallStep('select')}
                  className="bg-slate-100 rounded-xl py-3 w-full items-center justify-center"
                >
                  <Text className="text-slate-600 font-bold text-xs">Go Back</Text>
                </Pressable>
              </View>
            )}

            {paywallStep === 'success' && (
              <View className="py-8 items-center justify-center">
                <Text style={{ fontSize: 44, color: '#047857', marginBottom: 16 }}>✓</Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0F172A', textAlign: 'center' }}>
                  Payment Received!
                </Text>
                <Text style={{ fontSize: 12, color: '#64748B', textAlign: 'center', marginTop: 8 }}>
                  Your subscription is active. Unlocking TotoAfya services...
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
