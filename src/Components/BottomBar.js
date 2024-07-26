import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Or another icon library

const { height } = Dimensions.get('window');

const BottomBar = ({ onProfile, onDepartments, onPersons, onSettings }) => {
  return (
    <View style={styles.bottomBar}>
      <TouchableOpacity style={styles.button} onPress={onProfile}>
        <Icon name="person-circle-outline" size={24} color="#fff" />
        <Text style={styles.buttonText}>Profilim</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={onDepartments}>
        <Icon name="layers-outline" size={24} color="#fff" />
        <Text style={styles.buttonText}>Departmanlar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={onPersons}>
        <Icon name="people-outline" size={24} color="#fff" />
        <Text style={styles.buttonText}>Kişiler</Text>
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
    height: height * 0.1, // Screen height percentage
    backgroundColor: '#003366', // Dark blue for a professional look
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    elevation: 5, // For shadow effect on Android
    shadowColor: '#000', // For shadow effect on iOS
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  button: {
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    marginTop: 5,
    fontSize: 14,
  },
});

export default BottomBar;
