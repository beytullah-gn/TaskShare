import React, { useState } from 'react';
import { View, TextInput,  Alert, Text, TouchableOpacity } from 'react-native';
import { login } from '../Components/AuthService';
import { styles } from '../styles/loginscreenStyle';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const { user, token } = await login(email, password);
      setPassword('');
      setEmail('');
      // Kullanıcıyı ana sayfaya yönlendir ve token'ı geç
      
      navigation.navigate('HomeScreen', { token });
    } catch (error) {
      Alert.alert('Giriş Hatası', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Giriş Yap</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
      />
      
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Giriş Yap</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.registerContainer} onPress={() => {navigation.navigate('RegisterScreen')}}>
        <Text style={styles.registerText}>Hesabınız yok mu? Kayıt olun</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;
