import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Switch,
  Modal,
  FlatList,
} from 'react-native';
import { colors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import { habitService } from '../services/habitService';

const categories = [
  { id: 'health', name: 'Saúde', color: '#732571', icon: '💊' },
  { id: 'work', name: 'Trabalho', color: '#964e94', icon: '💼' },
  { id: 'study', name: 'Estudo', color: '#b977b8', icon: '📚' },
  { id: 'fitness', name: 'Fitness', color: '#dca0db', icon: '💪' },
  { id: 'mental', name: 'Mental', color: '#ffc9ff', icon: '🧠' },
  { id: 'finance', name: 'Finanças', color: '#732571', icon: '💰' },
  { id: 'home', name: 'Casa', color: '#964e94', icon: '🏠' },
  { id: 'social', name: 'Social', color: '#b977b8', icon: '👥' },
  { id: 'hobby', name: 'Hobbie', color: '#dca0db', icon: '🎨' },
  { id: 'tech', name: 'Tecnologia', color: '#ffc9ff', icon: '💻' },
  { id: 'other', name: 'Outros', color: '#732571', icon: '📌' },
];

const weekDays = [
  { id: 'sun', name: 'Dom', fullName: 'Domingo' },
  { id: 'mon', name: 'Seg', fullName: 'Segunda' },
  { id: 'tue', name: 'Ter', fullName: 'Terça' },
  { id: 'wed', name: 'Qua', fullName: 'Quarta' },
  { id: 'thu', name: 'Qui', fullName: 'Quinta' },
  { id: 'fri', name: 'Sex', fullName: 'Sexta' },
  { id: 'sat', name: 'Sáb', fullName: 'Sábado' },
];

const AddHabitScreen = () => {
  const navigation = useNavigation();

  const [habitName, setHabitName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [reminder, setReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [startDate, setStartDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const toggleDay = (dayId: string) => {
    setSelectedDays(prev =>
      prev.includes(dayId)
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId]
    );
  };

  const handleDateSelect = (day: any) => {
    // Criar data no fuso local (sem problemas de UTC)
    const selectedDate = new Date(day.dateString + 'T00:00:00');
    setStartDate(selectedDate);
    setShowCalendarModal(false);
    console.log('Data selecionada:', selectedDate, 'String:', day.dateString);
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const timeString = selectedTime.toTimeString().split(' ')[0].substring(0, 5);
      setReminderTime(timeString);
    }
  };

  // No AddHabitScreen, na função handleSaveHabit, adicione:
  const handleSaveHabit = async () => {
    if (!habitName.trim()) {
      Alert.alert('Erro', 'Por favor, digite um nome para o hábito.');
      return;
    }

    // DEBUG: Verificar dias selecionados
    console.log('Dias selecionados:', selectedDays);
    console.log('Categoria selecionada:', selectedCategory.name);

    if (selectedDays.length === 0) {
      Alert.alert('Atenção', 'Nenhum dia selecionado. O hábito será mostrado todos os dias.');
      // Continua mesmo sem dias selecionados
    }

    try {
      setLoading(true);

      const newHabit = {
        name: habitName.trim(),
        category: selectedCategory.name,
        color: selectedCategory.color,
        time: reminder ? reminderTime : undefined,
        completed: false,
        streak: 0,
        days: selectedDays, // ← Isso está sendo salvo?
        reminder: reminder,
        reminderTime: reminder ? reminderTime : undefined,
        startDate: startDate,
      };

      console.log('Dados do hábito a ser salvo:', newHabit);

      await habitService.addHabit(newHabit);

      Alert.alert('Sucesso!', 'Hábito criado com sucesso!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]);

    } catch (error) {
      console.error('Erro ao criar hábito:', error);
      Alert.alert('Erro', 'Não foi possível criar o hábito. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const markedDates = {
    [startDate.toISOString().split('T')[0]]: {
      selected: true,
      selectedColor: colors.primary,
      selectedTextColor: colors.background,
    },
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>Cancelar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Hábito</Text>
        <TouchableOpacity onPress={handleSaveHabit} disabled={loading}>
          <Text style={[styles.saveButton, loading && { opacity: 0.5 }]}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Nome do Hábito */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nome do Hábito</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Beber água, Estudar, Exercícios..."
            value={habitName}
            onChangeText={setHabitName}
            maxLength={50}
          />
        </View>

        {/* Categoria */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categoria</Text>
          <TouchableOpacity
            style={styles.categorySelector}
            onPress={() => setShowCategoryModal(true)}
          >
            <View style={styles.categoryPreview}>
              <Text style={styles.categoryIcon}>{selectedCategory.icon}</Text>
              <Text style={styles.categoryName}>{selectedCategory.name}</Text>
            </View>
            <Text style={styles.selectorArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Dias da Semana */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dias da Semana</Text>
          <View style={styles.daysContainer}>
            {weekDays.map(day => (
              <TouchableOpacity
                key={day.id}
                style={[
                  styles.dayButton,
                  selectedDays.includes(day.id) && styles.dayButtonSelected
                ]}
                onPress={() => toggleDay(day.id)}
              >
                <Text style={[
                  styles.dayText,
                  selectedDays.includes(day.id) && styles.dayTextSelected
                ]}>
                  {day.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Data de Início */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data de Início</Text>
          <TouchableOpacity
            style={styles.dateSelector}
            onPress={() => setShowCalendarModal(true)}
          >
            <Text style={styles.dateText}>
              📅 {startDate.toLocaleDateString('pt-BR')}
            </Text>
            <Text style={styles.selectorArrow}>▼</Text>
          </TouchableOpacity>
          <Text style={styles.dateSubtext}>
            O hábito começará a partir desta data
          </Text>
        </View>

        {/* Lembrete */}
        <View style={styles.section}>
          <View style={styles.switchContainer}>
            <Text style={styles.sectionTitle}>Lembrete</Text>
            <Switch
              value={reminder}
              onValueChange={setReminder}
              trackColor={{ false: colors.secondaryLight, true: colors.primary }}
              thumbColor={colors.background}
            />
          </View>

          {reminder && (
            <TouchableOpacity
              style={styles.timeSelector}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.timeText}>⏰ {reminderTime}</Text>
              <Text style={styles.selectorArrow}>▼</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Modal de Categorias */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecionar Categoria</Text>
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.categoryItem}
                  onPress={() => {
                    setSelectedCategory(item);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={styles.categoryItemIcon}>{item.icon}</Text>
                  <Text style={styles.categoryItemName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCategoryModal(false)}
            >
              <Text style={styles.modalCloseText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de Calendário */}
      <Modal
        visible={showCalendarModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.calendarModal]}>
            <Text style={styles.modalTitle}>Selecionar Data de Início</Text>
            <Calendar
              onDayPress={handleDateSelect}
              markedDates={markedDates}
              minDate={new Date().toISOString().split('T')[0]}
              theme={{
                backgroundColor: colors.background,
                calendarBackground: colors.background,
                textSectionTitleColor: colors.primary,
                selectedDayBackgroundColor: colors.primary,
                selectedDayTextColor: colors.background,
                todayTextColor: colors.primary,
                dayTextColor: colors.text,
                textDisabledColor: colors.secondaryLight,
                arrowColor: colors.primary,
                monthTextColor: colors.primary,
                textDayFontWeight: '400',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '500',
              }}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCalendarModal(false)}
            >
              <Text style={styles.modalCloseText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* DateTimePicker*/}
      {showTimePicker && (
        <DateTimePicker
          value={new Date(`1970-01-01T${reminderTime}:00`)}
          mode="time"
          display="spinner"
          onChange={handleTimeChange}
          minuteInterval={5}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryLight,
  },
  backButton: {
    color: colors.background,
    fontSize: 16,
  },
  headerTitle: {
    color: colors.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 10,
  },
  input: {
    backgroundColor: colors.accent,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.secondaryLight,
    color: colors.text,
    fontSize: 16,
  },
  categorySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.accent,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.secondaryLight,
  },
  categoryPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  categoryName: {
    fontSize: 16,
    color: colors.text,
  },
  selectorArrow: {
    color: colors.primary,
    fontSize: 12,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.secondaryLight,
  },
  dayButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
  },
  dayTextSelected: {
    color: colors.background,
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.accent,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.secondaryLight,
  },
  dateText: {
    fontSize: 16,
    color: colors.text,
  },
  dateSubtext: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
    marginTop: 5,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.accent,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.secondaryLight,
    marginTop: 10,
  },
  timeText: {
    fontSize: 16,
    color: colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  calendarModal: {
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondaryLight,
  },
  categoryItemIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  categoryItemName: {
    fontSize: 16,
    color: colors.text,
  },
  modalCloseButton: {
    padding: 15,
    backgroundColor: colors.primary,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  modalCloseText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddHabitScreen;