export interface Habit {
  id: string;
  name: string;
  category: string;
  color: string;
  time?: string;
  completed: boolean;
  streak: number;
  userId: string;
  createdAt: Date;
  days: string[];
  reminder?: boolean;
  reminderTime?: string;
  startDate: Date;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  color: string;
}