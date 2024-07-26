import React, { useState } from 'react';
import { View, TextInput,  Alert, Text, TouchableOpacity } from 'react-native';
import { login } from '../Auth/AuthService';
import { styles } from '../styles/loginscreenStyle';
import { getData, getToken } from '../Services/tokenStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
  setLoading(true);
  try {
    const { user, token } = await login(email, password);
    setPassword('');
    setEmail('');
    
    
  } catch (error) {
    Alert.alert('Giriş Hatası', error.message);
  } finally {
    setLoading(false);
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
        cursorColor="blue"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        cursorColor="blue"
      />
     <TouchableOpacity 
      style={styles.button} 
      onPress={handleLogin}
      disabled={loading} // Butona tıklamayı engeller
    >
      <Text style={styles.buttonText}>{loading ? 'Yükleniyor...' : 'Giriş Yap'}</Text>
    </TouchableOpacity>
      
      <TouchableOpacity style={styles.registerContainer} onPress={()=>{
        
        getData();
        getToken();
      }}>
        <Text style={styles.registerText}>Hesabınız yok mu? Kayıt olun</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;
