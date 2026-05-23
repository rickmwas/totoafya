import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { askAiAssistant, ChatMessage } from '../../services/llmService';
import { useLanguageStore } from '../../store/languageStore';
import { Send, Sparkles } from 'lucide-react-native';

export default function ChatScreen() {
  const { language, t } = useLanguageStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);

  // Initialize with greeting
  useEffect(() => {
    const greetingMsg: ChatMessage = {
      id: 'greeting',
      role: 'model',
      content: language === 'sw'
        ? 'Habari! Mimi ni Msaidizi wako wa Afya wa TotoAfya. Niko hapa kukusaidia kufuatilia afya yako na ya mtoto wako. Una swali gani leo?'
        : 'Hello! I am your TotoAfya Digital Health Assistant. I am here to help you monitor your maternal and child health. How can I help you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([greetingMsg]);
  }, [language]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setSending(true);

    try {
      const response = await askAiAssistant(userMsg.content, messages, language);
      
      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        role: 'model',
        content: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View className={`flex-row mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
        {!isUser && (
          <View className="h-8 w-8 rounded-full bg-emerald-700 items-center justify-center mr-2 mt-1">
            <Sparkles color="#FFFFFF" size={14} />
          </View>
        )}
        <View 
          className={`max-w-[75%] rounded-3xl p-4 shadow-sm ${isUser ? 'bg-emerald-700 rounded-tr-none' : 'bg-white border border-slate-100 rounded-tl-none'}`}
        >
          <Text className={`text-sm ${isUser ? 'text-white' : 'text-slate-800'}`}>
            {item.content}
          </Text>
          <Text className={`text-[10px] mt-1.5 text-right ${isUser ? 'text-emerald-200' : 'text-slate-400'}`}>
            {item.timestamp}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      className="flex-1 bg-slate-50"
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {sending && (
        <View className="flex-row items-center px-6 py-2">
          <ActivityIndicator color="#1B6B5A" size="small" className="mr-3" />
          <Text className="text-slate-400 text-xs italic">{t('analyzing')}</Text>
        </View>
      )}

      {/* Input row */}
      <View className="p-4 border-t border-slate-100 bg-white flex-row items-center">
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
          placeholder={language === 'sw' ? 'Weka swali lako hapa...' : 'Type your query here...'}
          className="flex-grow bg-slate-50 border border-slate-200 rounded-full px-5 py-3 text-slate-800 text-sm mr-3 max-h-[100px]"
          multiline
        />
        <Pressable 
          onPress={handleSend}
          disabled={sending}
          className="bg-emerald-700 p-3.5 rounded-full items-center justify-center active:bg-emerald-800"
        >
          <Send color="#FFFFFF" size={16} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
