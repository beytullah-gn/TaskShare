import React from "react";
import { StyleSheet, TextInput, View, TouchableOpacity } from "react-native";
import { Ionicons } from '@expo/vector-icons';

const PersonSearchInput = ({ searchTerm, onSearch }) => {
    return (
        <View style={styles.header}>
            <TextInput
                style={styles.searchInput}
                placeholder="Ara..."
                placeholderTextColor="#888"
                value={searchTerm}
                onChangeText={onSearch}
            />
            <TouchableOpacity style={styles.searchButton}>
                <Ionicons name="search" size={20} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#003366',
    },
    searchInput: {
        flex: 1,
        height: 40,
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingHorizontal: 15,
        marginRight: 10,
    },
    searchButton: {
        backgroundColor: '#0055a5',
        borderRadius: 20,
        padding: 10,
    },
});

export default PersonSearchInput;
