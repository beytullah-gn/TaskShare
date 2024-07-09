import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import Login, { acType } from '../loginScreen';
import Icon from 'react-native-vector-icons/FontAwesome';
import IonIcons from 'react-native-vector-icons/Ionicons';
import style from '../style';
import AsyncStorage from '@react-native-async-storage/async-storage';



// Kullanıcı verilerini okuma fonksiyonunu ekleyin
const getUsers = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem('@users');
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error("Kullanıcı verileri alınamadı: ", e);
        return [];
    }
};

function MainScreen({ navigation }) {
  // Kullanıcı verilerini konsola yazdıracak fonksiyonu tanımlayın
  const logUsersToConsole = async () => {
      const users = await getUsers();
      console.log('Kullanıcı Verileri:', users);
  };

  return (
    <SafeAreaView style={style.safearea}>
      <View style={style.topBar}>
        <Text>{acType} olarak giriş yaptın</Text>
      </View>
      <View style={style.firstTopView}>
        <View style={style.insideView}>
          <TouchableOpacity style={style.touchableStyle} onPress={() => navigation.navigate('Görev Ata')} >
            <Icon name="tasks" size={90} color="black" />
            <Text style={{ fontSize: 20, color: 'black' }}>Görevleri Yönet</Text>
          </TouchableOpacity>
          <TouchableOpacity style={style.touchableStyle} onPress={() => navigation.navigate('Kullanıcıları Yönet')}>
            <Icon name="user" size={90} color="black" />
            <Text style={{ fontSize: 17, color: 'black' }}>Kullanıcıları Yönet</Text>
          </TouchableOpacity>
        </View>
        <View style={style.insideView}>
          <TouchableOpacity style={style.touchableStyle} onPress={() => navigation.navigate('Mesajlarım')}>
            <Icon name="envelope-o" size={90} color="black" />
            <Text style={{ fontSize: 17, color: 'black' }}>Mesajlarım</Text>
          </TouchableOpacity>
          <TouchableOpacity style={style.touchableStyle}>
            <Text>4</Text>
          </TouchableOpacity>
        </View>
        <View style={style.insideView}>
          <TouchableOpacity style={style.touchableStyle}>
            <Text>5</Text>
          </TouchableOpacity>
          <TouchableOpacity style={style.touchableStyle} onPress={() => console.log(acType)}>
            <Text>6</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={style.firstBottomView}>
        <TouchableOpacity style={style.touchableStyle} onPress={() => navigation.navigate('Login')} >
          <Icon name="reply" size={20} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={style.touchableStyle}>
          <Icon name="circle-o" size={20} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={style.touchableStyle} onPress={() => navigation.navigate('Ayarlar')}>
          <IonIcons name="settings" size={20} color="black" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default MainScreen;
