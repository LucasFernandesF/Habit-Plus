import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Habit } from '../types/habit';
import { dateUtils } from '../utils/dateUtils';

export const habitService = {
  async addHabit(habitData: Omit<Habit, 'id' | 'createdAt' | 'userId'>): Promise<string> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Usuário não autenticado');

      const startDateForFirestore = dateUtils.localDateToFirestore(habitData.startDate);

      const habit = {
        ...habitData,
        userId: user.uid,
        createdAt: Timestamp.now(),
        startDate: Timestamp.fromDate(startDateForFirestore),
      };

      console.log('Salvando hábito:', habit);
      
      const docRef = await addDoc(collection(db, 'habits'), habit);
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar hábito:', error);
      throw error;
    }
  },

  async getHabits(): Promise<Habit[]> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Usuário não autenticado');

      console.log('Buscando hábitos para usuário:', user.uid);

      const q = query(
        collection(db, 'habits'),
        where('userId', '==', user.uid)
      );

      const querySnapshot = await getDocs(q);
      const habits: Habit[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        const startDate = dateUtils.firestoreDateToLocal(data.startDate);
        const createdAt = dateUtils.firestoreDateToLocal(data.createdAt);

        const habit: Habit = {
          id: doc.id,
          name: data.name,
          category: data.category,
          color: data.color,
          time: data.time,
          completed: data.completed,
          streak: data.streak,
          userId: data.userId,
          createdAt: createdAt,
          days: data.days || [],
          reminder: data.reminder,
          reminderTime: data.reminderTime,
          startDate: startDate,
        };

        console.log('Hábito carregado:', habit.name, 'StartDate:', startDate, 'Dias:', data.days);
        habits.push(habit);
      });

      console.log('Total de hábitos carregados:', habits.length);
      
      return habits.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Erro ao buscar hábitos:', error);
      throw error;
    }
  },

  async updateHabit(habitId: string, updates: Partial<Habit>): Promise<void> {
    try {
      const habitRef = doc(db, 'habits', habitId);
      
      const firestoreUpdates: any = { ...updates };
      if (updates.startDate) {
        firestoreUpdates.startDate = Timestamp.fromDate(
          dateUtils.localDateToFirestore(updates.startDate)
        );
      }
      
      await updateDoc(habitRef, firestoreUpdates);
    } catch (error) {
      console.error('Erro ao atualizar hábito:', error);
      throw error;
    }
  },

  async deleteHabit(habitId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'habits', habitId));
    } catch (error) {
      console.error('Erro ao deletar hábito:', error);
      throw error;
    }
  },
};