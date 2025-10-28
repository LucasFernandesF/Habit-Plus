import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { getApps } from 'firebase/app'; 
import './src/services/firebase';

export default function App() {
  const apps = getApps();

  return (
    <View style={styles.container}>
      <Text>{apps.length ? 'Firebase inicializado' : 'Firebase não inicializado'}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
