import { UserData, Task, GridSize, TaskCategory } from '../types';
import { TASK_POOL } from '../constants/tasks';

export function calculateBMI(height: number, weight: number): number {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

export function generateBingoTasks(userData: UserData, gridSize: GridSize): Task[] {
  const diff = userData.weight - userData.targetWeight;
  const totalTasks = gridSize * gridSize;

  // Determine intensity filter based on weight difference
  let allowedIntensities: ('low' | 'medium' | 'high')[] = ['low'];
  if (diff > 5) allowedIntensities.push('medium');
  if (diff > 10) allowedIntensities.push('high');

  // Filter pool based on intensity
  let filteredPool = TASK_POOL.filter(t => allowedIntensities.includes(t.intensity));

  // Prioritize body type focus
  const bodyTypeTasks = filteredPool.filter(t => t.bodyTypeFocus === userData.bodyType);
  const otherTasks = filteredPool.filter(t => !t.bodyTypeFocus || t.bodyTypeFocus !== userData.bodyType);

  // Categorize for distribution
  const categorized: Record<TaskCategory, Task[]> = {
    diet: [],
    exercise: [],
    lifestyle: []
  };

  // When picking exercise tasks, prioritize body type focus
  [...bodyTypeTasks, ...otherTasks].forEach(t => {
    if (!categorized[t.category]) categorized[t.category] = [];
    categorized[t.category].push(t);
  });

  const categories: TaskCategory[] = ['diet', 'exercise', 'lifestyle'];

  const ratios: Record<TaskCategory, number> = {
    diet: 0.4,
    exercise: 0.4,
    lifestyle: 0.2
  };

  const result: Task[] = [];

  categories.forEach(cat => {
    const count = Math.max(0, Math.floor(totalTasks * ratios[cat]));
    let pool = categorized[cat] || [];
    
    // For exercise, ensure we pick at least some body type specific ones if available
    if (cat === 'exercise') {
      const specific = pool.filter(t => t.bodyTypeFocus === userData.bodyType);
      const general = pool.filter(t => t.bodyTypeFocus !== userData.bodyType);
      // Take up to 70% of exercise slots from specific tasks
      const specificCount = Math.min(specific.length, Math.ceil(count * 0.7));
      const selectedSpecific = shuffle(specific).slice(0, specificCount);
      const selectedGeneral = shuffle(general).slice(0, count - specificCount);
      result.push(...selectedSpecific, ...selectedGeneral);
    } else {
      const selected = shuffle(pool).slice(0, count);
      result.push(...selected);
    }
  });

  // Fill remaining slots if any due to rounding
  while (result.length < totalTasks) {
    const remainingPool = filteredPool.filter(t => !result.find(r => r.id === t.id));
    if (remainingPool.length === 0) break;
    result.push(shuffle(remainingPool)[0]);
  }

  return shuffle(result).slice(0, totalTasks);
}

function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
