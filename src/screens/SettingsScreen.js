import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Button } from 'react-native-elements';
import BottomBar from '../Components/BottomBar';
import { removeToken } from '../Services/tokenStorage';

const SettingsScreen = ({ navigation }) => {
  const handleDepartments = () => {
    navigation.navigate('Departments');
  };

  const handlePersons = () => {
    navigation.navigate('Persons');
  };

  const handleProfile = () => {
    navigation.navigate('MyProfile');
  };

  const handleRemoveToken = async () => {
    await removeToken();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button title='Deneme Butonu' onPress={handleRemoveToken} />
      </View>
      <BottomBar
        onProfile={handleProfile}
        onDepartments={handleDepartments}
        onPersons={handlePersons}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    marginBottom: 20,
  },
});

export default SettingsScreen;
