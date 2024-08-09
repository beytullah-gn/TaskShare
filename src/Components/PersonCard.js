import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import QRCode from "react-qr-code";

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
                        source={{ uri: 'https://firebasestorage.googleapis.com/v0/b/taskshare-648cf.appspot.com/o/ProfilePictures%2Fdefault.jpg?alt=media&token=1c6bf6b4-b46c-4498-ae58-3d86baf568a1' }} 
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
                color="#1d3469"
                style={styles.icon}
            />
           
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    personCard: {
        backgroundColor: '#ffffff',
        padding: 5,
        borderRadius: 10,
        borderTopLeftRadius:25,
        borderBottomLeftRadius:25,
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
        borderWidth: 1, 
        borderColor: '#3b5998',
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
        color: '#3b5998',
    },
    highlight: {
        backgroundColor: 'yellow',
    },
    icon: {
        marginLeft: 10,
    },
});

export default PersonCard;


/* <QRCode
                size={100}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                value={person.PersonId}
                viewBox={`0 0 256 256`}
            />

            */