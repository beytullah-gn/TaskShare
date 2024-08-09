import React, { useEffect, useState } from "react";
import { SafeAreaView, Text, StyleSheet, View, TextInput, Button, ScrollView, Alert, TouchableOpacity, Modal } from "react-native";
import { useRoute } from '@react-navigation/native';
import fetchAllDepartments from "../Services/fetchAllDepartments";
import fetchAllDepartmentEmployees from "../Services/fetchAllDepartmentEmployees";
import fetchAllPersons from "../Services/fetchAllPersons";
import { fetchCurrentDepartment } from "../Services/fetchCurrentUserDepartment";
import { db, storage } from "../Services/firebase-config";
import { ref, update, push } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as DocumentPicker from 'expo-document-picker';
import CheckBox from "@react-native-community/checkbox";
import { fetchDepartmentEmployeeData } from "../Services/fetchDepartmentEmployees";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'


const SelectedDepartment = ({navigation}) => {
  const route = useRoute();
  const { id } = route.params || {};
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedDepartmentEmployees, setSelectedDepartmentEmployees] = useState([]);
  const [selectedDepartmentPersons, setSelectedDepartmentPersons] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [departmentName, setDepartmentName] = useState('');
  const [departmentDescription, setDepartmentDescription] = useState('');
  const [canEdit, setCanEdit] = useState(false);
  const [canManagePersons, setCanManagePersons] = useState(false);
  const [canManageTasks, setCanManageTasks] = useState(false);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [availablePersons, setAvailablePersons] = useState([]);
  const [pdfUri, setPdfUri] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); //Mevcut kullanıcının departmanının  admin yetkisi var mı
  const [hasManagePersons, setHasManagePersons] = useState(false);
  const [hasManageDepartments, setHasManageDepartments] = useState(false);
  const [hasManageTasks, setHasManageTasks] = useState(false);
  const [hasAdmin, setHasAdmin] = useState(false);//Görüntülenen departmanın admin yetkisi var mı
  const [parentDepartment,setParentDepartment]= useState([]);
  


  const fetchData = async () => {
    try {
      const departments = await fetchAllDepartments();
      const department = departments.find(department => department.id === id);
      setSelectedDepartment(department);
      const parentDepartment = departments.find(d => d.id === department.ParentDepartment)
      setParentDepartment(parentDepartment);
      if (department) {
        setHasManageDepartments(department.Permissions.ManageDepartments);
        setHasManagePersons(department.Permissions.ManagePersons);
        setHasManageTasks(department.Permissions.ManageTasks);
        setDepartmentName(department.DepartmentName);
        setHasAdmin(department.Permissions.Admin);
        setDepartmentDescription(department.DepartmentDescription);
        if(department.PDFUrl)
        {
          setPdfUrl(department.PDFUrl);
        }
       
        const employees = await fetchAllDepartmentEmployees();
        const departmentEmployees = employees.filter(employee => 
          employee.DepartmentId === id && employee.Active
        );
        setSelectedDepartmentEmployees(departmentEmployees);
        const persons = await fetchAllPersons();
        const departmentPersons = persons.filter(person => 
          departmentEmployees.some(employee => employee.EmployeeId === person.id)
        );
        setSelectedDepartmentPersons(departmentPersons);
      }


      //Mevcut kullanıcının izinlerini burada kontrol ediyor 
      const currentDepartment = await fetchDepartmentEmployeeData();
      if (currentDepartment && currentDepartment.Permissions) {
        setCanEdit(currentDepartment.Permissions.ManageDepartments);
        setCanManagePersons(currentDepartment.Permissions.ManagePersons);
        setCanManageTasks(currentDepartment.Permissions.ManageTasks);
        setIsAdmin(currentDepartment.Permissions.Admin);

      }

    } catch (error) {
      console.log("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleSave = async () => {
    if (departmentName.trim() === '' || departmentDescription.trim() === '') {
      Alert.alert('Hata', 'Departman adı ve açıklaması boş bırakılamaz.');
      return;
    }

    setIsSaving(true);

    try {
      if (pdfUri) {
        const response = await fetch(pdfUri);
        const blob = await response.blob();
        const pdfRef = storageRef(storage, `pdfs/${id}.pdf`);
        await uploadBytes(pdfRef, blob);
        const newPdfUrl = await getDownloadURL(pdfRef);
        setPdfUrl(newPdfUrl);
      }

      await update(ref(db, 'Departments/' + id), {
        DepartmentName: departmentName,
        DepartmentDescription: departmentDescription,
        PDFUrl: pdfUrl,
        Permissions: {
          Admin:hasAdmin,
          ManageTasks:hasManageTasks,
          ManageDepartments: hasManageDepartments,
          ManagePersons: hasManagePersons,
        }
      });

      setEditMode(false);
      Alert.alert('Başarılı', 'Departman bilgileri güncellendi!');
    } catch (error) {
      console.log("Error updating department: ", error);
      Alert.alert('Hata', 'Departman bilgileri güncellenirken bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  const pickPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });

      if (result.canceled) {
        Alert.alert('İptal Edildi', 'PDF seçimi iptal edildi.');
      } else if (result.assets && result.assets.length > 0) {
        const { uri } = result.assets[0];
        setPdfUri(uri);
      } else {
        Alert.alert('Hata', 'Beklenmeyen bir durum oluştu.');
      }
    } catch (error) {
      console.error('PDF seçilirken hata:', error);
      Alert.alert('Hata', 'PDF seçilirken bir hata oluştu.');
    }
  };

  const handleRemoveEmployee = async (employeeId) => {
    Alert.alert(
      'Çalışanı Kaldır',
      'Bu çalışanı kaldırmak istediğinize emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Evet',
          onPress: async () => {
            try {
              const employeeRef = ref(db, 'DepartmentEmployees/' + employeeId);
              await update(employeeRef, {
                Active: false,
                EndDate: new Date()
              });
              await fetchData(); // Çalışan kaldırıldıktan sonra listeyi güncelle
              Alert.alert('Başarılı', 'Çalışan kaldırıldı.');
            } catch (error) {
              console.log("Error updating employee: ", error);
              Alert.alert('Hata', 'Çalışan kaldırılırken bir hata oluştu.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleViewPDF = () => {
    if (selectedDepartment && selectedDepartment.PDFUrl) {
      navigation.navigate("MyDocument", { pdfUrl: selectedDepartment.PDFUrl });
    } else {
      Alert.alert('Hata', 'PDF dosyası bulunamadı.');
    }
  };

  const handleAddEmployee = async (personId) => {
    try {
      const newEmployeeRef = push(ref(db, 'DepartmentEmployees'));
      const newEmployeeData = {
        Active: true,
        DepartmentId: id,
        EmployeeId: personId,
        EndDate: "null",
        StartingDate: new Date(),
        id: newEmployeeRef.key,
        Permissions: {
          Admin:false,
          ManageTasks: false,
          ManagePersons: false,
          ManageDepartments: false
        },
      };
      await update(newEmployeeRef, newEmployeeData);
      setShowAddEmployeeModal(false);
      await fetchData(); // Çalışan eklendikten sonra listeyi güncelle
      Alert.alert('Başarılı', 'Çalışan eklendi.');
    } catch (error) {
      console.log("Error adding employee: ", error);
      Alert.alert('Hata', 'Çalışan eklenirken bir hata oluştu.');
    }
  };

  const fetchAvailablePersons = async () => {
    try {
      const employees = await fetchAllDepartmentEmployees();
      const persons = await fetchAllPersons();
      const availablePersons = persons.filter(person =>
        person.AccountType === "Employee" &&
        !employees.some(employee => employee.EmployeeId === person.id && employee.Active)
      );
      setAvailablePersons(availablePersons);
      setShowAddEmployeeModal(true);
    } catch (error) {
      console.log("Error fetching available persons: ", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {selectedDepartment ? (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Departman Bilgileri</Text>
            <View style={styles.cardContent}>
              {editMode && (canEdit || canManageTasks) ? (
                <>
                {canEdit && (
                  <View>
                    <TextInput
                      style={styles.input}
                      value={departmentName}
                      onChangeText={setDepartmentName}
                      placeholder="Departman Adı"
                    />
                    <TextInput
                      style={styles.input}
                      value={departmentDescription}
                      onChangeText={setDepartmentDescription}
                      placeholder="Departman Açıklaması"
                      multiline
                    />
                  </View>
                )}
                  
                  {canManageTasks && (
                     <TouchableOpacity
                     style={styles.button}
                     onPress={pickPDF}
                   >
                     <Text style={styles.buttonText}>PDF Seç</Text>
                   </TouchableOpacity>
                  )}
                 
                  {pdfUri && (
                    <Text style={styles.selectedPdfText}>Seçilen PDF: {pdfUri.split('/').pop()}</Text>
                  )}
                  {
                    isAdmin && !hasAdmin && (
                      <View>
                        {parentDepartment.Permissions.ManageDepartments && (
                          <View style={styles.checkboxContainer}>
                            <CheckBox
                              value={hasManageDepartments}
                              onValueChange={setHasManageDepartments}
                              disabled={!editMode}
                            />
                            <Text style={styles.checkboxLabel}>Departmanları Yönet</Text>
                          </View>
                        )}
                         {parentDepartment.Permissions.ManagePersons && (
                            <View style={styles.checkboxContainer}>
                              <CheckBox
                                value={hasManagePersons}
                                onValueChange={setHasManagePersons}
                                disabled={!editMode}
                              />
                              <Text style={styles.checkboxLabel}>Kişileri Yönet</Text>
                            </View>
                         )}
                        {parentDepartment.Permissions.ManageTasks && (
                          <View style={styles.checkboxContainer}>
                            <CheckBox
                              value={hasManageTasks}
                              onValueChange={setHasManageTasks}
                              disabled={!editMode}
                            />
                            <Text style={styles.checkboxLabel}>Görevleri Yönet</Text>
                          </View>
                        )}
                        
                      </View>               
                    )
                  }                 
                  <Button 
                    title={isSaving ? "Kaydediliyor..." : "Kaydet"} 
                    onPress={handleSave} 
                    color="#3b5998" 
                    disabled={isSaving}
                  />
                </>
              ) : (
                <>
                  <Text style={styles.label}>Departman Adı:</Text>
                  <Text style={styles.text}>{selectedDepartment.DepartmentName}</Text>
                  <Text style={styles.label}>Departman Açıklaması:</Text>
                  <Text style={styles.text}>{selectedDepartment.DepartmentDescription}</Text>
                  <Text style={styles.label}>GYS Döküman Görüntüle</Text>
                  <TouchableOpacity style={styles.showButton} onPress={handleViewPDF}>
                      <Text style={styles.editButtonText}>Dökümanı Görüntüle</Text>
                    </TouchableOpacity>
                  {(canEdit || canManageTasks) && !editMode && (
                    <TouchableOpacity style={styles.editButton} onPress={() => setEditMode(true)}>
                      <Text style={styles.editButtonText}>Düzenle</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}> Çalışanlar</Text>
            <View style={styles.cardContent}>
              {selectedDepartmentEmployees.length > 0 ? (
                selectedDepartmentPersons.length > 0 ? (
                  selectedDepartmentPersons.map(person => {
                    const employee = selectedDepartmentEmployees.find(emp => emp.EmployeeId === person.id);
                    return (
                      <View key={person.id} style={styles.personCard}>
                        <Text style={styles.personName}>{person.Name} {person.Surname}</Text>
                        {canManagePersons && (
                          <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => handleRemoveEmployee(employee.id)}
                          >
                            <Icon name='account-remove' size={25} color='#d11141'/>
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })
                ) : (
                  <Text style={styles.text}>Çalışan kişi bulunamadı</Text>
                )
              ) : (
                <Text style={styles.text}>Aktif çalışan bulunamadı</Text>
              )}
            </View>
          </View>
          {canManagePersons && (
            <TouchableOpacity style={styles.addButton} onPress={fetchAvailablePersons}>
              <Text style={styles.addButtonText}>Çalışan Ekle</Text>
            </TouchableOpacity>
          )}
         <Modal
  animationType="slide"
  transparent={true}
  visible={showAddEmployeeModal}
  onRequestClose={() => setShowAddEmployeeModal(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Çalışan Seç</Text>
      <ScrollView>
        {availablePersons.length > 0 ? (
          availablePersons.map(person => (
            <View key={person.id} style={styles.personCard}>
              <View style={styles.personCardContent}>
                <Text style={styles.personName}>{person.Name} {person.Surname}</Text>
              </View>
              <TouchableOpacity
                style={styles.addButtonWithIcon}
                onPress={() => handleAddEmployee(person.id)}
              >
                <Icon name="account-plus" size={24} color="green" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.text}>Uygun çalışan bulunamadı</Text>
        )}
      </ScrollView>
      <Button title="Kapat" onPress={() => setShowAddEmployeeModal(false)} color="#3b5998" />
    </View>
  </View>
</Modal>

        </ScrollView>
      ) : (
        <Text style={styles.text}>Departman bilgisi bulunamadı</Text>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dfe3ee',
    padding: 10,
  },
  content: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b5998',
    marginBottom: 8,
  },
  cardContent: {
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b5998',
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
    fontSize: 16,
  },
  removeButton: {
    borderRadius: 25, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#dfe3ee',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b5998',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#3b5998',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: '#3b5998',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#fa3c4c',
    padding: 5,
    borderRadius: 5,
    marginVertical:10,
    alignItems: 'center',
    
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical:5,
  },
  selectedPdfText: {
    fontSize: 16,
    color: '#3b5998',
    marginVertical: 10,
  },
  showButton:{
    backgroundColor: '#8b9dc3',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
  personCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  personCardContent: {
    flex: 1,
    flexDirection: 'column',
    
  },
  personName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b5998',
  },
  personRole: {
    fontSize: 16,
    color: '#666',
  },
  addButtonWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
    borderRadius: 8,
  },
  addButtonTextWithIcon: {
    color: 'green',
    fontSize: 16,
    marginRight: 8,
  },
});


export default SelectedDepartment;
