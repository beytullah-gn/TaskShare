import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import { Ionicons } from '@expo/vector-icons';

const PersonCard = ({ person, searchTerm, highlightText, onPerson }) => {
    return (
        <TouchableOpacity style={styles.personCard} onPress={() => onPerson(person)}>
            <View style={styles.profilePictureContainer}>
                {person.ProfilePictureUrl ? (
                    <Image 
                        source={{ uri: person.ProfilePictureUrl }} 
                        style={styles.profilePicture} 
                    />
                ) : 
                    <Image 
                        source={{ uri: 'https://firebasestorage.googleapis.com/v0/b/taskshare-648cf.appspot.com/o/ProfilePictures%2Fprofilephoto.png?alt=media&token=731cf747-ca06-43d3-8a54-2655b2f8ee3c' }} 
                        style={styles.profilePicture} 
                    />
                }
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.personName}>
                    {highlightText(person.Name, searchTerm)} {highlightText(person.Surname, searchTerm)}
                </Text>
            </View>
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
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    profilePictureContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        overflow: 'hidden',
        marginRight: 15,
    },
    profilePicture: {
        width: '100%',
        height: '100%',
    },
    textContainer: {
        flex: 1,
    },
    personName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#003366',
    },
    highlight: {
        backgroundColor: 'yellow',
    },
    icon: {
        marginLeft: 10,
    },
});

export default PersonCard;
