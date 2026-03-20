import React, { useContext, useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import PrimaryButton from '../../components/PrimaryButton';
import { AuthContext } from '../../context/AuthContext';
import Toast from 'react-native-toast-message';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter both email and password.'
      });
      return;
    }
    await login(email, password);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.formContainer}>
        <Text variant="displaySmall" style={styles.title}>WeatherShield AI</Text>
        <Text variant="titleMedium" style={styles.subtitle}>Protecting Delivery Riders</Text>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          style={styles.input}
          secureTextEntry
        />

        <PrimaryButton 
          title="Login" 
          onPress={handleLogin} 
          loading={isLoading}
          style={{ marginTop: 20 }}
          icon="login"
        />
        
        <PrimaryButton 
          title="Create an Account" 
          mode="text"
          onPress={() => navigation.navigate('Register')} 
          disabled={isLoading}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontWeight: 'bold',
    color: '#0bdc84',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#A0A0A0',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#1E1E1E'
  }
});

export default LoginScreen;
