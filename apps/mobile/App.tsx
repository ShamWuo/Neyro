import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🎵 Musicax</Text>
      <Text style={styles.subtitle}>Practice Tracking App</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 18,
    color: '#a0a0b8',
    marginTop: 10,
  },
});
