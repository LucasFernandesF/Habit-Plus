import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { signUp } from '../services/auth';
import { colors } from '../theme/colors';

interface RegisterScreenProps {
  navigation: any;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword || !name) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (email.indexOf('@') === -1) {
      Alert.alert('Erro', 'Por favor, insira um email válido');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, { name });
      Alert.alert(
        "Verificação enviada!",
        "Enviamos um link de verificação para seu email. Após verificar, faça login no app."
      );
      setTimeout(() => {
        navigation.navigate("Login");
      }, 500);

    } catch (error: any) {
      const message = error.message || "";

      if (message.includes("auth/email-already-in-use")) {
        Alert.alert("Erro", "Este email já está cadastrado.");
      }
      else if (message.includes("auth/invalid-email")) {
        Alert.alert("Erro", "Email inválido.");
      }
      else if (message.includes("auth/weak-password")) {
        Alert.alert("Erro", "Senha muito fraca.");
      }
      else {
        Alert.alert("Erro no Cadastro", message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Criar Conta</Text>
        <Text style={styles.subtitle}>Preencha os dados para se cadastrar</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Nome"
            placeholderTextColor={colors.text}
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.text}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor={colors.text}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TextInput
            style={styles.input}
            placeholder="Confirmar senha"
            placeholderTextColor={colors.text}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>Cadastrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.backButtonText}>Voltar para o login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: colors.primary,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    color: colors.text,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: colors.accent,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.secondaryLight,
    color: colors.text,
  },
  registerButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  registerButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default RegisterScreen;