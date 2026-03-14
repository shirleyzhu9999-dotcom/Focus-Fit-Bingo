import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, RefreshCw, Settings2, Shuffle, Play, Trophy, Plus, Save, List, X } from 'lucide-react';
import { Task, GridSize, UserData, SavedGrid } from '../types';
import { generateBingoTasks, calculateBMI } from '../utils/bingoGenerator';
import { TASK_POOL } from '../constants/tasks';
import { TaskLibrary } from './TaskLibrary';
import confetti from 'canvas-confetti';

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
  
  // Track which bingos have already been celebrated to avoid repeated confetti for the same line
  const celebratedBingos = useRef<Set<string>>(new Set());

  const weightDiff = userData.weight - userData.targetWeight;
  const bmi = calculateBMI(userData.height, userData.weight);

  useEffect(() => {
    const saved = localStorage.getItem('focus_fit_saved_grids');
    if (saved) setSavedGrids(JSON.parse(saved));
    fetchCustomTasks();
  }, []);

  const fetchCustomTasks = () => {
    const saved = localStorage.getItem('focus_fit_custom_tasks');
    if (saved) {
      setCustomTasks(JSON.parse(saved));
    }
  };

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const checkBingo = useCallback((currentTasks: (Task & { completed: boolean })[]) => {
    const size = gridSize;
    const grid = Array.from({ length: size }, (_, i) => 
      currentTasks.slice(i * size, (i + 1) * size)
    );

    let foundNewBingo = false;
    const currentBingoKeys = new Set<string>();

    // Rows
    for (let i = 0; i < size; i++) {
      if (grid[i].every(t => t.completed)) {
        const key = `row-${i}`;
        currentBingoKeys.add(key);
        if (!celebratedBingos.current.has(key)) foundNewBingo = true;
      }
    }

    // Columns
    for (let i = 0; i < size; i++) {
      if (grid.every(row => row[i].completed)) {
        const key = `col-${i}`;
        currentBingoKeys.add(key);
        if (!celebratedBingos.current.has(key)) foundNewBingo = true;
      }
    }

    // Diagonals
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

    // Update celebrated bingos
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

      // Update history
      const today = new Date().toISOString().split('T')[0];
      const completedTasksList = newTasks.filter(t => t.completed).map(t => t.text);
      const completedCount = completedTasksList.length;
      const historyStr = localStorage.getItem('focus_fit_history');
      let history: any[] = historyStr ? JSON.parse(historyStr) : [];
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
      localStorage.setItem('focus_fit_history', JSON.stringify(history));

      if (checkBingo(newTasks)) {
        setShowBingo(true);
        triggerConfetti();
        setTimeout(() => setShowBingo(false), 3000);
      }
      return newTasks;
    });
  };

  const handleDoubleClick = (task: Task) => {
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
    const maxIterations = 25; // About 1.5-2 seconds total
    const baseDelay = 60;
    
    const runScan = () => {
      const randomIndex = Math.floor(Math.random() * uncompleted.length);
      setFlashingTaskId(uncompleted[randomIndex].id);
      iterations++;

      if (iterations < maxIterations) {
        // Slightly slow down the scanning towards the end
        const delay = baseDelay + (iterations / maxIterations) * 100;
        setTimeout(runScan, delay);
      } else {
        // Final selection
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
    const name = prompt('给这个任务清单起个名字吧', `我的任务 ${new Date().toLocaleDateString()}`);
    if (name) {
      const newGrid: SavedGrid = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        gridSize,
        tasks: tasks.map(({ completed, ...t }) => t),
        createdAt: Date.now()
      };
      const updated = [...savedGrids, newGrid];
      setSavedGrids(updated);
      localStorage.setItem('focus_fit_saved_grids', JSON.stringify(updated));
      setShowFeedback('清单已保存！');
      setTimeout(() => setShowFeedback(null), 1500);
    }
  };

  const handleReplaceTask = (taskId: string) => {
    const currentTaskIds = new Set(tasks.map(t => t.id));
    
    // Filter out tasks already in the grid, include custom tasks
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

  const handleAutoFill = () => {
    const totalNeeded = gridSize * gridSize;
    const newTasks = generateBingoTasks(userData, gridSize);
    
    setTasks(prev => {
      const combined = [...prev];
      newTasks.forEach(t => {
        if (combined.length < totalNeeded && !combined.find(c => c.id === t.id)) {
          combined.push({ ...t, completed: false });
        }
      });
      return combined.slice(0, totalNeeded);
    });
  };

  const getAdaptationText = () => {
    const weightDiff = userData.weight - userData.targetWeight;
    const bmi = userData.weight / ((userData.height / 100) ** 2);
    let text = `根据你的数据：BMI ${bmi.toFixed(1)}，减重目标 ${weightDiff.toFixed(1)}kg。`;
    if (userData.bodyType === 'apple') text += ' 已为你侧重腰腹相关任务。';
    
    // Difficulty suggestion based on mood
    if (currentMood === 'tired') {
      text += ' 检测到你今天有点累，建议尝试 3x3 轻松模式。';
    } else if (currentMood === 'good') {
      text += ' 状态不错！挑战一下 5x5 进阶模式吧？';
    }
    
    return text;
  };

  const handleMoodSelect = (mood: 'good' | 'neutral' | 'tired') => {
    const today = new Date().toISOString().split('T')[0];
    const historyStr = localStorage.getItem('focus_fit_history');
    let history: any[] = historyStr ? JSON.parse(historyStr) : [];
    const existingIndex = history.findIndex(h => h.date === today);
    
    if (existingIndex >= 0) {
      history[existingIndex].mood = mood;
    } else {
      history.push({
        date: today,
        completedCount: 0,
        totalCount: tasks.length,
        gridSize,
        mood
      });
    }
    localStorage.setItem('focus_fit_history', JSON.stringify(history));
    setShowFeedback(`心情已记录：${mood === 'good' ? '😊' : mood === 'neutral' ? '😐' : '😣'}`);
    setTimeout(() => setShowFeedback(null), 2000);
  };

  const currentMood = (() => {
    const today = new Date().toISOString().split('T')[0];
    const historyStr = localStorage.getItem('focus_fit_history');
    if (!historyStr) return null;
    const history = JSON.parse(historyStr);
    return history.find((h: any) => h.date === today)?.mood;
  })();

  return (
    <div className="space-y-6 max-w-2xl mx-auto px-4 pb-24 relative">
      {/* Header Info */}
      <div className="bg-white border-4 border-black p-5 rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-sm text-zinc-900 flex items-start gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-candy-yellow/10 rounded-full -mr-12 -mt-12" />
        <div className="p-3 bg-candy-yellow rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative z-10">
          <Trophy size={24} strokeWidth={3} />
        </div>
        <div className="relative z-10 flex-1">
          <p className="font-black text-lg mb-0.5 italic">AI 智能适配中</p>
          <p className="font-bold text-zinc-500">{getAdaptationText()}</p>
        </div>
      </div>

      {/* Mood Quick Select */}
      <div className="bg-white border-4 border-black p-4 rounded-[2rem] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute inset-0 candy-gloss opacity-5" />
        <div className="relative z-10">
          <p className="text-xs font-black text-zinc-900 italic">今日心情</p>
        </div>
        <div className="flex gap-2 relative z-10">
          {[
            { id: 'good', emoji: '😊', color: 'bg-candy-green' },
            { id: 'neutral', emoji: '😐', color: 'bg-candy-yellow' },
            { id: 'tired', emoji: '😣', color: 'bg-candy-pink' }
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => handleMoodSelect(m.id as any)}
              className={`w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center text-xl transition-all active:translate-y-1 active:shadow-none ${
                currentMood === m.id 
                  ? `${m.color} shadow-none` 
                  : 'bg-zinc-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100'
              }`}
            >
              {m.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex gap-2 shrink-0">
            {[2, 3, 4, 5].map((size) => (
              <button
                key={size}
                onClick={() => setGridSize(size as GridSize)}
                className={`px-5 py-2.5 rounded-full text-sm font-black transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none relative overflow-hidden group ${
                  gridSize === size 
                  ? 'bg-candy-pink text-white' 
                  : 'bg-white text-zinc-600 hover:bg-candy-pink/10'
                }`}
              >
                <div className="absolute inset-0 candy-gloss opacity-50 group-hover:opacity-70" />
                <span className="relative z-10">{size}x{size}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={handleSaveGrid} title="保存清单" className="p-3 bg-white border-2 border-black rounded-full text-zinc-900 hover:bg-candy-yellow transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none relative overflow-hidden group">
              <div className="absolute inset-0 candy-gloss opacity-0 group-hover:opacity-30" />
              <Save size={20} strokeWidth={3} className="relative z-10" />
            </button>
            <button onClick={() => setShowSavedList(true)} title="加载清单" className="p-3 bg-white border-2 border-black rounded-full text-zinc-900 hover:bg-candy-cyan transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none relative overflow-hidden group">
              <div className="absolute inset-0 candy-gloss opacity-0 group-hover:opacity-30" />
              <List size={20} strokeWidth={3} className="relative z-10" />
            </button>
            <button onClick={onReset} title="修改身体数据" className="p-3 bg-white border-2 border-black rounded-full text-zinc-900 hover:bg-candy-pink transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none relative overflow-hidden group">
              <div className="absolute inset-0 candy-gloss opacity-0 group-hover:opacity-30" />
              <Settings2 size={20} strokeWidth={3} className="relative z-10" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            onClick={handleRandomTask}
            className="flex items-center gap-2 px-6 py-3.5 bg-candy-purple text-white rounded-full text-sm font-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-2 border-black hover:bg-candy-purple/90 transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shrink-0 relative overflow-hidden group"
          >
            <div className="absolute inset-0 candy-gloss opacity-40 group-hover:opacity-60" />
            <Play size={18} fill="currentColor" strokeWidth={3} className="relative z-10" />
            <span className="relative z-10">帮我选一个</span>
          </button>
          <button 
            onClick={handleShuffle}
            className="flex items-center gap-2 px-6 py-3.5 bg-candy-orange text-white rounded-full text-sm font-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-2 border-black hover:bg-candy-orange/90 transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shrink-0 relative overflow-hidden group"
          >
            <div className="absolute inset-0 candy-gloss opacity-40 group-hover:opacity-60" />
            <Shuffle size={18} strokeWidth={3} className="relative z-10" />
            <span className="relative z-10">洗牌</span>
          </button>
          <button 
            onClick={handleRestart}
            className="flex items-center gap-2 px-6 py-3.5 bg-white text-zinc-900 rounded-full text-sm font-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-2 border-black hover:bg-zinc-50 transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shrink-0 relative overflow-hidden group"
          >
            <div className="absolute inset-0 candy-gloss opacity-0 group-hover:opacity-20" />
            <RefreshCw size={18} strokeWidth={3} className="relative z-10" />
            <span className="relative z-10">重新开始</span>
          </button>
          <button 
            onClick={() => setShowLibrary(true)}
            className="flex items-center gap-2 px-6 py-3.5 bg-candy-green text-zinc-900 rounded-full text-sm font-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-2 border-black hover:bg-candy-green/90 transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shrink-0 relative overflow-hidden group"
          >
            <div className="absolute inset-0 candy-gloss opacity-40 group-hover:opacity-60" />
            <Plus size={18} strokeWidth={3} className="relative z-10" />
            <span className="relative z-10">添加任务</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="text-center mb-2">
        <p className="text-[10px] font-bold text-zinc-400 italic">💡 提示：鼠标悬停点击 🔄 更换任务，或双击格子手动修改内容</p>
      </div>
      <div 
        className="grid gap-3 sm:gap-4" 
        style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
      >
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            role="button"
            tabIndex={0}
            whileTap={editingTaskId === task.id ? {} : { scale: 0.95 }}
            animate={highlightedTaskId === task.id ? {
              scale: [1, 1.15, 1],
              borderColor: ['#000000', '#FF4D94', '#000000'],
              boxShadow: [
                '0 6px 0 0 rgba(0,0,0,1)', 
                '0 12px 20px 0 rgba(255,77,148,0.4)', 
                '0 6px 0 0 rgba(0,0,0,1)'
              ],
            } : flashingTaskId === task.id ? {
              backgroundColor: ['#ffffff', '#00D4FF', '#FFD700', '#FF4D94', '#ffffff'],
              borderColor: ['#000000', '#00D4FF', '#000000'],
              scale: 1.08,
              rotate: [0, -2, 2, 0]
            } : {
              scale: 1,
              rotate: 0,
              backgroundColor: task.completed ? '#39FF14' : '#ffffff',
              borderColor: '#000000'
            }}
            transition={highlightedTaskId === task.id ? { 
              duration: 1.5, 
              repeat: Infinity,
              ease: "easeInOut"
            } : flashingTaskId === task.id ? { 
              duration: 0.15,
              ease: "linear"
            } : { duration: 0.2 }}
            onClick={() => !isSelecting && toggleTask(task.id)}
            onDoubleClick={() => !isSelecting && handleDoubleClick(task)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                !isSelecting && toggleTask(task.id);
              }
            }}
            className={`relative aspect-square p-2 sm:p-4 rounded-[1.5rem] sm:rounded-[2.5rem] text-[11px] sm:text-[15px] font-black flex flex-col items-center justify-center text-center leading-tight transition-all border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] cursor-pointer active:translate-x-[2px] active:translate-y-[2px] active:shadow-none overflow-hidden group ${
              task.completed 
              ? 'bg-candy-green text-zinc-900' 
              : highlightedTaskId === task.id
                ? 'bg-candy-yellow text-zinc-900 z-20'
                : flashingTaskId === task.id
                  ? 'bg-candy-cyan text-white z-10'
                  : editingTaskId === task.id
                    ? 'bg-white text-zinc-900'
                    : 'bg-white text-zinc-900 hover:bg-candy-cyan/10'
            }`}
          >
            <div className={`absolute inset-0 candy-gloss opacity-0 ${task.completed ? 'opacity-40' : 'group-hover:opacity-20'}`} />
            
            {!task.completed && !isSelecting && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleReplaceTask(task.id);
                }}
                className="absolute top-1 right-1 sm:top-2 sm:right-2 p-1 sm:p-1.5 bg-zinc-100/80 hover:bg-candy-cyan hover:text-white rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none z-10 opacity-0 group-hover:opacity-100"
                title="更换任务"
              >
                <RefreshCw size={10} className="sm:w-3 sm:h-3" strokeWidth={3} />
              </button>
            )}

            {task.completed && (
              <motion.div
                initial={{ scale: 0, opacity: 0, rotate: -45 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-candy-green/90 z-10"
              >
                <div className="bg-white p-2 rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <CheckCircle2 size={32} className="text-candy-green" strokeWidth={4} />
                </div>
              </motion.div>
            )}
            
            {editingTaskId === task.id ? (
              <textarea
                autoFocus
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                onBlur={saveEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    saveEdit();
                  }
                  if (e.key === 'Escape') {
                    setEditingTaskId(null);
                  }
                }}
                className="w-full h-full bg-transparent resize-none text-center focus:outline-none scrollbar-hide"
              />
            ) : (
              <span className={task.completed ? 'opacity-90' : ''}>
                {task.text}
              </span>
            )}
          </motion.div>
        ))}
      </div>

      {/* Auto Fill Button if grid is not full */}
      {tasks.length < gridSize * gridSize && (
        <button
          onClick={handleAutoFill}
          className="w-full py-5 bg-white border-4 border-dashed border-black rounded-[2rem] text-zinc-400 font-black hover:bg-dopa-yellow/10 hover:text-zinc-900 transition-all flex items-center justify-center gap-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          <Plus size={24} strokeWidth={3} />
          自动补全剩余任务
        </button>
      )}

      {/* Modals & Overlays */}
      <AnimatePresence>
        {showBingo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: -5 }}
            exit={{ opacity: 0, scale: 1.5, rotate: 10 }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          >
            <div className="bg-candy-pink text-white text-7xl sm:text-9xl font-black px-12 py-8 rounded-[4rem] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] border-8 border-black -rotate-6 relative overflow-hidden group">
              <div className="absolute inset-0 candy-gloss opacity-40" />
              <span className="relative z-10">BINGO!</span>
            </div>
          </motion.div>
        )}

        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 px-10 py-5 bg-black text-white rounded-full shadow-[8px_8px_0px_0px_rgba(255,77,148,1)] font-black z-50 pointer-events-none max-w-[90vw] text-center border-4 border-white italic relative overflow-hidden"
          >
            <div className="absolute inset-0 candy-gloss opacity-20" />
            <span className="relative z-10">{showFeedback}</span>
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
                setShowFeedback('格子已满，请先删除或增加网格大小');
                setTimeout(() => setShowFeedback(null), 2000);
              }
            }}
          />
        )}

        {showSavedList && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] border-4 border-black p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black italic">已保存的清单</h2>
                <button onClick={() => setShowSavedList(false)} className="p-2 hover:bg-zinc-100 rounded-full border-2 border-black">
                  <X size={20} strokeWidth={3} />
                </button>
              </div>
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 scrollbar-hide">
                {savedGrids.length === 0 ? (
                  <p className="text-zinc-400 font-bold text-center py-12">还没有保存的清单哦</p>
                ) : (
                  savedGrids.map(grid => (
                    <button
                      key={grid.id}
                      onClick={() => handleLoadGrid(grid)}
                      className="w-full flex items-center justify-between p-5 rounded-2xl bg-white border-2 border-black hover:bg-dopa-blue/10 transition-all text-left shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                    >
                      <div>
                        <p className="font-black text-zinc-900">{grid.name}</p>
                        <p className="text-xs font-bold text-zinc-500">{grid.gridSize}x{grid.gridSize} · {new Date(grid.createdAt).toLocaleDateString()}</p>
                      </div>
                      <ChevronRight size={20} className="text-zinc-900" />
                    </button>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ChevronRight = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);
