export const dateUtils = {
  getToday(): Date {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  },

  addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  shouldShowHabitOnDate(habit: { days: string[], startDate: Date }, targetDate: Date): boolean {
    const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const targetDayName = dayNames[targetDate.getDay()];
    
    if (!habit.days || habit.days.length === 0) {
      return true; 
    }
    
    const habitStartDate = new Date(habit.startDate);
    const habitStartDateOnly = new Date(
      habitStartDate.getFullYear(), 
      habitStartDate.getMonth(), 
      habitStartDate.getDate()
    );
    
    const targetDateOnly = new Date(
      targetDate.getFullYear(), 
      targetDate.getMonth(), 
      targetDate.getDate()
    );
    
    if (habitStartDateOnly > targetDateOnly) {
      return false;
    }

    return habit.days.includes(targetDayName);
  },

  formatDate(date: Date): string {
    const today = this.getToday();
    const tomorrow = this.addDays(today, 1);
    const yesterday = this.addDays(today, -1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Amanhã';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    } else {
      return date.toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      });
    }
  },

  formatDateShort(date: Date): string {
    return date.toLocaleDateString('pt-BR');
  },

  isToday(date: Date): boolean {
    const today = this.getToday();
    return date.toDateString() === today.toDateString();
  },

  firestoreDateToLocal(timestamp: any): Date {
    if (!timestamp) return new Date();
    
    if (timestamp.toDate) {
      return timestamp.toDate();
    }
    
    if (timestamp instanceof Date) {
      return timestamp;
    }
    
    return new Date();
  },

  localDateToFirestore(date: Date): Date {
    return new Date(Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ));
  },
};