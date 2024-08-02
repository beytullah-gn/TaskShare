import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from '@expo/vector-icons';

const PersonCard = ({ person, searchTerm, highlightText, onPerson }) => {
    return (
        <TouchableOpacity style={styles.personCard} onPress={() => onPerson(person)}>
            <Text style={styles.personName}>
                {highlightText(person.Name, searchTerm)} {highlightText(person.Surname, searchTerm)}
            </Text>
            <Ionicons
                name={'arrow-forward'}
                size={40}
                color="#0055a5"
                style={styles.icon}
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    personCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 3,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    personName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#003366',
    },
    highlight: {
        backgroundColor: 'yellow',
    },
});

export default PersonCard;
