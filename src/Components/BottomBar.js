import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // veya başka bir ikon kütüphanesi

const { height } = Dimensions.get('window');

const BottomBar = ({ onLogout, onSettings }) => {
  return (
    <View style={styles.bottomBar}>
      <TouchableOpacity style={styles.button} onPress={onLogout}>
        <Icon name="log-out-outline" size={24} color="#fff" />
        <Text style={styles.buttonText}>Çıkış Yap</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={onSettings}>
        <Icon name="settings-outline" size={24} color="#fff" />
        <Text style={styles.buttonText}>Ayarlar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: height * 0.1, // Ekranın yüksekliğinin %20'si
    backgroundColor: '#007bff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    elevation: 5
  },
  button: {
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    marginTop: 5,
    fontSize: 14
  }
});

export default BottomBar;
