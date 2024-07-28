import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const PersonCard = ({ person, expandedPerson, onToggleExpand, showEditButton, searchTerm, highlightText }) => {
    const isExpanded = expandedPerson === person.id;

    return (
        <View style={styles.personCard}>
            <TouchableOpacity onPress={() => onToggleExpand(person.id)}>
                <Text style={styles.personName}>
                    {highlightText(person.Name, searchTerm)} {highlightText(person.Surname, searchTerm)}
                </Text>
            </TouchableOpacity>
            {isExpanded && (
                <View>
                    <Text style={styles.personDetail}>Telefon: {person.PhoneNumber}</Text>
                    <Text style={styles.personDetail}>TC Kimlik No: {person.TcNumber}</Text>
                    <Text style={styles.personDetail}>Doğum Günü: {person.Birthday}</Text>
                    <Text style={styles.personDetail}>Doğum Yeri: {person.BirthPlace}</Text>
                    <Text style={styles.personDetail}>Adres: {person.Address}</Text>
                    {showEditButton && (
                        <TouchableOpacity style={styles.editButton}>
                            <Text style={styles.editButtonText}>Düzenle</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    personCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 3,
    },
    personName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#003366',
    },
    highlight: {
        backgroundColor: 'yellow',
    },
    personDetail: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    editButton: {
        backgroundColor: '#0055a5',
        marginTop: 10,
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    editButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default PersonCard;