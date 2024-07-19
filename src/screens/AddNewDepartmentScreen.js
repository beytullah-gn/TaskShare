import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button } from 'react-native';
import Checkbox from 'expo-checkbox';

const AddNewDepartment = () => {
  const [departmentName, setDepartmentName] = useState('');
  const [departmentDescription, setDepartmentDescription] = useState('');
  const [permissions, setPermissions] = useState({
    createUser: false,
    createTask: false,
    viewAllTasks: false,
    createDepartment: false,
    grantPermissions: false,
  });

  const handlePermissionChange = (permission) => {
    setPermissions(prevPermissions => ({
      ...prevPermissions,
      [permission]: !prevPermissions[permission]
    }));
  };

  const handleSubmit = () => {
    // Form verilerini işleme
    console.log('Departman Adı:', departmentName);
    console.log('Departman Açıklaması:', departmentDescription);
    console.log('Yetkiler:', permissions);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Departman Adı</Text>
      <TextInput
        style={styles.input}
        value={departmentName}
        onChangeText={setDepartmentName}
        placeholder="Departman adı girin"
      />

      <Text style={styles.label}>Departman Açıklaması</Text>
      <TextInput
        style={styles.input}
        value={departmentDescription}
        onChangeText={setDepartmentDescription}
        placeholder="Departman açıklaması girin"
        multiline
      />

      <View style={styles.checkboxContainer}>
        <Checkbox
          value={permissions.createUser}
          onValueChange={() => handlePermissionChange('createUser')}
        />
        <Text style={styles.checkboxLabel}>Kullanıcı Oluşturma Yetkisi</Text>
      </View>

      <View style={styles.checkboxContainer}>
        <Checkbox
          value={permissions.createTask}
          onValueChange={() => handlePermissionChange('createTask')}
        />
        <Text style={styles.checkboxLabel}>Görev Oluşturma Yetkisi</Text>
      </View>

      <View style={styles.checkboxContainer}>
        <Checkbox
          value={permissions.viewAllTasks}
          onValueChange={() => handlePermissionChange('viewAllTasks')}
        />
        <Text style={styles.checkboxLabel}>Tüm görevleri görüntüleme yetkisi</Text>
      </View>

      <View style={styles.checkboxContainer}>
        <Checkbox
          value={permissions.createDepartment}
          onValueChange={() => handlePermissionChange('createDepartment')}
        />
        <Text style={styles.checkboxLabel}>Departman Oluşturma Yetkisi</Text>
      </View>

      <View style={styles.checkboxContainer}>
        <Checkbox
          value={permissions.grantPermissions}
          onValueChange={() => handlePermissionChange('grantPermissions')}
        />
        <Text style={styles.checkboxLabel}>Yetki Verme Yetkisi</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Üst Departman Seç"
          onPress={() => {
            // Üst departman seçme işlemi
            console.log('Üst departman seçme');
          }}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Departmanı Oluştur"
          onPress={handleSubmit}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    marginLeft: 8,
  },
  buttonContainer: {
    marginVertical: 10,
  },
});

export default AddNewDepartment;
