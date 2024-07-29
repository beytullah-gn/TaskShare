import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from '@expo/vector-icons';

const PersonAddButton = ({onAdd}) => {
    return (
        <TouchableOpacity style={styles.addButton} onPress={onAdd}>
            <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    addButton: {
        backgroundColor: '#0055a5',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        position: 'absolute',
        bottom: 80,
        right: 20,
    },
});

export default PersonAddButton;
