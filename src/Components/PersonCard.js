import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import QRCode from "react-qr-code";

const PersonCard = ({ person, searchTerm, highlightText, onPerson }) => {
    return (
        <TouchableOpacity style={styles.personCard} onPress={() => onPerson(person)}>
            <Text style={styles.personName}>
                {highlightText(person.Name, searchTerm)} {highlightText(person.Surname, searchTerm)}
            </Text>
            <QRCode
                size={127}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                value={person.PersonId}
                viewBox={`0 0 256 256`}
            />
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
