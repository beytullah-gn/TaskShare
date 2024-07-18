import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Alert } from 'react-native';
import Checkbox from 'expo-checkbox';

const AddNewUserScreen = () => {
  const departmentData = {
    "DepartmentDescription": "",
    "DepartmentName": "",
    "Permissions": {
      "AdminAccess": false,
      "CreateDepartment": false,
      "ManageUsers": false,
      "ManageTasks": false,
      "ViewTasks": false,
      "ViewAllTasks": false,
      "ManageAllUsers": false,
      "ManageAllTasks": false
    }
  };

  const permissions = Object.keys(departmentData.Permissions);

  const [textInput1, setTextInput1] = useState('');
  const [textInput2, setTextInput2] = useState('');
  const [checkboxes, setCheckboxes] = useState(permissions.map(permission => departmentData.Permissions[permission]));
  const [modalVisible, setModalVisible] = useState(false);

  const handleCheckboxChange = (index) => {
    const newCheckboxes = [...checkboxes];
    newCheckboxes[index] = !newCheckboxes[index];
    setCheckboxes(newCheckboxes);
  };

  const handleDisabledButtonPress = () => {
    const selectedPermissions = checkboxes
      .map((isChecked, index) => isChecked ? permissions[index] : null)
      .filter(item => item !== null)
      .join(', ');
    Alert.alert('Selected Permissions', selectedPermissions || 'No permissions selected');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Text Input 1"
        value={textInput1}
        onChangeText={setTextInput1}
      />
      <TextInput
        style={styles.input}
        placeholder="Text Input 2"
        value={textInput2}
        onChangeText={setTextInput2}
      />
      {checkboxes.map((isChecked, index) => (
        <View key={index} style={styles.checkboxContainer}>
          <Checkbox
            value={isChecked}
            onValueChange={() => handleCheckboxChange(index)}
            style={styles.checkbox}
          />
          <Text>{permissions[index]}</Text>
        </View>
      ))}
      <TouchableOpacity style={styles.button} onPress={handleDisabledButtonPress}>
        <Text>Disabled Button</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <Text>Open Modal</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Text>This is a modal!</Text>
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Text>Close Modal</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    padding: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'red',
  },
});

export default AddNewUserScreen;
