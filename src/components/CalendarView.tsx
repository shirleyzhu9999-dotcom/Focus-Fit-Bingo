import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, BarChart2, PieChart, X, Download, Check } from 'lucide-react';
import { DailyHistory } from '../types';

interface CalendarViewProps {
  onClose: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onClose }) => {
  const [view, setView] = useState<'day' | 'week' | 'month'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [history, setHistory] = useState<DailyHistory[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const saved = Taro.getStorageSync('focus_fit_history');
    if (saved) setHistory(saved);
  }, []);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const getStatsForDate = (dateStr: string) => history.find(h => h.date === dateStr);

  const handleSaveTasks = (tasks: string[], date: string) => {
    const content = `Focus Fit Bingo - ${date}\n完成项目清单:\n${tasks.map((t, i) => `${i + 1}. ${t}`).join('\n')}`;
    
    // In WeChat Mini Program, we copy to clipboard instead of downloading a file
    Taro.setClipboardData({
      data: content,
      success: () => {
        Taro.showToast({
          title: '报告已复制到剪贴板',
          icon: 'success'
        });
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
      }
    });
  };

  const handleMoodSelect = (mood: 'good' | 'neutral' | 'tired') => {
    const dateStr = formatDate(currentDate);
    const newHistory = [...history];
    const index = newHistory.findIndex(h => h.date === dateStr);
    
    if (index >= 0) {
      newHistory[index] = { ...newHistory[index], mood };
    } else {
      newHistory.push({
        date: dateStr,
        completedCount: 0,
        totalCount: 0,
        gridSize: 4,
        mood
      });
    }
    
    setHistory(newHistory);
    Taro.setStorageSync('focus_fit_history', newHistory);
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days: React.ReactNode[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} className="aspect-square" />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = formatDate(new Date(year, month, d));
      const stats = getStatsForDate(dateStr);
      const rate = stats ? (stats.completedCount / stats.totalCount) * 100 : 0;

      days.push(
        <View 
          key={d} 
          onClick={() => {
            setCurrentDate(new Date(year, month, d));
            setView('day');
          }}
          className="relative aspect-square flex flex-col items-center justify-center border-2 border-black rounded-xl transition-colors bg-white overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
        >
          <Text className="relative z-10 text-xs font-black text-zinc-900 mb-1">{d}</Text>
          {stats && (
            <View className="flex gap-0.5 relative z-10">
              <View 
                className="w-2.5 h-2.5 rounded-full border border-black" 
                style={{ 
                  backgroundColor: rate >= 100 ? '#39FF14' : rate > 50 ? '#00D4FF' : rate > 0 ? '#FFD700' : '#e5e7eb' 
                }} 
              />
              {stats.mood && (
                <Text className="text-[8px] leading-none">
                  {stats.mood === 'good' ? '😊' : stats.mood === 'neutral' ? '😐' : '😣'}
                </Text>
              )}
            </View>
          )}
        </View>
      );
    }

    return (
      <View className="space-y-4">
        <View className="grid grid-cols-7 gap-1 text-center mb-2">
          {['日', '一', '二', '三', '四', '五', '六'].map(d => (
            <View key={d} className="text-[10px] font-bold text-zinc-400 uppercase">{d}</View>
          ))}
        </View>
        <View className="grid grid-cols-7 gap-1">
          {days}
        </View>
      </View>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const weekDays: React.ReactNode[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      const dateStr = formatDate(day);
      const stats = getStatsForDate(dateStr);
      const rate = stats ? (stats.completedCount / stats.totalCount) * 100 : 0;

      weekDays.push(
        <View 
          key={i} 
          onClick={() => {
            setCurrentDate(day);
            setView('day');
          }}
          className="flex items-center gap-4 p-4 bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
        >
          <View className="w-12 text-center relative z-10">
            <View className="text-[10px] font-black text-zinc-400 uppercase italic">{['日', '一', '二', '三', '四', '五', '六'][i]}</View>
            <View className="text-xl font-black text-zinc-900">{day.getDate()}</View>
          </View>
          <View className="flex-1 relative z-10">
            <View className="flex justify-between items-end mb-1">
              <Text className="text-xs font-black text-zinc-600 italic">{stats ? `完成 ${stats.completedCount} 项` : '无记录'}</Text>
              <Text className="text-xs font-black text-candy-pink">{Math.round(rate)}%</Text>
            </View>
            <View className="h-3 bg-zinc-100 rounded-full border-2 border-black overflow-hidden relative">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${rate}%` }}
                className="h-full bg-candy-green relative"
              >
                <View className="absolute inset-0 candy-gloss opacity-30" />
              </motion.div>
            </View>
          </View>
        </View>
      );
    }

    return <View className="space-y-3">{weekDays}</View>;
  };

  const renderDayView = () => {
    const dateStr = formatDate(currentDate);
    const stats = getStatsForDate(dateStr);
    const rate = stats ? (stats.completedCount / stats.totalCount) * 100 : 0;

    return (
      <View className="space-y-6 py-4">
        <View className="text-center space-y-1">
          <Text className="text-5xl font-black text-zinc-900 italic drop-shadow-[2px_2px_0px_rgba(255,77,148,1)] block">{currentDate.getDate()}</Text>
          <Text className="text-sm text-zinc-500 font-black uppercase tracking-widest block">
            {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
          </Text>
        </View>

        {stats ? (
          <View className="grid grid-cols-2 gap-4">
            <View 
              onClick={() => setShowDetails(true)}
              className="bg-candy-yellow p-6 rounded-[2rem] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center relative overflow-hidden active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
              <View className="absolute inset-0 candy-gloss opacity-30" />
              <View className="text-zinc-900 mb-2 relative z-10"><BarChart2 size={28} className="mx-auto" strokeWidth={3} /></View>
              <View className="text-3xl font-black text-zinc-900 relative z-10">{stats.completedCount}</View>
              <View className="text-[10px] font-black text-zinc-900/60 uppercase italic relative z-10">完成数量 (点击查看)</View>
            </View>
            <View className="bg-candy-cyan p-6 rounded-[2rem] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center text-white relative overflow-hidden">
              <View className="absolute inset-0 candy-gloss opacity-30" />
              <View className="text-white mb-2 relative z-10"><PieChart size={28} className="mx-auto" strokeWidth={3} /></View>
              <View className="text-3xl font-black relative z-10">{Math.round(rate)}%</View>
              <View className="text-[10px] font-black text-white/60 uppercase italic relative z-10">完成率</View>
            </View>
          </View>
        ) : (
          <View className="bg-white p-12 rounded-[2rem] border-4 border-dashed border-black text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] relative overflow-hidden">
            <View className="absolute inset-0 candy-gloss opacity-5" />
            <Text className="text-zinc-400 text-sm font-black italic relative z-10">今日暂无完成记录</Text>
          </View>
        )}

        {/* Mood Section */}
        <View className="bg-white p-6 rounded-[2rem] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4 relative overflow-hidden">
          <View className="absolute top-0 right-0 w-24 h-24 bg-candy-pink/5 rounded-full -mr-12 -mt-12" />
          <View className="relative z-10">
            <Text className="text-sm font-black text-zinc-900 italic mb-1 block">今天感觉如何？</Text>
            <Text className="text-[10px] text-zinc-400 font-bold leading-tight block">记录情绪可以帮助系统自动定义难度</Text>
          </View>
          <View className="grid grid-cols-3 gap-3 relative z-10">
            {[
              { id: 'good', label: '还不错', emoji: '😊', color: 'bg-candy-green' },
              { id: 'neutral', label: '一般', emoji: '😐', color: 'bg-candy-yellow' },
              { id: 'tired', label: '有点累', emoji: '😣', color: 'bg-candy-pink' }
            ].map((m) => (
              <View
                key={m.id}
                onClick={() => handleMoodSelect(m.id as any)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-black transition-all active:translate-y-1 active:shadow-none ${
                  stats?.mood === m.id 
                    ? `${m.color} text-white shadow-none` 
                    : 'bg-zinc-50 text-zinc-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                <Text className="text-2xl mb-1">{m.emoji}</Text>
                <Text className="text-[10px] font-black whitespace-nowrap">{m.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <AnimatePresence>
          {showDetails && stats && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] border-4 border-black p-8 space-y-6 relative overflow-hidden"
              >
                <View className="absolute top-0 right-0 w-32 h-32 bg-candy-yellow/5 rounded-full -mr-16 -mt-16" />
                
                <View className="flex items-center justify-between relative z-10">
                  <Text className="text-2xl font-black italic">完成清单</Text>
                  <View 
                    onClick={() => setShowDetails(false)}
                    className="p-2 hover:bg-zinc-100 rounded-full border-2 border-black transition-colors"
                  >
                    <X size={20} strokeWidth={3} />
                  </View>
                </View>

                <ScrollView scrollY className="space-y-3 max-h-[40vh] relative z-10">
                  {stats.completedTasks && stats.completedTasks.length > 0 ? (
                    stats.completedTasks.map((task, idx) => (
                      <View 
                        key={idx}
                        className="p-4 rounded-2xl bg-zinc-50 border-2 border-black flex items-start gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] mb-3"
                      >
                        <View className="mt-1 p-1 bg-candy-green rounded-full border border-black">
                          <Check size={12} strokeWidth={4} className="text-white" />
                        </View>
                        <Text className="font-bold text-zinc-900 text-sm">{task}</Text>
                      </View>
                    ))
                  ) : (
                    <Text className="text-zinc-400 font-bold text-center py-8 italic block">暂无具体任务记录</Text>
                  )}
                </ScrollView>

                <View
                  onClick={() => stats.completedTasks && handleSaveTasks(stats.completedTasks, dateStr)}
                  className={`w-full py-4 rounded-2xl border-4 border-black font-black flex items-center justify-center gap-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all relative overflow-hidden ${
                    isSaved ? 'bg-candy-green text-white' : 'bg-candy-pink text-white'
                  }`}
                >
                  <View className="absolute inset-0 candy-gloss opacity-30" />
                  <View className="relative z-10 flex items-center justify-center gap-2">
                    {isSaved ? (
                      <>
                        <Check size={20} strokeWidth={3} />
                        <Text>已复制报告</Text>
                      </>
                    ) : (
                      <>
                        <Download size={20} strokeWidth={3} />
                        <Text>复制清单报告</Text>
                      </>
                    )}
                  </View>
                </View>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </View>
    );
  };

  const changeDate = (offset: number) => {
    const newDate = new Date(currentDate);
    if (view === 'month') newDate.setMonth(currentDate.getMonth() + offset);
    else if (view === 'week') newDate.setDate(currentDate.getDate() + offset * 7);
    else newDate.setDate(currentDate.getDate() + offset);
    setCurrentDate(newDate);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-[3rem] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] border-4 border-black overflow-hidden flex flex-col h-[70vh] max-w-md mx-auto"
    >
      {/* Header */}
      <View className="p-8 border-b-4 border-black flex flex-col shrink-0 bg-candy-cyan/10 relative overflow-hidden">
        <View className="absolute top-0 right-0 w-32 h-32 bg-candy-cyan/5 rounded-full -mr-16 -mt-16" />
        
        <View className="flex items-center justify-between mb-6 relative z-10">
          <View className="flex items-center gap-3">
            <View className="p-3 bg-candy-cyan rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-white relative overflow-hidden">
              <View className="absolute inset-0 candy-gloss opacity-40" />
              <CalendarIcon size={24} strokeWidth={3} className="relative z-10" />
            </View>
            <Text className="text-2xl font-black text-zinc-900 italic">成长日历</Text>
          </View>
          <View className="flex gap-1 bg-black p-1.5 rounded-2xl border-2 border-black">
            {(['day', 'week', 'month'] as const).map(v => (
              <View
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all relative overflow-hidden ${
                  view === v ? 'bg-white text-zinc-900' : 'text-white/60'
                }`}
              >
                {view === v && <View className="absolute inset-0 candy-gloss opacity-20" />}
                <Text className="relative z-10">{v === 'day' ? '日' : v === 'week' ? '周' : '月'}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Today's Mood Quick Select */}
        <View className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between relative z-10">
          <View className="flex flex-col">
            <Text className="text-[10px] font-black text-zinc-400 uppercase italic">今日心情</Text>
            <Text className="text-xs font-black text-zinc-900">记录心情以调整难度</Text>
          </View>
          <View className="flex gap-2">
            {[
              { id: 'good', emoji: '😊', color: 'bg-candy-green' },
              { id: 'neutral', emoji: '😐', color: 'bg-candy-yellow' },
              { id: 'tired', emoji: '😣', color: 'bg-candy-pink' }
            ].map((m) => {
              const today = formatDate(new Date());
              const stats = history.find(h => h.date === today);
              const isActive = stats?.mood === m.id;
              
              return (
                <View
                  key={m.id}
                  onClick={() => {
                    const originalDate = currentDate;
                    setCurrentDate(new Date());
                    handleMoodSelect(m.id as any);
                    setCurrentDate(originalDate);
                  }}
                  className={`w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center text-xl transition-all active:translate-y-1 active:shadow-none ${
                    isActive 
                      ? `${m.color} shadow-none` 
                      : 'bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  {m.emoji}
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Navigation */}
      <View className="px-8 py-4 flex items-center justify-between shrink-0 bg-white">
        <View onClick={() => changeDate(-1)} className="p-2 hover:bg-zinc-100 rounded-full border-2 border-black transition-colors">
          <ChevronLeft size={20} strokeWidth={3} className="text-zinc-900" />
        </View>
        <Text className="text-lg font-black text-zinc-900 italic">
          {view === 'month' 
            ? `${currentDate.getFullYear()}年 ${currentDate.getMonth() + 1}月`
            : view === 'week'
              ? `第 ${Math.ceil(currentDate.getDate() / 7)} 周`
              : `${currentDate.getMonth() + 1}月 ${currentDate.getDate()}日`
          }
        </Text>
        <View onClick={() => changeDate(1)} className="p-2 hover:bg-zinc-100 rounded-full border-2 border-black transition-colors">
          <ChevronRight size={20} strokeWidth={3} className="text-zinc-900" />
        </View>
      </View>

      {/* Content */}
      <ScrollView scrollY className="flex-1 p-8 bg-white">
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'day' && renderDayView()}
      </ScrollView>
    </motion.div>
  );
};
