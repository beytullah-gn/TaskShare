import React, { useEffect, useState } from "react";
import { SafeAreaView, Text, StyleSheet, View, TextInput, Button, ScrollView, Alert, TouchableOpacity, Modal } from "react-native";
import { useRoute } from '@react-navigation/native';
import fetchAllDepartments from "../Services/fetchAllDepartments";
import fetchAllDepartmentEmployees from "../Services/fetchAllDepartmentEmployees";
import fetchAllPersons from "../Services/fetchAllPersons";
import { fetchCurrentDepartment } from "../Services/fetchCurrentUserDepartment";
import { db } from "../Services/firebase-config";
import { ref, update, push } from 'firebase/database';

const SelectedDepartment = () => {
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
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [availablePersons, setAvailablePersons] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const departments = await fetchAllDepartments();
        const department = departments.find(department => department.id === id);
        setSelectedDepartment(department);

        if (department) {
          setDepartmentName(department.DepartmentName);
          setDepartmentDescription(department.DepartmentDescription);
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

        const currentDepartment = await fetchCurrentDepartment();
        if (currentDepartment && currentDepartment.Permissions) {
          setCanEdit(currentDepartment.Permissions.ManageDepartments);
          setCanManagePersons(currentDepartment.Permissions.ManagePersons);
        }

      } catch (error) {
        console.log("Error fetching data: ", error);
      }
    };

    fetchData();
  }, [id]);

  const handleSave = async () => {
    if (departmentName.trim() === '' || departmentDescription.trim() === '') {
      Alert.alert('Hata', 'Departman adı ve açıklaması boş bırakılamaz.');
      return;
    }

    if (selectedDepartment) {
      try {
        await update(ref(db, 'Departments/' + id), {
          DepartmentName: departmentName,
          DepartmentDescription: departmentDescription,
        });
        setEditMode(false);
        Alert.alert('Başarılı', 'Departman bilgileri güncellendi!');
      } catch (error) {
        console.log("Error updating department: ", error);
        Alert.alert('Hata', 'Departman bilgileri güncellenirken bir hata oluştu.');
      }
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
              const updatedEmployees = selectedDepartmentEmployees.filter(employee => employee.id !== employeeId);
              setSelectedDepartmentEmployees(updatedEmployees);
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
              {editMode && canEdit ? (
                <>
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
                  <Button title="Kaydet" onPress={handleSave} color="#003366" />

                </>
              ) : (
                <>
                  <Text style={styles.label}>Departman Adı:</Text>
                  <Text style={styles.text}>{selectedDepartment.DepartmentName}</Text>
                  <Text style={styles.label}>Departman Açıklaması:</Text>
                  <Text style={styles.text}>{selectedDepartment.DepartmentDescription}</Text>
                  {canEdit && !editMode && (
                    <TouchableOpacity style={styles.editButton} onPress={() => setEditMode(true)}>
                      <Text style={styles.editButtonText}>Düzenle</Text>
                    </TouchableOpacity>
                  )}

                </>
              )}
            </View>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Aktif Çalışanlar</Text>
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
                            <Text style={styles.removeButtonText}>-</Text>
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
                      <TouchableOpacity
                        key={person.id}
                        style={styles.personCard}
                        onPress={() => handleAddEmployee(person.id)}
                      >
                        <Text style={styles.personName}>{person.Name} {person.Surname}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.text}>Uygun çalışan bulunamadı</Text>
                  )}
                </ScrollView>
                <Button title="Kapat" onPress={() => setShowAddEmployeeModal(false)} color="#003366" />

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
    backgroundColor: '#f4f6f9',
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
    color: '#003366',
    marginBottom: 8,
  },
  cardContent: {
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#003366',
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
  personCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  personName: {
    fontSize: 16,
  },
  removeButton: {
    backgroundColor: '#ff4d4d', 
    borderRadius: 25, 
    justifyContent: 'center',
    alignItems: 'center',
    width: 40, 
    height: 40, 
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
    backgroundColor: '#fff',
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
    color: '#003366',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#003366',
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
    backgroundColor: '#003366',
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
});

export default SelectedDepartment;
