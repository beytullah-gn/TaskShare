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
  const [selectedDepartmentName, setSelectedDepartmentName] = useState('');

  useEffect(() => {
    const loadCurrentUser = async () => {
      const userData = await fetchUserData();
      if (userData) {
        setCurrentUser(userData);
      } else {
        Alert.alert('Hata', 'Kullanıcı verileri alınamadı.');
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
        Alert.alert('Veri Yok', 'Aktif departman bulunamadı.');
      }
    } catch (error) {
      Alert.alert('Hata', 'Departmanlar alınamadı.');
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
      Alert.alert('Doğrulama Hatası', 'Lütfen tüm alanları doldurun ve bir departman seçin.');
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
          Alert.alert('Hata', 'Bu isimde bir departman zaten mevcut.');
          return;
        }
      }
      
      const newDepartmentRef = push(ref(db, 'Departments'));
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
      
      console.log('Departman başarıyla eklendi.');
      
      // Formu sıfırlama
      setSelectedDepartmentId(null);
      setDepartmentName('');
      setDepartmentDescription('');
      setIsModalVisible(false); // Modalı kapatma
    } catch (error) {
      console.error('Departman eklenirken hata:', error);
      Alert.alert('Hata', 'Departman eklenemedi.');
    }
  };

  const confirmAndDeactivate = async (departmentId, departmentName) => {
    Alert.alert(
      'Onay',
      'Bu departmanı ve altındaki departmanları kaldırmak istediğinize emin misiniz?',
      [
        {
          text: 'Hayır',
          onPress: () => console.log('İptal Edildi'),
          style: 'cancel',
        },
        {
          text: 'Evet',
          onPress: async () => {
            try {
              const departmentRef = ref(db, `Departments/${departmentId}`);
              const snapshot = await get(departmentRef);
              if (snapshot.exists()) {
                const department = snapshot.val();
                if (department.Permissions?.Admin) {
                  Alert.alert('Hata', 'Bu departman silinemez.');
                } else {
                  await deactivateDepartmentAndEmployees(departmentId);
                  setDepartmentsList(prevList => prevList.filter(dep => dep.id !== departmentId));
                  setIsModalVisible(false); // Modalı kapatma
                }
              }
            } catch (error) {
              console.error('Departman silinirken hata:', error);
              Alert.alert('Hata', 'Departman silinemedi.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const renderDepartmentItem = ({ item }) => (
    <View style={[
      styles.departmentContainer,
      selectedDepartmentId === item.id && styles.selectedItem
    ]}>
      <TouchableOpacity
        style={styles.departmentItem}
        onPress={() => {
          setSelectedDepartmentId(item.id);
          setSelectedDepartmentName(item.DepartmentName);
        }}
      >
        <Text style={styles.departmentText}>Departman Adı: {item.DepartmentName}</Text>
        <Text style={styles.departmentText}>Departman Açıklaması: {item.DepartmentDescription}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => confirmAndDeactivate(item.id, item.DepartmentName)}
      >
        <Text style={styles.deleteButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
  

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Yeni Departman Oluştur</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={departmentName}
          onChangeText={setDepartmentName}
          placeholder="Departman Adı"
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          value={departmentDescription}
          onChangeText={setDepartmentDescription}
          placeholder="Açıklama"
          placeholderTextColor="#888"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleListDepartments}>
          <Text style={styles.buttonText}>Yetkili Departman Seç</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={saveDepartment}>
          <Text style={styles.buttonText}>Departmanı Oluştur</Text>
        </TouchableOpacity>
      </View>

      {selectedDepartmentName ? (
        <Text style={styles.selectedDepartmentText}>Seçilen departman: {selectedDepartmentName}</Text>
      ) : null}

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
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalHeader}>Departmanlar Listesi</Text>
            {isLoading ? (
              <Text style={styles.loadingText}>Yükleniyor...</Text>
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
    color: '#003366',
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#003366',
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
    backgroundColor: '#003366',
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
  departmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff', // Varsayılan arka plan rengi
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
    backgroundColor: '#e0f7fa', // Seçilen departman için arka plan rengi (mavi)
  },
  departmentItem: {
    flex: 1,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 18,
  },
  departmentText: {
    fontSize: 16,
    color: '#003366',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Gölge efekti
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#f1f1f1',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '80%', // Modalın yüksekliğini sınırlama
  },
  modalHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#003366',
  },
  loadingText: {
    fontSize: 16,
    color: '#003366',
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
  closeButtonText: {
    fontSize: 20,
    color: '#fff',
  },
  selectedDepartmentText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#003366',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default AddNewDepartment;
