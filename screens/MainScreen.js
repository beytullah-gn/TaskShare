import React from 'react';
import { View, Text, Button,StyleSheet,SafeAreaView,TouchableOpacity } from 'react-native';
import Login, { acType } from './loginScreen';
import Icon from 'react-native-vector-icons/FontAwesome';
import IonIcons from 'react-native-vector-icons/Ionicons';
import style from './style';






function MainScreen({ navigation }) {

  return (
    <SafeAreaView style={style.safearea}>
      <View style={style.topBar}>
        <Text>{acType} olarak giriş yaptın</Text>
      </View>
      <View style={style.firstTopView}>
        <View style={style.insideView}>
          <TouchableOpacity style={style.touchableStyle} onPress={()=>{navigation.navigate('MyTasks')}}  >
            <Icon name="tasks" size={90} color="black" />
            <Text style={{fontSize:20,color:'black'}}>Görevlerim</Text>
          </TouchableOpacity>
          <TouchableOpacity style={style.touchableStyle} onPress={()=>{Login.log}}>
            <Text>2</Text>
          </TouchableOpacity>
        </View>
        <View  style={style.insideView}>
          <TouchableOpacity style={style.touchableStyle}>
            <Text>3</Text>
          </TouchableOpacity>
          <TouchableOpacity style={style.touchableStyle}>
            <Text>4</Text>
          </TouchableOpacity>
        </View>
        <View style={style.insideView}>
          <TouchableOpacity style={style.touchableStyle}>
            <Text>5</Text>
          </TouchableOpacity>
          <TouchableOpacity style={style.touchableStyle} onPress={()=>{console.log(acType)}}>
            <Text>6</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={style.firstBottomView}>
          <TouchableOpacity style={style.touchableStyle} onPress={()=>{navigation.navigate('Login')} }>
            <Icon name="sign-out" size={20} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={style.touchableStyle}>
          <Icon name="circle-o" size={20} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={style.touchableStyle}>
          <IonIcons name="settings" size={20} color="black" />
          </TouchableOpacity>
        </View>
      
    </SafeAreaView>
  );
}


export default MainScreen;
