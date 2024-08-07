import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { db } from '../Services/firebase-config';
import { update, ref } from 'firebase/database';
import { fetchDepartmentEmployeeData } from '../Services/fetchDepartmentEmployees';
import { fetchDepartmentEmployeeDataByPersonId } from '../Services/fetchDepartmentEmployeesById';
import fetchAllDepartments from '../Services/fetchAllDepartments';

const SelectedPerson = ({ route }) => {
    const { person } = route.params;

    const [isEditing, setIsEditing] = useState(false);
    const [personData, setPersonData] = useState({ ...person });
    const [originalData, setOriginalData] = useState({ ...person });
    const [selectedDepartmentEmployee, setSelectedDepartmentEmployee] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [currentDepartmentEmployee, setCurrentDepartmentEmployee] = useState(null);

    const [permissions, setPermissions] = useState({
        Admin: false,
        ManageDepartments: false,
        ManagePersons: false,
        ManageTasks: false,
    });

    const fetchData = async () => {
        const selectedDepartmentEmployee = await fetchDepartmentEmployeeDataByPersonId(person.PersonId);
        setSelectedDepartmentEmployee(selectedDepartmentEmployee);

        const departments = await fetchAllDepartments();
        const selectedDepartment = departments.find(d => d.id === selectedDepartmentEmployee?.DepartmentId);
        setSelectedDepartment(selectedDepartment);

        const currentDepartmentEmployee = await fetchDepartmentEmployeeData();
        setCurrentDepartmentEmployee(currentDepartmentEmployee);

        if (selectedDepartment && selectedDepartmentEmployee) {
            setPermissions({
                Admin: selectedDepartment.Permissions?.Admin && selectedDepartmentEmployee.Permissions?.Admin,
                ManageDepartments: selectedDepartment.Permissions?.ManageDepartments && selectedDepartmentEmployee.Permissions?.ManageDepartments,
                ManagePersons: selectedDepartment.Permissions?.ManagePersons && selectedDepartmentEmployee.Permissions?.ManagePersons,
                ManageTasks: selectedDepartment.Permissions?.ManageTasks && selectedDepartmentEmployee.Permissions?.ManageTasks,
            });
        }
    };

    useEffect(() => {
        fetchData();
    }, [person]);

    const handleEditToggle = async () => {
        if (isEditing) {
            // Save changes to Firebase
            try {
                await update(ref(db, 'Persons/' + person.PersonId), {
                    ...personData
                });
                Alert.alert("Başarılı", "Veriler başarıyla güncellendi.");
                setOriginalData({ ...personData });
            } catch (error) {
                Alert.alert("Hata", "Veriler güncellenirken bir hata oluştu: " + error.message);
            }
        }
        setIsEditing(!isEditing);
    };

    const handleCancelEdit = () => {
        setPersonData({ ...originalData });
        setIsEditing(false);
    };

    const handleInputChange = (field, value) => {
        setPersonData({ ...personData, [field]: value });
    };

    const handlePermissionChange = (permission) => {
        setPermissions({ ...permissions, [permission]: !permissions[permission] });
    };

    const handleSavePermissions = async () => {
        if (selectedDepartmentEmployee) {
            try {
                await update(ref(db, `DepartmentEmployees/${selectedDepartmentEmployee.id}/Permissions`), {
                    ...permissions
                });
                Alert.alert("Başarılı", "İzinler başarıyla güncellendi.");
            } catch (error) {
                Alert.alert("Hata", "İzinler güncellenirken bir hata oluştu: " + error.message);
            }
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.card}>
                {isEditing ? (
                    <View>
                        <TextInput
                            style={styles.input}
                            value={personData.Name}
                            onChangeText={(text) => handleInputChange('Name', text)}
                            placeholder="Name"
                        />
                        <TextInput
                            style={styles.input}
                            value={personData.Surname}
                            onChangeText={(text) => handleInputChange('Surname', text)}
                            placeholder="Surname"
                        />
                        <TextInput
                            style={styles.input}
                            value={personData.AccountType}
                            onChangeText={(text) => handleInputChange('AccountType', text)}
                            placeholder="Account Type"
                        />
                        <TextInput
                            style={styles.input}
                            value={personData.Address}
                            onChangeText={(text) => handleInputChange('Address', text)}
                            placeholder="Address"
                        />
                        <TextInput
                            style={styles.input}
                            value={personData.BirthPlace}
                            onChangeText={(text) => handleInputChange('BirthPlace', text)}
                            placeholder="Birth Place"
                        />
                        <TextInput
                            style={styles.input}
                            value={personData.Birthday}
                            onChangeText={(text) => handleInputChange('Birthday', text)}
                            placeholder="Birthday"
                        />
                        <TextInput
                            style={styles.input}
                            value={personData.PhoneNumber}
                            onChangeText={(text) => handleInputChange('PhoneNumber', text)}
                            placeholder="Phone Number"
                        />
                        <TextInput
                            style={styles.input}
                            value={personData.TcNumber}
                            onChangeText={(text) => handleInputChange('TcNumber', text)}
                            placeholder="Tc Number"
                        />
                    </View>
                ) : (
                    <View>
                        <Text style={styles.title}>{personData.Name} {personData.Surname}</Text>
                        <Text style={styles.detail}>Account Type: {personData.AccountType}</Text>
                        <Text style={styles.detail}>Address: {personData.Address}</Text>
                        <Text style={styles.detail}>Birth Place: {personData.BirthPlace}</Text>
                        <Text style={styles.detail}>Birthday: {personData.Birthday}</Text>
                        <Text style={styles.detail}>Phone Number: {personData.PhoneNumber}</Text>
                        <Text style={styles.detail}>Tc Number: {personData.TcNumber}</Text>
                    </View>
                )}
                <View style={styles.buttonContainer}>
                    {isEditing ? (
                        <>
                            <View style={styles.button}>
                                <Button title="Kaydet" onPress={handleEditToggle} color="#4CAF50" />
                            </View>
                            <View style={styles.button}>
                                <Button title="İptal Et" onPress={handleCancelEdit} color="#F44336" />
                            </View>
                        </>
                    ) : (
                        <View style={styles.button}>
                            <Button title="Düzenle" onPress={handleEditToggle} color="#2196F3" />
                        </View>
                    )}
                </View>
            </View>
            {selectedDepartmentEmployee && currentDepartmentEmployee?.Permissions?.Admin && (
                <View style={styles.card}>
                    <Text style={styles.title}>Selected Department</Text>
                    <Text style={styles.detail}>Department: {selectedDepartment?.Name}</Text>
                    <Text style={styles.detail}>Role: {selectedDepartmentEmployee.Role}</Text>

                    {selectedDepartment?.Permissions?.Admin && (
                        <View style={styles.checkboxContainer}>
                            <CheckBox
                                value={permissions.Admin}
                                onValueChange={() => handlePermissionChange('Admin')}
                            />
                            <Text style={styles.checkboxLabel}>Admin</Text>
                        </View>
                    )}
                    {selectedDepartment?.Permissions?.ManageDepartments && (
                        <View style={styles.checkboxContainer}>
                            <CheckBox
                                value={permissions.ManageDepartments}
                                onValueChange={() => handlePermissionChange('ManageDepartments')}
                            />
                            <Text style={styles.checkboxLabel}>Manage Departments</Text>
                        </View>
                    )}
                    {selectedDepartment?.Permissions?.ManagePersons && (
                        <View style={styles.checkboxContainer}>
                            <CheckBox
                                value={permissions.ManagePersons}
                                onValueChange={() => handlePermissionChange('ManagePersons')}
                            />
                            <Text style={styles.checkboxLabel}>Manage Persons</Text>
                        </View>
                    )}
                    {selectedDepartment?.Permissions?.ManageTasks && (
                        <View style={styles.checkboxContainer}>
                            <CheckBox
                                value={permissions.ManageTasks}
                                onValueChange={() => handlePermissionChange('ManageTasks')}
                            />
                            <Text style={styles.checkboxLabel}>Manage Tasks</Text>
                        </View>
                    )}
                    <View style={styles.button}>
                        <Button title="İzinleri Kaydet" onPress={handleSavePermissions} color="#4CAF50" />
                    </View>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    card: {
        padding: 20,
        marginVertical: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    detail: {
        fontSize: 16,
        marginVertical: 5,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
        borderRadius: 5,
        backgroundColor: '#fff',
    },
    buttonContainer: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        flex: 1,
        marginHorizontal: 5,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    checkboxLabel: {
        marginLeft: 10,
        fontSize: 16,
    },
});

export default SelectedPerson;
