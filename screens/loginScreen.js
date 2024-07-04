import React, { useState } from "react";
import { View,SafeAreaView,Text,StyleSheet, TextInput, Button, TouchableOpacity } from "react-native";


function Login( { navigation }) {
    const[text,onChangeText]= React.useState("");
    const[password,onChangePassword]= React.useState("");
    
    function sifreunuttum(){
        alert('Sifre değiştir');
    }
    const AdminUsername = 'admin';
    const AdminPassword = 1234;
    const WorkerUsername = 'worker';
    const WorkerPassword = 12345;
    

    function Auth(){
        if(text==AdminUsername && password == AdminPassword)
        {
          console.log("admin giris basarili");
          onChangePassword('');
          onChangeText('');
          accountType='admin';
          navigation.navigate('MainScreen');
          acType='Admin';
          
          
        }
        else if (text==WorkerUsername && password == WorkerPassword){
          console.log("Çalışan giris basarili");
          onChangePassword('');
          onChangeText('');
          accountType='worker';
          navigation.navigate('MainScreen');
          acType= 'Worker';
          
        }
        else 
        {
          console.log("giris basarisiz");
          onChangePassword('');
        }
    }
      
    return(
    <SafeAreaView style={
      Style.container
    }>
      <View style={Style.firstView}/>
      <View style={Style.Viewstyle}>
        <Text>
          GİRİŞ YAP
        </Text>
        <TextInput 
        style={Style.InputStyle}
        value={text} 
        placeholder="Kullanici Adi"
        onChangeText={onChangeText}
        ></TextInput>
        <TextInput 
        style={Style.InputStyle}
        value={password} 
        onChangeText={onChangePassword}
        placeholder="Sifre"
        ></TextInput>
        <View style={Style.buttonView}>
          <Button title="Giriş Yap" onPress={Auth} ></Button>
          <View style={Style.spacer}></View>
          <TouchableOpacity onPress={sifreunuttum}>
            <Text style={Style.color}>
              Şifremi Unuttum
            </Text>
          </TouchableOpacity>
        </View>
        

      </View>

    </SafeAreaView>

   );
  
}

const Style = StyleSheet.create({
    container:{
      flex:1,
      backgroundColor:'whitesmoke'
    },
    firstView:{
      marginTop:30
    },
    Viewstyle:{
      flex:1,
      justifyContent:'center',
      alignItems:'center',
      backgroundColor:'white',
    },
    InputStyle:{
      width:300,
      height: 30,
      borderWidth:1,
      margin:5,
      padding:7,
      borderRadius:12,
    
    },
    buttonView:{
      flexDirection:'row',
      margin:10,
      alignItems:'center',
      
    },
   spacer:{
      width:20,
   },
   color:{
    color:'blue'
   }
})

export default Login;
export let acType;