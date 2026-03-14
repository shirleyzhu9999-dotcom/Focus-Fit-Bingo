import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { motion } from 'motion/react';
import { TASK_POOL } from '../constants/tasks';
import { Task, TaskCategory } from '../types';
import { X, Plus, Sparkles, Send, Trash2 } from 'lucide-react';

interface TaskLibraryProps {
  onSelect: (task: Task) => void;
  onClose: () => void;
  selectedIds: string[];
}

export const TaskLibrary: React.FC<TaskLibraryProps> = ({ onSelect, onClose, selectedIds }) => {
  const [customText, setCustomText] = useState('');
  const [customTasks, setCustomTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetchCustomTasks();
  }, []);

  const fetchCustomTasks = async () => {
    try {
      const res = await Taro.request({
        url: `${Taro.getEnv() === 'WEB' ? '' : 'https://your-api-domain.com'}/api/custom-tasks`,
        method: 'GET'
      });
      if (res.statusCode === 200) {
        setCustomTasks(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch custom tasks:', error);
    }
  };

  const categories: { id: TaskCategory | 'custom'; label: string }[] = [
    { id: 'custom', label: '我的自定义任务' },
    { id: 'diet', label: '饮食管理' },
    { id: 'exercise', label: '轻度运动' },
    { id: 'lifestyle', label: '生活习惯' },
  ];

  const handleAddCustom = async () => {
    if (!customText.trim()) return;
    const newTask: Task = {
      id: `custom-${Date.now()}`,
      text: customText.trim(),
      category: 'lifestyle',
      intensity: 'medium',
    };

    try {
      const res = await Taro.request({
        url: `${Taro.getEnv() === 'WEB' ? '' : 'https://your-api-domain.com'}/api/custom-tasks`,
        method: 'POST',
        data: newTask
      });

      if (res.statusCode === 200 || res.statusCode === 201) {
        setCustomTasks([newTask, ...customTasks]);
        onSelect(newTask);
        setCustomText('');
      }
    } catch (error) {
      console.error('Failed to save custom task:', error);
    }
  };

  const handleDeleteCustom = async (id: string) => {
    try {
      const res = await Taro.request({
        url: `${Taro.getEnv() === 'WEB' ? '' : 'https://your-api-domain.com'}/api/custom-tasks/${id}`,
        method: 'DELETE'
      });
      if (res.statusCode === 200) {
        setCustomTasks(customTasks.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete custom task:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <View className="bg-white w-full max-w-2xl h-[80vh] rounded-t-[3rem] sm:rounded-[3rem] shadow-[0px_-10px_40px_rgba(0,0,0,0.2)] border-t-8 sm:border-8 border-black flex flex-col overflow-hidden relative">
        <View className="p-8 border-b-4 border-black flex items-center justify-between bg-candy-yellow/10 relative overflow-hidden">
          <View className="absolute top-0 right-0 w-32 h-32 bg-candy-yellow/5 rounded-full -mr-16 -mt-16" />
          <View className="relative z-10">
            <Text className="text-2xl font-black italic flex items-center gap-2">
              <Sparkles className="text-candy-orange" size={24} strokeWidth={3} />
              任务灵感库
            </Text>
            <Text className="text-zinc-500 font-bold text-xs block">点击任务添加到你的 Bingo 卡片</Text>
          </View>
          <View onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full border-2 border-black transition-colors relative z-10">
            <X size={20} strokeWidth={3} />
          </View>
        </View>

        <View className="px-8 py-6 border-b-4 border-black bg-white">
          <View className="flex gap-3">
            <Input
              type="text"
              value={customText}
              onInput={(e) => setCustomText(e.detail.value)}
              placeholder="输入自定义任务..."
              className="flex-1 px-5 py-3 bg-zinc-50 border-2 border-black rounded-2xl text-sm font-bold focus:outline-none focus:bg-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            />
            <View
              onClick={handleAddCustom}
              className={`px-6 py-3 bg-candy-pink text-white rounded-full text-sm font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center gap-2 relative overflow-hidden ${!customText.trim() ? 'opacity-50' : ''}`}
            >
              <View className="absolute inset-0 candy-gloss opacity-40" />
              <Send size={18} strokeWidth={3} className="relative z-10" />
              <Text className="relative z-10">添加</Text>
            </View>
          </View>
        </View>

        <ScrollView scrollY className="flex-1 p-8 space-y-10">
          {categories.map((cat) => {
            const tasks = cat.id === 'custom' 
              ? customTasks 
              : TASK_POOL.filter(t => t.category === cat.id);
            
            if (cat.id === 'custom' && tasks.length === 0) return null;

            return (
              <View key={cat.id} className="space-y-4 mb-8">
                <Text className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] italic block mb-4">{cat.label}</Text>
                <View className="grid grid-cols-1 gap-3">
                  {tasks.map(task => {
                    const isSelected = selectedIds.includes(task.id);
                    return (
                      <View
                        key={task.id}
                        onClick={() => !isSelected && onSelect(task)}
                        className={`flex items-center justify-between p-4 rounded-2xl text-left text-sm font-bold transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none relative overflow-hidden mb-3 ${
                          isSelected 
                          ? 'bg-zinc-100 border-zinc-300 text-zinc-400 shadow-none translate-x-[1px] translate-y-[1px]' 
                          : 'bg-white text-zinc-800'
                        }`}
                      >
                        <Text className="relative z-10">{task.text}</Text>
                        <View className="flex items-center gap-2 relative z-10">
                          {cat.id === 'custom' && (
                            <View
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCustom(task.id);
                              }}
                              className="p-1.5 text-red-500 rounded-lg"
                            >
                              <Trash2 size={16} strokeWidth={3} />
                            </View>
                          )}
                          {!isSelected && <Plus size={18} className="text-candy-cyan shrink-0" strokeWidth={3} />}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </motion.div>
  );
};
