import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';

function ColorInformation() {
    return (
        <View style={styles.mainContainer}>
            <View style={styles.secondContainer}>
                <View style={styles.iconTextContainer}>
                    <Icon name="circle" size={20} color="pink" />
                    <Text style={[styles.iconText, { color: "pink" }]}>Seçilen gün.</Text>
                </View>

                <View style={styles.iconTextContainer}>
                    <Icon name="circle" size={20} color="gold" />
                    <Text style={[styles.iconText, { color: "gold" }]}>Devam ediyor, tamamlanmamış.</Text>
                </View>
            </View>
            <View style={styles.secondContainer}>
                <View style={styles.iconTextContainer}>
                    <Icon name="circle" size={20} color="orange" />
                    <Text style={[styles.iconText, { color: "orange" }]}>Birden fazla görev.</Text>
                </View>

                <View style={styles.iconTextContainer}>
                    <Icon name="circle" size={20} color="blue" />
                    <Text style={[styles.iconText, { color: "blue" }]}>Devam ediyor, tamamlanmış.</Text>
                </View>
            </View>
            <View style={styles.secondContainer}>
                <View style={styles.iconTextContainer}>
                    <Icon name="circle" size={20} color="red" />
                    <Text style={[styles.iconText, { color: "red" }]}>Süresi geçmiş, tamamlanmamış.</Text>
                </View>

                <View style={styles.iconTextContainer}>
                    <Icon name="circle" size={20} color="green" />
                    <Text style={[styles.iconText, { color: "green" }]}>Süresi geçmiş, tamamlanmış.</Text>
                </View>
            </View>
        </View>
    );
}

export default ColorInformation;

const styles = StyleSheet.create({
    mainContainer: {
        flexDirection: 'column',
        padding: 10,
    },
    secondContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 5,
    },
    iconTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 10,
    },
    iconText: {
        marginLeft: 5,
        flexShrink: 1,
    },
});
