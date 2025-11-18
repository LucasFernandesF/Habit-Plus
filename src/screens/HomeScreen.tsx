import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { logout } from '../services/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

type Habit = {
  id: string;
  name: string;
  category: string;
  color: string;
  time?: string;
  completed: boolean;
  streak: number;
};

type Category = {
  id: string;
  name: string;
  icon: string;
  count: number;
};

const HomeScreen = ({ navigation }: any) => {
  const [habits, setHabits] = useState<Habit[]>([
    {
      id: '1',
      name: 'Beber água',
      category: 'Saúde',
      color: '#732571',
      time: '08:00',
      completed: true,
      streak: 5,
    },
    {
      id: '2',
      name: 'Estudar React Native',
      category: 'Estudo',
      color: '#964e94',
      time: '14:00',
      completed: false,
      streak: 12,
    },
    {
      id: '3',
      name: 'Exercícios',
      category: 'Fitness',
      color: '#b977b8',
      time: '18:00',
      completed: false,
      streak: 3,
    },
    {
      id: '4',
      name: 'Meditação',
      category: 'Mental',
      color: '#dca0db',
      completed: true,
      streak: 7,
    },
  ]);

  const [categories] = useState<Category[]>([
    { id: '1', name: 'Todos', icon: '📋', count: 12 },
    { id: '2', name: 'Saúde', icon: '💊', count: 4 },
    { id: '3', name: 'Estudo', icon: '📚', count: 3 },
    { id: '4', name: 'Fitness', icon: '💪', count: 2 },
    { id: '5', name: 'Mental', icon: '🧠', count: 3 },
  ]);

  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(userData.name || '');
          }
        }
      } catch (error) {
        console.error('Erro ao buscar nome do usuário:', error);
      }
    };

    fetchUserName();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const toggleHabit = (habitId: string) => {
    setHabits(prevHabits =>
      prevHabits.map(habit =>
        habit.id === habitId
          ? { ...habit, completed: !habit.completed }
          : habit
      )
    );
  };

  const calculateProgress = () => {
    const completed = habits.filter(habit => habit.completed).length;
    const total = habits.length;
    return total > 0 ? (completed / total) * 100 : 0;
  };

  const progress = calculateProgress();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bom dia{userName ? `, ${userName}` : ''}! 👋 </Text>
          <Text style={styles.subtitle}>Seu progresso hoje</Text>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={handleLogout}>
          <Text style={styles.profileText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Progresso Diário</Text>
            <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
          </View>

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%` }
              ]}
            />
          </View>

          <Text style={styles.progressText}>
            {habits.filter(h => h.completed).length} de {habits.length} hábitos concluídos
          </Text>
        </View>

        {/* Categories */}
        <Text style={styles.sectionTitle}>Categorias</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
        >
          {categories.map(category => (
            <TouchableOpacity key={category.id} style={styles.categoryCard}>
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryCount}>{category.count}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Today's Habits */}
        <View style={styles.habitsHeader}>
          <Text style={styles.sectionTitle}>Hábitos de Hoje</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddHabit')}
          >
            <Text style={styles.addButtonText}>+ Novo</Text>
          </TouchableOpacity>
        </View>

        {habits.map(habit => (
          <TouchableOpacity
            key={habit.id}
            style={[
              styles.habitCard,
              habit.completed && styles.habitCardCompleted
            ]}
            onPress={() => toggleHabit(habit.id)}
          >
            <View style={styles.habitLeft}>
              <View
                style={[
                  styles.habitColor,
                  { backgroundColor: habit.color }
                ]}
              />
              <View style={styles.habitInfo}>
                <Text style={[
                  styles.habitName,
                  habit.completed && styles.habitNameCompleted
                ]}>
                  {habit.name}
                </Text>
                <View style={styles.habitMeta}>
                  <Text style={styles.habitCategory}>{habit.category}</Text>
                  {habit.time && (
                    <Text style={styles.habitTime}>⏰ {habit.time}</Text>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.habitRight}>
              <View style={styles.streakContainer}>
                <Text style={styles.streakText}>🔥 {habit.streak}</Text>
              </View>
              <View style={[
                styles.checkbox,
                habit.completed && styles.checkboxCompleted
              ]}>
                {habit.completed && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Quick Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Estatísticas Rápidas</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>7</Text>
              <Text style={styles.statLabel}>Dias seguidos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>85%</Text>
              <Text style={styles.statLabel}>Taxa de sucesso</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Hábitos totais</Text>
            </View>
          </View>
        </View>

        {/* Empty space */}
        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.primary,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.background,
  },
  subtitle: {
    fontSize: 14,
    color: colors.accent,
    marginTop: 2,
  },
  profileButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: colors.primaryLight,
    borderRadius: 20,
  },
  profileText: {
    color: colors.background,
    fontWeight: '600',
  },
  progressCard: {
    margin: 20,
    padding: 20,
    backgroundColor: colors.background,
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.secondaryLight,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  progressBar: {
    height: 12,
    backgroundColor: colors.accent,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  categoriesScroll: {
    marginBottom: 20,
    paddingLeft: 15,
  },
  categoryCard: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: colors.background,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 80,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.secondaryLight,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 11,
    color: colors.text,
  },
  habitsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: colors.background,
    fontWeight: '600',
    fontSize: 14,
  },
  habitCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: colors.background,
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.secondaryLight,
  },
  habitCardCompleted: {
    backgroundColor: colors.accent,
    borderColor: colors.secondary,
  },
  habitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  habitColor: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  habitNameCompleted: {
    textDecorationLine: 'line-through',
    color: colors.primaryLight,
  },
  habitMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitCategory: {
    fontSize: 12,
    color: colors.text,
    marginRight: 12,
  },
  habitTime: {
    fontSize: 12,
    color: colors.primaryLight,
  },
  habitRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakContainer: {
    backgroundColor: colors.secondaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  streakText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 14,
  },
  statsCard: {
    margin: 20,
    padding: 20,
    backgroundColor: colors.background,
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.secondaryLight,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
  },
  bottomSpace: {
    height: 30,
  },
});

export default HomeScreen;