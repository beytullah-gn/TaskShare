import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const PersonToggleButton = ({ selectedType, onSelectType }) => {
    return (
        <View style={styles.toggleContainer}>
            <TouchableOpacity
                style={[styles.toggleButton, selectedType === "Employee" && styles.activeButton]}
                onPress={() => onSelectType("Employee")}
            >
                <Text style={styles.toggleButtonText}>Çalışanlar</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.toggleButton, selectedType === "Client" && styles.activeButton]}
                onPress={() => onSelectType("Client")}
            >
                <Text style={styles.toggleButtonText}>Müşteriler</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    toggleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 10,
    },
    toggleButton: {
        flex: 1,
        padding: 10,
        backgroundColor: '#d9d9d9',
        alignItems: 'center',
        borderRadius: 20,
        marginHorizontal: 5,
    },
    activeButton: {
        backgroundColor: '#0055a5',
    },
    toggleButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default PersonToggleButton;
