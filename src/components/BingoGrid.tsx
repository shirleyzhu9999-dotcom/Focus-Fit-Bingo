import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, Textarea, ITouchEvent } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, RefreshCw, Settings2, Shuffle, Play, Trophy, Plus, Save, List, X } from 'lucide-react';
import { Task, GridSize, UserData, SavedGrid } from '../types';
import { generateBingoTasks, calculateBMI } from '../utils/bingoGenerator';
import { TASK_POOL } from '../constants/tasks';
import { TaskLibrary } from './TaskLibrary';

interface BingoGridProps {
  userData: UserData;
  onReset: () => void;
}

export const BingoGrid: React.FC<BingoGridProps> = ({ userData, onReset }) => {
  const [gridSize, setGridSize] = useState<GridSize>(5);
  const [tasks, setTasks] = useState<(Task & { completed: boolean })[]>([]);
  const [showFeedback, setShowFeedback] = useState<string | null>(null);
  const [showBingo, setShowBingo] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [savedGrids, setSavedGrids] = useState<SavedGrid[]>([]);
  const [showSavedList, setShowSavedList] = useState(false);
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);
  const [flashingTaskId, setFlashingTaskId] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [customTasks, setCustomTasks] = useState<Task[]>([]);
  
  const celebratedBingos = useRef<Set<string>>(new Set());

  useEffect(() => {
    const saved = Taro.getStorageSync('focus_fit_saved_grids');
    if (saved) setSavedGrids(saved);
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

  const triggerConfetti = () => {
    // In WeChat Mini Program, native confetti is complex. 
    // We'll use a simple visual feedback or Taro.showToast for now
    // unless a specific canvas-based confetti is implemented.
    Taro.showToast({
      title: '🎉 BINGO! 🎉',
      icon: 'none',
      duration: 3000
    });
  };

  const checkBingo = useCallback((currentTasks: (Task & { completed: boolean })[]) => {
    const size = gridSize;
    const grid = Array.from({ length: size }, (_, i) => 
      currentTasks.slice(i * size, (i + 1) * size)
    );

    let foundNewBingo = false;
    const currentBingoKeys = new Set<string>();

    for (let i = 0; i < size; i++) {
      if (grid[i].every(t => t.completed)) {
        const key = `row-${i}`;
        currentBingoKeys.add(key);
        if (!celebratedBingos.current.has(key)) foundNewBingo = true;
      }
    }

    for (let i = 0; i < size; i++) {
      if (grid.every(row => row[i].completed)) {
        const key = `col-${i}`;
        currentBingoKeys.add(key);
        if (!celebratedBingos.current.has(key)) foundNewBingo = true;
      }
    }

    if (grid.every((row, i) => row[i].completed)) {
      const key = 'diag-1';
      currentBingoKeys.add(key);
      if (!celebratedBingos.current.has(key)) foundNewBingo = true;
    }
    if (grid.every((row, i) => row[size - 1 - i].completed)) {
      const key = 'diag-2';
      currentBingoKeys.add(key);
      if (!celebratedBingos.current.has(key)) foundNewBingo = true;
    }

    celebratedBingos.current = currentBingoKeys;
    return foundNewBingo;
  }, [gridSize]);

  useEffect(() => {
    const newTasks = generateBingoTasks(userData, gridSize).map(t => ({ ...t, completed: false }));
    setTasks(newTasks);
    celebratedBingos.current.clear();
  }, [userData, gridSize]);

  const toggleTask = (id: string) => {
    if (editingTaskId) return;
    setTasks(prev => {
      const newTasks = prev.map(t => {
        if (t.id === id) {
          const isCompleting = !t.completed;
          if (isCompleting) {
            const feedbacks = ['太棒啦！', '离目标又近一步', '完成即胜利！', '你是最棒的！', '坚持就是胜利'];
            setShowFeedback(feedbacks[Math.floor(Math.random() * feedbacks.length)]);
            setTimeout(() => setShowFeedback(null), 1500);
          }
          return { ...t, completed: isCompleting };
        }
        return t;
      });

      const today = new Date().toISOString().split('T')[0];
      const completedTasksList = newTasks.filter(t => t.completed).map(t => t.text);
      const completedCount = completedTasksList.length;
      const history: any[] = Taro.getStorageSync('focus_fit_history') || [];
      const existingIndex = history.findIndex(h => h.date === today);
      
      if (existingIndex >= 0) {
        history[existingIndex].completedCount = completedCount;
        history[existingIndex].totalCount = newTasks.length;
        history[existingIndex].completedTasks = completedTasksList;
      } else {
        history.push({
          date: today,
          completedCount,
          totalCount: newTasks.length,
          gridSize,
          completedTasks: completedTasksList
        });
      }
      Taro.setStorageSync('focus_fit_history', history);

      if (checkBingo(newTasks)) {
        setShowBingo(true);
        triggerConfetti();
        setTimeout(() => setShowBingo(false), 3000);
      }
      return newTasks;
    });
  };

  const handleLongPress = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
  };

  const saveEdit = () => {
    if (!editingTaskId) return;
    setTasks(prev => prev.map(t => 
      t.id === editingTaskId ? { ...t, text: editingText.trim() || t.text } : t
    ));
    setEditingTaskId(null);
  };

  const handleShuffle = () => {
    setTasks(prev => {
      const newTasks = [...prev];
      for (let i = newTasks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newTasks[i], newTasks[j]] = [newTasks[j], newTasks[i]];
      }
      return newTasks;
    });
  };

  const handleRestart = () => {
    setTasks(prev => prev.map(t => ({ ...t, completed: false })));
    celebratedBingos.current.clear();
  };

  const handleRandomTask = () => {
    if (isSelecting) return;
    const uncompleted = tasks.filter(t => !t.completed);
    if (uncompleted.length === 0) return;

    setIsSelecting(true);
    setHighlightedTaskId(null);
    setFlashingTaskId(null);
    
    let iterations = 0;
    const maxIterations = 25;
    const baseDelay = 60;
    
    const runScan = () => {
      const randomIndex = Math.floor(Math.random() * uncompleted.length);
      setFlashingTaskId(uncompleted[randomIndex].id);
      iterations++;

      if (iterations < maxIterations) {
        const delay = baseDelay + (iterations / maxIterations) * 100;
        setTimeout(runScan, delay);
      } else {
        const finalTask = uncompleted[Math.floor(Math.random() * uncompleted.length)];
        setFlashingTaskId(null);
        setHighlightedTaskId(finalTask.id);
        
        const encouragements = [
          `就决定是你了：${finalTask.text}！✨`,
          `今日份挑战：${finalTask.text}，冲鸭！🚀`,
          `系统选中了：${finalTask.text}，你可以的！💪`,
          `命运的安排：${finalTask.text}，开始吧！🌈`
        ];
        setShowFeedback(encouragements[Math.floor(Math.random() * encouragements.length)]);
        setIsSelecting(false);
        
        setTimeout(() => {
          setHighlightedTaskId(null);
          setShowFeedback(null);
        }, 5000);
      }
    };

    runScan();
  };

  const handleSaveGrid = () => {
    (Taro.showModal as any)({
      title: '保存清单',
      placeholderText: '给这个任务清单起个名字吧',
      editable: true,
      success: (res: any) => {
        if (res.confirm && res.content) {
          const newGrid: SavedGrid = {
            id: Math.random().toString(36).substr(2, 9),
            name: res.content,
            gridSize,
            tasks: tasks.map(({ completed, ...t }) => t),
            createdAt: Date.now()
          };
          const updated = [...savedGrids, newGrid];
          setSavedGrids(updated);
          Taro.setStorageSync('focus_fit_saved_grids', updated);
          setShowFeedback('清单已保存！');
          setTimeout(() => setShowFeedback(null), 1500);
        }
      }
    });
  };

  const handleReplaceTask = (taskId: string) => {
    const currentTaskIds = new Set(tasks.map(t => t.id));
    const combinedPool = [...TASK_POOL, ...customTasks];
    const availableTasks = combinedPool.filter(t => !currentTaskIds.has(t.id));
    
    if (availableTasks.length > 0) {
      const newTask = availableTasks[Math.floor(Math.random() * availableTasks.length)];
      setTasks(prev => prev.map(t => t.id === taskId ? { ...newTask, completed: false } : t));
      setShowFeedback('已为你更换了一个新任务 ✨');
      setTimeout(() => setShowFeedback(null), 2000);
    } else {
      setShowFeedback('没有更多可选任务了 😅');
      setTimeout(() => setShowFeedback(null), 2000);
    }
  };

  const handleLoadGrid = (grid: SavedGrid) => {
    setGridSize(grid.gridSize);
    setTasks(grid.tasks.map(t => ({ ...t, completed: false })));
    celebratedBingos.current.clear();
    setShowSavedList(false);
  };

  const getAdaptationText = () => {
    const bmi = userData.weight / ((userData.height / 100) ** 2);
    let text = `根据你的数据：BMI ${bmi.toFixed(1)}。`;
    if (userData.bodyType === 'apple') text += ' 已为你侧重腰腹相关任务。';
    return text;
  };

  return (
    <View className="space-y-6 max-w-2xl mx-auto px-4 pb-24 relative">
      {/* Header Info */}
      <View className="bg-white border-4 border-black p-5 rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-sm text-zinc-900 flex items-start gap-4 relative overflow-hidden">
        <View className="absolute top-0 right-0 w-24 h-24 bg-candy-yellow/10 rounded-full -mr-12 -mt-12" />
        <View className="p-3 bg-candy-yellow rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative z-10">
          <Trophy size={24} strokeWidth={3} />
        </View>
        <View className="relative z-10 flex-1">
          <Text className="font-black text-lg mb-0.5 italic block">AI 智能适配中</Text>
          <Text className="font-bold text-zinc-500">{getAdaptationText()}</Text>
        </View>
      </View>

      {/* Controls */}
      <View className="flex flex-col gap-4">
        <ScrollView scrollX className="flex items-center gap-4 pb-2 whitespace-nowrap">
          <View className="flex gap-2 mr-4">
            {[2, 3, 4, 5].map((size) => (
              <View
                key={size}
                onClick={() => setGridSize(size as GridSize)}
                className={`inline-block px-5 py-2.5 rounded-full text-sm font-black transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none relative overflow-hidden ${
                  gridSize === size 
                  ? 'bg-candy-pink text-white' 
                  : 'bg-white text-zinc-600'
                }`}
              >
                <Text className="relative z-10">{size}x{size}</Text>
              </View>
            ))}
          </View>
          <View className="flex gap-2">
            <View onClick={handleSaveGrid} className="inline-block p-3 bg-white border-2 border-black rounded-full text-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
              <Save size={20} strokeWidth={3} />
            </View>
            <View onClick={() => setShowSavedList(true)} className="inline-block p-3 bg-white border-2 border-black rounded-full text-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
              <List size={20} strokeWidth={3} />
            </View>
            <View onClick={onReset} className="inline-block p-3 bg-white border-2 border-black rounded-full text-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
              <Settings2 size={20} strokeWidth={3} />
            </View>
          </View>
        </ScrollView>

        <ScrollView scrollX className="flex items-center gap-3 pb-2 whitespace-nowrap">
          <View 
            onClick={handleRandomTask}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-candy-purple text-white rounded-full text-sm font-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-2 border-black active:translate-x-[2px] active:translate-y-[2px] active:shadow-none mr-2"
          >
            <Play size={18} fill="currentColor" strokeWidth={3} />
            <Text>帮我选一个</Text>
          </View>
          <View 
            onClick={handleShuffle}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-candy-orange text-white rounded-full text-sm font-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-2 border-black active:translate-x-[2px] active:translate-y-[2px] active:shadow-none mr-2"
          >
            <Shuffle size={18} strokeWidth={3} />
            <Text>洗牌</Text>
          </View>
          <View 
            onClick={handleRestart}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-zinc-900 rounded-full text-sm font-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-2 border-black active:translate-x-[2px] active:translate-y-[2px] active:shadow-none mr-2"
          >
            <RefreshCw size={18} strokeWidth={3} />
            <Text>重新开始</Text>
          </View>
          <View 
            onClick={() => setShowLibrary(true)}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-candy-green text-zinc-900 rounded-full text-sm font-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-2 border-black active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <Plus size={18} strokeWidth={3} />
            <Text>添加任务</Text>
          </View>
        </ScrollView>
      </View>

      <View className="text-center mb-2">
        <Text className="text-[10px] font-bold text-zinc-400 italic block">💡 提示：点击格子完成，长按格子手动修改内容</Text>
      </View>

      <View 
        className="grid gap-3" 
        style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
      >
        {tasks.map((task) => (
          <View
            key={task.id}
            onClick={() => !isSelecting && toggleTask(task.id)}
            onLongPress={() => !isSelecting && handleLongPress(task)}
            className={`relative aspect-square p-2 rounded-[1.5rem] text-[11px] font-black flex flex-col items-center justify-center text-center leading-tight transition-all border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none overflow-hidden ${
              task.completed 
              ? 'bg-candy-green text-zinc-900' 
              : highlightedTaskId === task.id
                ? 'bg-candy-yellow text-zinc-900 z-20'
                : flashingTaskId === task.id
                  ? 'bg-candy-cyan text-white z-10'
                  : editingTaskId === task.id
                    ? 'bg-white text-zinc-900'
                    : 'bg-white text-zinc-900'
            }`}
          >
            {!task.completed && !isSelecting && (
              <View
                onClick={(e) => {
                  e.stopPropagation();
                  handleReplaceTask(task.id);
                }}
                className="absolute top-1 right-1 p-1 bg-zinc-100/80 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-10"
              >
                <RefreshCw size={10} strokeWidth={3} />
              </View>
            )}

            {task.completed && (
              <View className="absolute inset-0 flex items-center justify-center bg-candy-green/90 z-10">
                <View className="bg-white p-2 rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <CheckCircle2 size={24} className="text-candy-green" strokeWidth={4} />
                </View>
              </View>
            )}
            
            {editingTaskId === task.id ? (
              <Textarea
                autoFocus
                value={editingText}
                onInput={(e) => setEditingText(e.detail.value)}
                onBlur={saveEdit}
                className="w-full h-full bg-transparent text-center"
              />
            ) : (
              <Text className={task.completed ? 'opacity-90' : ''}>
                {task.text}
              </Text>
            )}
          </View>
        ))}
      </View>

      {/* Modals & Overlays */}
      <AnimatePresence>
        {showBingo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: -5 }}
            exit={{ opacity: 0, scale: 1.5, rotate: 10 }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          >
            <View className="bg-candy-pink text-white text-7xl font-black px-12 py-8 rounded-[4rem] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] border-8 border-black -rotate-6 relative overflow-hidden">
              <Text className="relative z-10">BINGO!</Text>
            </View>
          </motion.div>
        )}

        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 px-10 py-5 bg-black text-white rounded-full shadow-[8px_8px_0px_0px_rgba(255,77,148,1)] font-black z-50 pointer-events-none max-w-[90vw] text-center border-4 border-white italic"
          >
            <Text className="relative z-10">{showFeedback}</Text>
          </motion.div>
        )}

        {showLibrary && (
          <TaskLibrary 
            onClose={() => {
              setShowLibrary(false);
              fetchCustomTasks();
            }}
            selectedIds={tasks.map(t => t.id)}
            onSelect={(task) => {
              if (tasks.length < gridSize * gridSize) {
                setTasks([...tasks, { ...task, completed: false }]);
              } else {
                setShowFeedback('格子已满');
                setTimeout(() => setShowFeedback(null), 2000);
              }
            }}
          />
        )}

        {showSavedList && (
          <View className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <View className="bg-white w-full max-w-md rounded-[2.5rem] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] border-4 border-black p-8 space-y-6">
              <View className="flex items-center justify-between">
                <Text className="text-2xl font-black italic">已保存的清单</Text>
                <View onClick={() => setShowSavedList(false)} className="p-2 hover:bg-zinc-100 rounded-full border-2 border-black">
                  <X size={20} strokeWidth={3} />
                </View>
              </View>
              <ScrollView scrollY className="space-y-3 max-h-[50vh]">
                {savedGrids.length === 0 ? (
                  <Text className="text-zinc-400 font-bold text-center py-12 block">还没有保存的清单哦</Text>
                ) : (
                  savedGrids.map(grid => (
                    <View
                      key={grid.id}
                      onClick={() => handleLoadGrid(grid)}
                      className="w-full flex items-center justify-between p-5 rounded-2xl bg-white border-2 border-black mb-3"
                    >
                      <View>
                        <Text className="font-black text-zinc-900 block">{grid.name}</Text>
                        <Text className="text-xs font-bold text-zinc-500 block">{grid.gridSize}x{grid.gridSize} · {new Date(grid.createdAt).toLocaleDateString()}</Text>
                      </View>
                      <ChevronRight size={20} className="text-zinc-900" />
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        )}
      </AnimatePresence>
    </View>
  );
};

const ChevronRight = ({ size, className }: { size: number, className?: string }) => (
  <View className={className}>
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  </View>
);
