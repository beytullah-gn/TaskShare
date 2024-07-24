import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, Modal, Alert } from 'react-native';
import { ref, get, set, push } from 'firebase/database';
import { db } from '../Services/firebase-config';
import { fetchUserData } from '../Services/fetchUserData'; // Kullanıcı verilerini almak için yardımcı fonksiyon
import fetchActiveDepartments from '../Services/fetchActiveDepartments'; // Aktif departmanları almak için yardımcı fonksiyon
import { deactivateDepartmentAndEmployees } from '../Services/deactivateDepartmentsAndEmployees';
import { Button } from 'react-native-elements';

const AddNewDepartment = () => {
  const [departmentName, setDepartmentName] = useState('');
  const [departmentDescription, setDepartmentDescription] = useState('');
  const [departmentsList, setDepartmentsList] = useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadCurrentUser = async () => {
      const userData = await fetchUserData();
      if (userData) {
        setCurrentUser(userData);
      } else {
        Alert.alert('Error', 'Failed to fetch user data.');
      }
    };

    loadCurrentUser();
  }, []);

  const loadDepartments = async () => {
    setIsLoading(true);
    try {
      const activeDepartments = await fetchActiveDepartments();
      if (activeDepartments.length > 0) {
        setDepartmentsList(activeDepartments);
        setIsModalVisible(true); // Modalı aç
      } else {
        Alert.alert('No Data', 'No active departments found.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch departments.');
    } finally {
      setIsLoading(false);
    }
  };


  const handleListDepartments = () => {
    loadDepartments();
  };

  const saveDepartment = async () => {
    // Form doğrulama
    if (!departmentName || !departmentDescription || !selectedDepartmentId) {
      Alert.alert('Validation Error', 'Please fill out all fields and select a department.');
      return;
    }
    
    // Aynı isimde departman olup olmadığını kontrol et
    const existingDepartmentRef = ref(db, 'Departments');
    try {
      const snapshot = await get(existingDepartmentRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        const departmentExists = Object.values(data).some(department => {
          const name = department.DepartmentName;
          return typeof name === 'string' && name.toLowerCase() === departmentName.toLowerCase();
        });
        if (departmentExists) {
          Alert.alert('Error', 'A department with this name already exists.');
          return;
        }
      }
      
      
      const newDepartmentRef = push(ref(db, 'Departments'));
      console.log(newDepartmentRef) // Yeni benzersiz bir anahtar oluştur
      await set(newDepartmentRef, {
        DepartmentName: departmentName,
        DepartmentDescription: departmentDescription,
        ParentDepartment: selectedDepartmentId,
        CreatedBy: currentUser?.id,
        Active:true,
        Permissions: {
          ManageTasks:false,
          ManageEmployees:false,
          ManageDepartments:false}
  
      });
      
      console.log('Department successfully added.');
      
      // Formu sıfırlama
      setSelectedDepartmentId(null);
      setDepartmentName('');
      setDepartmentDescription('');
      setIsModalVisible(false); // Modalı kapatma
    } catch (error) {
      console.error('Error adding department:', error);
      Alert.alert('Error', 'Failed to add department.');
    }
  };
  
  const renderDepartmentItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.departmentItem, selectedDepartmentId === item.id && styles.selectedItem]}
      onPress={() => setSelectedDepartmentId(item.id)}
    >
      <Text style={styles.departmentText}>Departman Adı: {item.DepartmentName}</Text>
      <Button title="Tıkla" onPress={
        () => {
          deactivateDepartmentAndEmployees(item.id)
           
          }
      }></Button>
      <Text style={styles.departmentText}>Departman Açıklaması: {item.DepartmentDescription}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add New Department</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={departmentName}
          onChangeText={setDepartmentName}
          placeholder="Department Name"
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          value={departmentDescription}
          onChangeText={setDepartmentDescription}
          placeholder="Description"
          placeholderTextColor="#888"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleListDepartments}>
          <Text style={styles.buttonText}>List Departments</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={saveDepartment}>
          <Text style={styles.buttonText}>Add Department</Text>
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.buttonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalHeader}>Departments List</Text>
            {isLoading ? (
              <Text style={styles.loadingText}>Loading...</Text>
            ) : (
              <FlatList
                data={departmentsList}
                keyExtractor={item => item.id}
                renderItem={renderDepartmentItem}
                contentContainerStyle={styles.listContainer}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#343a40',
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#ced4da',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 15,
    backgroundColor: '#ffffff',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    flexWrap: 'wrap', // Butonların sarmalanmasını sağlar
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginVertical: 5, // Butonlar arasında boşluk
    flex: 1, // Butonların eşit genişlikte olmasını sağlar
    maxWidth: '48%', // Ekrana sığması için maksimum genişlik
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    flexGrow: 1,
  },
  departmentItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedItem: {
    backgroundColor: '#d1ecf1', // Seçilen item için renk
  },
  departmentText: {
    fontSize: 16,
    color: '#343a40',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Gölge efekti
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '80%', // Modalın yüksekliğini sınırlama
  },
  modalHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#343a40',
  },
  loadingText: {
    fontSize: 16,
    color: '#007bff',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#dc3545',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1, // Kapatma butonunun diğer içeriklerin üstünde olmasını sağlar
  },
});

export default AddNewDepartment;
