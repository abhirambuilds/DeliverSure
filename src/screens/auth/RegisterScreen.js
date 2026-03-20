import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import PrimaryButton from '../../components/PrimaryButton';
import Toast from 'react-native-toast-message';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = () => {
    if (!name || !email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill in all fields.'
      });
      return;
    }
    
    setLoading(true);
    // Mock registration delay
    setTimeout(() => {
      setLoading(false);
      Toast.show({
        type: 'success',
        text1: 'Account Created',
        text2: 'Please login with your new credentials.'
      });
      navigation.navigate('Login');
    }, 1500);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.formContainer}>
        <Text variant="displaySmall" style={styles.title}>Create Account</Text>
        <Text variant="titleMedium" style={styles.subtitle}>Join WeatherShield AI</Text>

        <TextInput
          label="Full Name"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
        />

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
          title="Sign Up" 
          onPress={handleRegister} 
          loading={loading}
          style={{ marginTop: 20 }}
          icon="account-plus"
        />

        <PrimaryButton 
          title="Back to Login" 
          mode="text"
          onPress={() => navigation.goBack()} 
          disabled={loading}
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

export default RegisterScreen;
