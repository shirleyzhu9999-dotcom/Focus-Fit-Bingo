import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Sparkles, Calendar as CalendarIcon, LayoutGrid } from 'lucide-react';
import { UserData } from '../../types';
import { InputForm } from '../../components/InputForm';
import { BingoGrid } from '../../components/BingoGrid';
import { CalendarView } from '../../components/CalendarView';

export default function Index() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState<'bingo' | 'calendar'>('bingo');

  useEffect(() => {
    const saved = Taro.getStorageSync('focus_fit_user_data');
    if (saved) {
      setUserData(saved);
      setIsInitialized(true);
    }
  }, []);

  const handleFormSubmit = (data: UserData) => {
    setUserData(data);
    Taro.setStorageSync('focus_fit_user_data', data);
    setIsInitialized(true);
  };

  const handleReset = () => {
    setIsInitialized(false);
  };

  return (
    <View className="min-h-screen bg-[#FFF5F8] text-zinc-900 font-sans selection:bg-candy-pink selection:text-white pb-24 relative overflow-x-hidden">
      {/* Dynamic Background Elements */}
      <View className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-10">
        <View className="absolute top-10 left-10 w-24 h-24 border-[12px] border-candy-yellow rounded-full animate-pulse" />
        <View className="absolute top-1/4 -right-10 w-40 h-40 border-[12px] border-candy-cyan rotate-45" />
        <View className="absolute bottom-40 left-1/4 w-16 h-16 bg-candy-pink rounded-2xl rotate-12" />
        <View className="absolute top-1/2 -left-16 w-32 h-32 border-[12px] border-candy-green rounded-full" />
        <View className="absolute bottom-10 right-10 w-20 h-20 border-[12px] border-candy-purple rotate-12" />
        <View className="absolute top-1/3 left-1/2 w-8 h-8 bg-candy-orange rounded-full" />
      </View>

      <View className="pt-8 pb-6 px-4 text-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-dopa-yellow text-zinc-900 rounded-full text-xs font-black uppercase tracking-widest mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
        >
          <Target size={14} strokeWidth={3} />
          ADHD Friendly
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-5xl font-black tracking-tighter text-zinc-900 mb-2 italic"
        >
          Focus Fit <Text className="text-dopa-pink drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">Bingo</Text>
        </motion.h1>
        <Text className="text-zinc-600 text-sm max-w-xs mx-auto font-bold bg-white/50 backdrop-blur-sm py-1 rounded-lg block">
          专属你的个性化减肥任务，轻松开启每一天。
        </Text>
      </View>

      <View className="container mx-auto max-w-4xl px-4">
        <AnimatePresence mode="wait">
          {!isInitialized ? (
            <motion.div
              key="input-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="py-4"
            >
              <View className="mb-8 text-center">
                <View className="inline-block p-6 bg-dopa-blue rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black mb-4">
                  <Sparkles className="text-white" size={40} />
                </View>
                <View className="text-2xl font-black mb-1">输入基础数据</View>
                <View className="text-zinc-500 font-bold">我们将根据你的体型和目标生成适配任务</View>
              </View>
              <InputForm onSubmit={handleFormSubmit} />
            </motion.div>
          ) : (
            userData && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {activeTab === 'bingo' ? (
                  <BingoGrid userData={userData} onReset={handleReset} />
                ) : (
                  <CalendarView onClose={() => setActiveTab('bingo')} />
                )}
              </motion.div>
            )
          )}
        </AnimatePresence>
      </View>

      {/* Navigation Bar */}
      {isInitialized && (
        <View className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <View className="bg-white p-2 rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black flex items-center gap-2">
            <View
              onClick={() => setActiveTab('bingo')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-black transition-all ${
                activeTab === 'bingo' 
                ? 'bg-dopa-pink text-white shadow-lg' 
                : 'text-zinc-400 hover:text-zinc-900'
              }`}
            >
              <LayoutGrid size={18} strokeWidth={3} />
              任务网格
            </View>
            <View
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-black transition-all ${
                activeTab === 'calendar' 
                ? 'bg-dopa-blue text-white shadow-lg' 
                : 'text-zinc-400 hover:text-zinc-900'
              }`}
            >
              <CalendarIcon size={18} strokeWidth={3} />
              成长日历
            </View>
          </View>
        </View>
      )}

      <View className="py-8 text-center text-zinc-400 text-xs">
        <View>© 2024 Focus Fit Bingo · 专为 ADHD 设计的减重伴侣</View>
      </View>
    </View>
  );
}
