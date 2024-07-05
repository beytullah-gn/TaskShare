import React, { useState } from "react";
import { View, SafeAreaView, Text, StyleSheet, TextInput, Button, TouchableOpacity } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

function Login({ navigation }) {
    const [text, onChangeText] = useState("");
    const [password, onChangePassword] = useState("");

    async function getUsers() {
        try {
            const jsonValue = await AsyncStorage.getItem('@users');
            return jsonValue != null ? JSON.parse(jsonValue) : [];
        } catch (e) {
            console.error("Kullanıcı verileri alınamadı: ", e);
            return [];
        }
    }

    async function Auth() {
        const users = await getUsers();
        const user = users.find(u => u.username === text && u.password === password);

        if (user) {
            console.log(`${user.accountType} girişi başarılı`);
            onChangePassword('');
            onChangeText('');
            acType = user.accountType;
            acId = user.id;
            console.log(acId);
            if(acType=='Admin'){
              navigation.navigate('MainScreen');
            }
            if(acType=='worker'){
              navigation.navigate('MainScreenWorker');
            }
            
            
        } else {
            console.log("Giriş başarısız");
            onChangePassword('');
            alert('Giriş başarısız');
        }
    }

    function sifreunuttum() {
        alert('Şifre değiştir');
        
    }

    return (
        <SafeAreaView style={Style.container}>
            <View style={Style.firstView} />
            <View style={Style.Viewstyle}>
                <Text>GİRİŞ YAP</Text>
                <TextInput 
                    style={Style.InputStyle}
                    value={text}
                    placeholder="Kullanıcı Adı"
                    onChangeText={onChangeText}
                />
                <TextInput 
                    style={Style.InputStyle}
                    value={password}
                    onChangeText={onChangePassword}
                    placeholder="Şifre"
                    secureTextEntry
                />
                <View style={Style.buttonView}>
                    <Button title="Giriş Yap" onPress={Auth} />
                    <View style={Style.spacer}></View>
                    <TouchableOpacity onPress={sifreunuttum}>
                        <Text style={Style.color}>Şifremi Unuttum</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const Style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'whitesmoke'
    },
    firstView: {
        marginTop: 30
    },
    Viewstyle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    InputStyle: {
        width: 300,
        height: 40,
        borderWidth: 1,
        margin: 5,
        padding: 7,
        borderRadius: 12,
    },
    buttonView: {
        flexDirection: 'row',
        margin: 10,
        alignItems: 'center',
    },
    spacer: {
        width: 20,
    },
    color: {
        color: 'blue'
    }
});

export default Login;
export let acType,acId;
