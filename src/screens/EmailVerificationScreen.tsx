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
import { resendEmailVerification, logout } from '../services/auth'; // ← REMOVA 'auth' daqui
import { colors } from '../theme/colors';
import { onAuthStateChanged, sendEmailVerification } from 'firebase/auth';
import { auth } from '../services/firebase'; // ← IMPORTE AQUI

const EmailVerificationScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [user, setUser] = useState(auth.currentUser); // ← Estado local para o usuário

  // Observador para atualizar o usuário
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

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
        setCooldown(60); // 60 segundos de cooldown
        Alert.alert(
          'Email enviado!',
          'Enviamos um novo link de verificação para seu email. Verifique sua caixa de entrada.'
        );
      }
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível enviar o email de verificação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setLoading(true);
    try {
      await user?.reload();
      const updatedUser = auth.currentUser;
      
      if (updatedUser?.emailVerified) {
        Alert.alert('Sucesso!', 'Email verificado com sucesso!');
        // O observador no AppNavigator vai redirecionar automaticamente para Home
      } else {
        Alert.alert('Atenção', 'Email ainda não verificado. Verifique sua caixa de entrada.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível verificar o status do email.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Se não há usuário, mostra mensagem
  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Erro</Text>
        <Text style={styles.message}>Nenhum usuário encontrado.</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
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
          • Verifique também a pasta de spam
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
          style={styles.verifyButton}
          onPress={handleCheckVerification}
          disabled={loading}
        >
          <Text style={styles.verifyButtonText}>Já verifiquei meu email</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Sair</Text>
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