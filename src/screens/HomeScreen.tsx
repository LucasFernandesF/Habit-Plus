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
  RefreshControl,
} from 'react-native';
import { colors } from '../theme/colors';
import { logout } from '../services/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { habitService } from '../services/habitService';
import { Habit, Category } from '../types/habit';
import { dateUtils } from '../utils/dateUtils';

const HomeScreen = ({ navigation }: any) => {
  const [allHabits, setAllHabits] = useState<Habit[]>([]);
  const [displayHabits, setDisplayHabits] = useState<Habit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedDate, setSelectedDate] = useState<Date>(dateUtils.getToday());

  useEffect(() => {
    loadUserData();
    loadHabits();
  }, []);

  useEffect(() => {
    if (allHabits.length > 0) {
      updateDisplayHabits();
    }
  }, [allHabits, selectedDate]);

  const loadUserData = async () => {
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

  const loadHabits = async () => {
    try {
      setLoading(true);
      const userHabits = await habitService.getHabits();
      setAllHabits(userHabits);
      updateCategories(userHabits);
    } catch (error) {
      console.error('Erro ao carregar hábitos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os hábitos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateDisplayHabits = () => {
    const habitsForDate = allHabits.filter(habit => 
      dateUtils.shouldShowHabitOnDate(habit, selectedDate)
    );
    setDisplayHabits(habitsForDate);
  };

  const updateCategories = (habitsList: Habit[]) => {
    const categoryMap: { [key: string]: Category } = {
      'Todos': { id: '1', name: 'Todos', icon: '📋', count: habitsList.length, color: colors.primary },
    };

    const categoryIcons: { [key: string]: string } = {
      'Saúde': '💊',
      'Estudo': '📚',
      'Fitness': '💪',
      'Mental': '🧠',
      'Trabalho': '💼',
      'Finanças': '💰',
      'Casa': '🏠',
      'Social': '👥',
      'Hobbie': '🎨',
      'Tecnologia': '💻',
    };

    const categoryColors: { [key: string]: string } = {
      'Saúde': '#732571',
      'Estudo': '#964e94',
      'Fitness': '#b977b8',
      'Mental': '#dca0db',
      'Trabalho': '#ffc9ff',
      'Finanças': '#4361ee',
      'Casa': '#3a0ca3',
      'Social': '#7209b7',
      'Hobbie': '#f72585',
      'Tecnologia': '#2a9d8f',
    };

    habitsList.forEach(habit => {
      if (!categoryMap[habit.category]) {
        categoryMap[habit.category] = {
          id: `cat-${habit.category}`,
          name: habit.category,
          icon: categoryIcons[habit.category] || '📌',
          count: 0,
          color: categoryColors[habit.category] || '#732571'
        };
      }
      categoryMap[habit.category].count++;
    });

    const categoriesArray = Object.values(categoryMap).sort((a, b) => b.count - a.count);
    setCategories(categoriesArray);
  };

  const getFilteredHabits = () => {
    if (selectedCategory === 'Todos') {
      return displayHabits;
    }
    return displayHabits.filter(habit => habit.category === selectedCategory);
  };

  const navigateDate = (days: number) => {
    const newDate = dateUtils.addDays(selectedDate, days);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(dateUtils.getToday());
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadHabits();
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const toggleHabit = async (habitId: string) => {
    try {
      const habit = displayHabits.find(h => h.id === habitId);
      if (!habit) return;

      // Só permite marcar/desmarcar se for hoje
      if (!dateUtils.isToday(selectedDate)) {
        Alert.alert('Aviso', 'Só é possível marcar hábitos para o dia atual.');
        return;
      }

      const updatedCompleted = !habit.completed;
      const updatedStreak = updatedCompleted ? habit.streak + 1 : Math.max(0, habit.streak - 1);

      await habitService.updateHabit(habitId, {
        completed: updatedCompleted,
        streak: updatedStreak,
      });

      // Atualizar localmente
      const updatedAllHabits = allHabits.map(h =>
        h.id === habitId
          ? { ...h, completed: updatedCompleted, streak: updatedStreak }
          : h
      );
      setAllHabits(updatedAllHabits);
    } catch (error) {
      console.error('Erro ao atualizar hábito:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o hábito');
    }
  };

  const calculateProgress = () => {
    const completed = displayHabits.filter(habit => habit.completed).length;
    const total = displayHabits.length;
    return total > 0 ? (completed / total) * 100 : 0;
  };

  const getLongestStreak = () => {
    return allHabits.reduce((max, habit) => Math.max(max, habit.streak), 0);
  };

  const progress = calculateProgress();
  const filteredHabits = getFilteredHabits();
  const isToday = dateUtils.isToday(selectedDate);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bom dia{userName ? `, ${userName}` : ''}! 👋 </Text>
          <Text style={styles.subtitle}>Seu progresso {dateUtils.isToday(selectedDate) ? 'hoje' : 'do dia'}</Text>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={handleLogout}>
          <Text style={styles.profileText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {/* Date Navigation */}
        <View style={styles.dateNavigation}>
          <TouchableOpacity 
            style={styles.dateNavButton}
            onPress={() => navigateDate(-1)}
          >
            <Text style={styles.dateNavText}>‹</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.dateDisplay}
            onPress={goToToday}
          >
            <Text style={styles.dateText}>
              {dateUtils.formatDate(selectedDate)}
            </Text>
            <Text style={styles.dateSubtext}>
              {dateUtils.formatDateShort(selectedDate)}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.dateNavButton}
            onPress={() => navigateDate(1)}
          >
            <Text style={styles.dateNavText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>
              Progresso {dateUtils.isToday(selectedDate) ? 'Diário' : 'do Dia'}
            </Text>
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
            {displayHabits.filter(h => h.completed).length} de {displayHabits.length} hábitos
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
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                selectedCategory === category.name && {
                  backgroundColor: category.color,
                  borderColor: category.color
                }
              ]}
              onPress={() => setSelectedCategory(category.name)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[
                styles.categoryName,
                selectedCategory === category.name && styles.categoryNameSelected
              ]}>
                {category.name}
              </Text>
              <Text style={[
                styles.categoryCount,
                selectedCategory === category.name && styles.categoryCountSelected
              ]}>
                {category.count}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Habits Header */}
        <View style={styles.habitsHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Hábitos {dateUtils.isToday(selectedDate) ? 'de Hoje' : 'do Dia'}
            </Text>
            <Text style={styles.habitsSubtitle}>
              {selectedCategory !== 'Todos' ? `Filtrado: ${selectedCategory}` : 'Todos os hábitos'}
              {!isToday && ' • Apenas visualização'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddHabit')}
          >
            <Text style={styles.addButtonText}>+ Novo</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Carregando hábitos...</Text>
          </View>
        ) : filteredHabits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {selectedCategory !== 'Todos'
                ? `Nenhum hábito de ${selectedCategory} para este dia`
                : 'Nenhum hábito para este dia'
              }
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {selectedCategory !== 'Todos'
                ? 'Tente mudar a categoria ou data'
                : 'Toque em "+ Novo" para criar hábitos!'
              }
            </Text>
          </View>
        ) : (
          filteredHabits.map(habit => (
            <TouchableOpacity
              key={habit.id}
              style={[
                styles.habitCard,
                habit.completed && styles.habitCardCompleted,
                !isToday && styles.habitCardViewOnly
              ]}
              onPress={() => toggleHabit(habit.id)}
              disabled={!isToday}
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
                  habit.completed && styles.checkboxCompleted,
                  !isToday && styles.checkboxDisabled
                ]}>
                  {habit.completed && <Text style={styles.checkmark}>✓</Text>}
                  {!isToday && <Text style={styles.viewOnlyText}>👁️</Text>}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* Quick Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Estatísticas Gerais</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{getLongestStreak()}</Text>
              <Text style={styles.statLabel}>Maior sequência</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{allHabits.length}</Text>
              <Text style={styles.statLabel}>Total hábitos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{displayHabits.length}</Text>
              <Text style={styles.statLabel}>Dia selecionado</Text>
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
  dateNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 20,
    marginBottom: 10,
  },
  dateNavButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateNavText: {
    color: colors.background,
    fontSize: 20,
    fontWeight: 'bold',
  },
  dateDisplay: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 10,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
  },
  dateSubtext: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    marginTop: 2,
  },
  progressCard: {
    margin: 20,
    marginTop: 10,
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
    marginBottom: 5,
  },
  habitsSubtitle: {
    fontSize: 14,
    color: colors.text,
    marginHorizontal: 20,
    marginBottom: 10,
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
  categoryNameSelected: {
    color: colors.background,
  },
  categoryCount: {
    fontSize: 11,
    color: colors.text,
  },
  categoryCountSelected: {
    color: colors.background,
  },
  habitsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  habitCardViewOnly: {
    opacity: 0.7,
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
  checkboxDisabled: {
    borderColor: colors.secondaryLight,
    backgroundColor: 'transparent',
  },
  checkmark: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 14,
  },
  viewOnlyText: {
    fontSize: 12,
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
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.primaryLight,
    textAlign: 'center',
  },
});

export default HomeScreen;