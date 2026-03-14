import React, { useState, useEffect } from 'react';
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

  const fetchCustomTasks = () => {
    const saved = localStorage.getItem('focus_fit_custom_tasks');
    if (saved) {
      setCustomTasks(JSON.parse(saved));
    }
  };

  const categories: { id: TaskCategory | 'custom'; label: string }[] = [
    { id: 'custom', label: '我的自定义任务' },
    { id: 'diet', label: '饮食管理' },
    { id: 'exercise', label: '轻度运动' },
    { id: 'lifestyle', label: '生活习惯' },
  ];

  const handleAddCustom = () => {
    if (!customText.trim()) return;
    const newTask: Task = {
      id: `custom-${Date.now()}`,
      text: customText.trim(),
      category: 'lifestyle',
      intensity: 'medium',
    };

    const updated = [newTask, ...customTasks];
    setCustomTasks(updated);
    localStorage.setItem('focus_fit_custom_tasks', JSON.stringify(updated));
    onSelect(newTask);
    setCustomText('');
  };

  const handleDeleteCustom = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = customTasks.filter(t => t.id !== id);
    setCustomTasks(updated);
    localStorage.setItem('focus_fit_custom_tasks', JSON.stringify(updated));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <div className="bg-white w-full max-w-2xl h-[80vh] rounded-t-[3rem] sm:rounded-[3rem] shadow-[0px_-10px_40px_rgba(0,0,0,0.2)] border-t-8 sm:border-8 border-black flex flex-col overflow-hidden relative">
        <div className="p-8 border-b-4 border-black flex items-center justify-between bg-candy-yellow/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-candy-yellow/5 rounded-full -mr-16 -mt-16" />
          <div className="relative z-10">
            <h2 className="text-2xl font-black italic flex items-center gap-2">
              <Sparkles className="text-candy-orange" size={24} strokeWidth={3} />
              任务灵感库
            </h2>
            <p className="text-zinc-500 font-bold text-xs">点击任务添加到你的 Bingo 卡片</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full border-2 border-black transition-colors relative z-10">
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <div className="px-8 py-6 border-b-4 border-black bg-white">
          <div className="flex gap-3">
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="输入自定义任务..."
              className="flex-1 px-5 py-3 bg-zinc-50 border-2 border-black rounded-2xl text-sm font-bold focus:outline-none focus:bg-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
            />
            <button
              onClick={handleAddCustom}
              disabled={!customText.trim()}
              className="px-6 py-3 bg-candy-pink text-white rounded-full text-sm font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black hover:bg-candy-pink/90 transition-all disabled:opacity-50 disabled:shadow-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center gap-2 relative overflow-hidden group"
            >
              <div className="absolute inset-0 candy-gloss opacity-40 group-hover:opacity-60" />
              <Send size={18} strokeWidth={3} className="relative z-10" />
              <span className="relative z-10">添加</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
          {categories.map((cat) => {
            const tasks = cat.id === 'custom' 
              ? customTasks 
              : TASK_POOL.filter(t => t.category === cat.id);
            
            if (cat.id === 'custom' && tasks.length === 0) return null;

            return (
              <div key={cat.id} className="space-y-4">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] italic">{cat.label}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tasks.map(task => {
                    const isSelected = selectedIds.includes(task.id);
                    return (
                      <div
                        key={task.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => !isSelected && onSelect(task)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            !isSelected && onSelect(task);
                          }
                        }}
                        className={`flex items-center justify-between p-4 rounded-2xl text-left text-sm font-bold transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none relative overflow-hidden group ${
                          isSelected 
                          ? 'bg-zinc-100 border-zinc-300 text-zinc-400 shadow-none translate-x-[1px] translate-y-[1px]' 
                          : 'bg-white hover:bg-candy-cyan/10 text-zinc-800 cursor-pointer'
                        }`}
                      >
                        {!isSelected && <div className="absolute inset-0 candy-gloss opacity-0 group-hover:opacity-10" />}
                        <span className="relative z-10">{task.text}</span>
                        <div className="flex items-center gap-2 relative z-10">
                          {cat.id === 'custom' && (
                            <button
                              onClick={(e) => handleDeleteCustom(e, task.id)}
                              className="p-1.5 hover:bg-red-100 text-red-500 rounded-lg transition-colors"
                              title="删除自定义任务"
                            >
                              <Trash2 size={16} strokeWidth={3} />
                            </button>
                          )}
                          {!isSelected && <Plus size={18} className="text-candy-cyan shrink-0" strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

