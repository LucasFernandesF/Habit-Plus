// AppNavigator.tsx
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../services/firebase';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import EmailVerificationScreen from '../screens/EmailVerificationScreen';
import AddHabitScreen from '../screens/AddHabitScreen';
import EditHabitScreen from '../screens/EditHabitScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ResetPassword: undefined;
  Home: undefined;
  EmailVerification: undefined;
  AddHabit: undefined;
  EditHabit: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('AppNavigator - Auth State:', currentUser?.email, 'Verified:', currentUser?.emailVerified);
      
      if (currentUser) {
        await currentUser.reload();
        const updatedUser = auth.currentUser;
        console.log('AppNavigator - After reload - Verified:', updatedUser?.emailVerified);
        setUser(updatedUser);
      } else {
        setUser(currentUser);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  console.log('AppNavigator - Current user:', user?.email, 'Verified:', user?.emailVerified);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false
        }}
      >
        {user ? (
          // Usuário logado
          user.emailVerified ? (
            // Email verificado - vai para Home
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="AddHabit" component={AddHabitScreen} />
              <Stack.Screen name="EditHabit" component={EditHabitScreen} />
            </>
          ) : (
            // Email não verificado - fica na tela de verificação
            <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
          )
        ) : (
          // Usuário não logado
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

export default AppNavigator;