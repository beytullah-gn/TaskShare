import React, { useState, useCallback } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomBar from "../Components/BottomBar";
import { Ionicons } from '@expo/vector-icons';
import fetchAllPersons from "../Services/fetchAllPersons";
import { fetchCurrentDepartment } from "../Services/fetchCurrentUserDepartment";
import PersonToggleButton from "../Components/PersonToggleButton";
import PersonCard from "../Components/PersonCard";
import PersonSearchInput from "../Components/PersonSearchInput";
import PersonAddButton from "../Components/PersonAddButton";
import { useFocusEffect } from '@react-navigation/native';

const PersonsScreen = ({ navigation }) => {
    const [persons, setPersons] = useState([]);
    const [showAddButton, setShowAddButton] = useState(false);
    const [selectedType, setSelectedType] = useState("Employee");
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedPerson, setExpandedPerson] = useState(null);

    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                try {
                    const personsData = await fetchAllPersons();
                    if (personsData) {
                        personsData.sort((a, b) => a.Name.localeCompare(b.Name));
                    }
                    setPersons(personsData);
                } catch (error) {
                    console.log("Error fetching persons: ", error);
                }
            };

            const checkPermissions = async () => {
                try {
                    const department = await fetchCurrentDepartment();
                    if (department && department.Permissions && department.Permissions.ManagePersons) {
                        setShowAddButton(true);
                    } else {
                        setShowAddButton(false);
                    }
                } catch (error) {
                    console.log("Error fetching department: ", error);
                    setShowAddButton(false);
                }
            };

            fetchData();
            checkPermissions();
        }, [])
    );

    const handleSearch = (text) => {
        setSearchTerm(text);
    };

    const filteredPersons = persons
        .filter(person => person.AccountType === selectedType)
        .filter(person =>
            person.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            person.Surname.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const highlightText = (text, highlight) => {
        if (!highlight) return text;
        const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
        return parts.map((part, index) =>
            part.toLowerCase() === highlight.toLowerCase() ? (
                <Text key={index} style={styles.highlight}>{part}</Text>
            ) : (
                part
            )
        );
    };

    const handleDepartments = () => {
        navigation.navigate('Departments');
    };

    const handleProfile = () => {
        navigation.navigate('MyProfile');
    };

    const handleSettings = () => {
        navigation.navigate('Settings');
    };

    const handleAddPerson = () => {
        navigation.navigate("AddPerson");
    };

    const handlePerson = (person) => {
        navigation.navigate("SelectedPerson", { person });
    };

    return (
        <SafeAreaView style={styles.container}>
            <PersonSearchInput searchTerm={searchTerm} onSearch={handleSearch} />
            <PersonToggleButton selectedType={selectedType} onSelectType={setSelectedType} />
            <View style={styles.content}>
                <ScrollView>
                    {filteredPersons.length > 0 ? (
                        filteredPersons.map(person => (
                            <PersonCard
                                key={person.id}
                                person={person}
                                expandedPerson={expandedPerson}
                                showEditButton={showAddButton}
                                searchTerm={searchTerm}
                                highlightText={highlightText}
                                onPerson={handlePerson}
                            />
                        ))
                    ) : (
                        <Text>Kişi bulunamadı</Text>
                    )}
                </ScrollView>
            </View>
            {showAddButton && <PersonAddButton onAdd={handleAddPerson} />}
            <BottomBar
                onProfile={handleProfile}
                onDepartments={handleDepartments}
                onSettings={handleSettings}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    content: {
        flex: 1,
        padding: 10,
    },
    highlight: {
        backgroundColor: 'yellow',
    },
});

export default PersonsScreen;
