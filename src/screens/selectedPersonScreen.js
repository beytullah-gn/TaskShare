import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { db } from '../Services/firebase-config';
import { update,ref} from 'firebase/database';
import fetchAllDepartmentEmployees from '../Services/fetchAllDepartmentEmployees';
import { fetchDepartmentEmployeeData } from '../Services/fetchDepartmentEmployees';


const SelectedPerson = ({ route }) => {
    const { person } = route.params;

    const [isEditing, setIsEditing] = useState(false);
    const [personData, setPersonData] = useState({ ...person });
    const [originalData, setOriginalData] = useState({ ...person });

    const handleEditToggle = async () => {
        if (isEditing) {
            // Save changes to Firebase
            try {
                await update(ref(db,'Persons/'+person.PersonId),{
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

    return (
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
                        <Button title="Kaydet" onPress={handleEditToggle} />
                        <Button title="İptal Et" onPress={handleCancelEdit} />
                    </>
                ) : (
                    <Button title="Düzenle" onPress={handleEditToggle} />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: 20,
        margin: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
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
    },
    buttonContainer: {
        marginTop: 20,
    },
});

export default SelectedPerson;
