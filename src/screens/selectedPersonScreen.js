import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { Picker } from '@react-native-picker/picker';
import { db,storage } from '../Services/firebase-config';
import { update, ref } from 'firebase/database';
import { fetchDepartmentEmployeeData } from '../Services/fetchDepartmentEmployees';
import { fetchDepartmentEmployeeDataByPersonId } from '../Services/fetchDepartmentEmployeesById';
import fetchAllDepartments from '../Services/fetchAllDepartments';
import { ref as sref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';

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
    const [image, setImage] = useState(null);

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
                let updatedPersonData = { ...personData };

                // Upload new profile picture if selected
                if (image) {
                    const imageName = `${person.PersonId}`;
                    const storageRef = sref(storage, `ProfilePictures/${imageName}`);
                    const img = await fetch(image);
                    const bytes = await img.blob();
                    await uploadBytes(storageRef, bytes);
                    const imageUrl = await getDownloadURL(storageRef);
                    updatedPersonData.ProfilePictureUrl = imageUrl;
                }

                await update(ref(db, 'Persons/' + person.PersonId), updatedPersonData);
                Alert.alert("Başarılı", "Veriler başarıyla güncellendi.");
                setOriginalData({ ...updatedPersonData });
                setImage(null); // Clear selected image after upload
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

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            alert("Kamera veya galeriye erişim izni gerekli!");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.card}>
                {/* Display the profile picture */}
                <View style={styles.profilePictureContainer}>
                    {personData.ProfilePictureUrl ? (
                    <Image 
                        source={{ uri: personData.ProfilePictureUrl }} 
                        style={styles.profilePicture} 
                    />
                ) : 
                    <Image 
                        source={{ uri: 'https://firebasestorage.googleapis.com/v0/b/taskshare-648cf.appspot.com/o/ProfilePictures%2Fdefault.jpg?alt=media&token=1c6bf6b4-b46c-4498-ae58-3d86baf568a1' }} 
                        style={styles.profilePicture} 
                    />
                }
                </View>
                {isEditing && (
                    <View style={styles.imagePickerContainer}>
                        <Button title="Fotoğraf Seç" onPress={pickImage} color="#3b5998" />
                        {image && (
                            <View style={styles.imageContainer}>
                                <Text style={styles.imageLabel}>Seçilen fotoğraf:</Text>
                                <Image source={{ uri: image }} style={styles.image} />
                            </View>
                        )}
                    </View>
                )}
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
                        <Picker
                            selectedValue={personData.AccountType}
                            style={styles.picker}
                            onValueChange={(itemValue) => handleInputChange('AccountType', itemValue)}
                        >
                            <Picker.Item label="Çalışan" value="Employee" />
                            <Picker.Item label="Müşteri" value="Client" />
                        </Picker>
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
                        <Text style={styles.detail}>Hesap Türü: {personData.AccountType === 'Employee' ? 'Çalışan' : 'Müşteri'}</Text>
                        <Text style={styles.detail}>Adresi: {personData.Address}</Text>
                        <Text style={styles.detail}>Doğum Yeri: {personData.BirthPlace}</Text>
                        <Text style={styles.detail}>Doğum Günü: {personData.Birthday}</Text>
                        <Text style={styles.detail}>Telefon Numarası: {personData.PhoneNumber}</Text>
                        <Text style={styles.detail}>Tc Numarası: {personData.TcNumber}</Text>
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
                    <Text style={styles.detail}>Department: {selectedDepartment?.DepartmentName}</Text>
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
        backgroundColor: '#dfe3ee',
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
    profilePictureContainer: {
        alignItems: 'center',
        marginBottom: 15,
    },
    profilePicture: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    imagePickerContainer: {
        alignItems: 'center',
        marginBottom: 15,
    },
    imageContainer: {
        alignItems: 'center',
        marginTop: 10,
    },
    imageLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#3b5998',
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 50,
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
    picker: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
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
