import React, { useState, useEffect } from "react";
import { View, Button, Text, ActivityIndicator, StyleSheet } from "react-native";
import { User } from "firebase/auth";
import { signUp, signIn, logout, observeAuth } from "../services/auth";

const AuthTest = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Observador de estado de autenticação
  useEffect(() => {
    const unsubscribe = observeAuth((currentUser) => {
      setUser(currentUser);
      console.log(
        "Usuário atual:",
        currentUser ? currentUser.email : "Nenhum usuário logado"
      );
    });
    return unsubscribe;
  }, []);

  const handleCadastrar = async () => {
    setLoading(true);
    try {
      const userCredential = await signUp("teste@teste.com", "123456");
      console.log("Usuário criado:", userCredential.user.email);
    } catch (error: any) {
      console.error("Erro ao cadastrar:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const userCredential = await signIn("teste@teste.com", "123456");
      console.log("Login realizado:", userCredential.user.email);
    } catch (error: any) {
      console.error("Erro ao logar:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      console.log("Logout realizado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao deslogar:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Teste de Autenticação Firebase</Text>

      {loading && <ActivityIndicator size="large" color="#007bff" />}

      {user ? (
        <>
          <Text style={styles.userText}>Usuário logado: {user.email}</Text>
          <Button title="Logout" onPress={handleLogout} />
        </>
      ) : (
        <>
          <Button title="Cadastrar" onPress={handleCadastrar} disabled={loading} />
          <Button title="Login" onPress={handleLogin} disabled={loading} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  userText: {
    fontSize: 16,
    marginVertical: 10,
  },
});

export default AuthTest;
