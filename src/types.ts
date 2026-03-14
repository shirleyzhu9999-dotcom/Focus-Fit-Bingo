export type BodyType = 'apple' | 'pear' | 'hourglass' | 'rectangle';

export interface UserData {
  height: number;
  weight: number;
  targetWeight: number;
  bodyType: BodyType;
}

export type TaskCategory = 'diet' | 'exercise' | 'lifestyle';

export interface Task {
  id: string;
  text: string;
  category: TaskCategory;
  intensity: 'low' | 'medium' | 'high';
  bodyTypeFocus?: BodyType;
}

export interface SavedGrid {
  id: string;
  name: string;
  gridSize: GridSize;
  tasks: Task[];
  createdAt: number;
}

export type GridSize = 2 | 3 | 4 | 5;

export interface DailyHistory {
  date: string; // YYYY-MM-DD
  completedCount: number;
  totalCount: number;
  gridSize: GridSize;
  completedTasks?: string[];
  mood?: 'good' | 'neutral' | 'tired';
}

export interface BingoState {
  tasks: (Task & { completed: boolean })[];
  gridSize: GridSize;
}
