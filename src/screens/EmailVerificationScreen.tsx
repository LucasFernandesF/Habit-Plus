import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { logout } from '../services/auth'; 
import { colors } from '../theme/colors';
import { onAuthStateChanged, sendEmailVerification } from 'firebase/auth';
import { auth } from '../services/firebase';

const EmailVerificationScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [user, setUser] = useState(auth.currentUser); 
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('EmailVerification - Auth state changed');
      setUser(currentUser);
      
      if (currentUser) {
        // Recarrega para obter o status mais recente
        await currentUser.reload();
        const updatedUser = auth.currentUser;
        console.log('EmailVerification - After reload - Verified:', updatedUser?.emailVerified);
      }
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResendVerification = async () => {
    if (cooldown > 0) return;

    setLoading(true);
    try {
      if (user) {
        await sendEmailVerification(user);
        setCooldown(60);
        Alert.alert(
          'Email enviado!',
          'Enviamos um novo link de verificação para seu email. Verifique sua caixa de entrada.'
        );
      }
    } catch (error: any) {
      console.error('Erro ao reenviar email:', error);
      Alert.alert('Erro', 'Não foi possível enviar o email de verificação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setChecking(true);
    try {
      if (user) {
        // Força o reload do usuário
        await user.reload();
        const updatedUser = auth.currentUser;
        
        console.log('Email verification status after reload:', updatedUser?.emailVerified);
        
        if (updatedUser?.emailVerified) {
          console.log('Email verified successfully, logging out and going to login');
          Alert.alert(
            'Sucesso!', 
            'Email verificado com sucesso! Faça login novamente.',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Faz logout e vai para login
                  logout();
                  navigation.navigate('Login');
                }
              }
            ]
          );
        } else {
          Alert.alert(
            'Atenção', 
            'Email ainda não verificado. Verifique sua caixa de entrada e pasta de spam.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      Alert.alert('Erro', 'Não foi possível verificar o status do email.');
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigation.navigate('Login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Erro</Text>
        <Text style={styles.message}>Nenhum usuário encontrado.</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.logoutButtonText}>Voltar ao Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verifique seu Email</Text>
        
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📧</Text>
        </View>

        <Text style={styles.message}>
          Enviamos um link de verificação para:
        </Text>
        
        <Text style={styles.email}>{user?.email}</Text>

        <Text style={styles.instructions}>
          • Verifique sua caixa de entrada{'\n'}
          • Clique no link de verificação{'\n'}
          • Volte ao app e toque em "Já verifiquei"{'\n'}
          • Verifique também a pasta de spam{'\n'}
          • Após verificação, faça login novamente
        </Text>

        <TouchableOpacity 
          style={[
            styles.resendButton,
            (loading || cooldown > 0) && styles.buttonDisabled
          ]}
          onPress={handleResendVerification}
          disabled={loading || cooldown > 0}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.resendButtonText}>
              {cooldown > 0 ? `Reenviar em ${cooldown}s` : 'Reenviar Email'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.verifyButton,
            checking && styles.buttonDisabled
          ]}
          onPress={handleCheckVerification}
          disabled={checking}
        >
          {checking ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.verifyButtonText}>Já verifiquei meu email</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Sair e Voltar ao Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 30,
    textAlign: 'center',
  },
  iconContainer: {
    marginBottom: 30,
  },
  icon: {
    fontSize: 80,
  },
  message: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  email: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 30,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 40,
    textAlign: 'left',
  },
  resendButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: colors.primaryLight,
  },
  resendButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  verifyButton: {
    backgroundColor: colors.secondary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  verifyButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  logoutButtonText: {
    color: colors.primary,
    fontSize: 16,
  },
});

export default EmailVerificationScreen;