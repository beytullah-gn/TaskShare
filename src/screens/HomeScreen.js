// HomeScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { fetchUserData } from '../Components/fetchUserData';
import { getToken } from '../Components/tokenStorage';

const HomeScreen = ({ navigation }) => {
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    const getUserData = async () => {
      const data = await fetchUserData();
      if (data) {
        setUserInfo(data);
      }
    };

    getUserData();
  }, []);

  return (
    <View>
      {userInfo ? (
        <View>
          <Text>Welcome, {userInfo.Name + ' ' + userInfo.Surname}!</Text>
          <TouchableOpacity onPress={()=>navigation.navigate("Yeni Kullanici Ekle")}>
            <Text>Click mee</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={getToken}>
            <Text>Click mee</Text>
          </TouchableOpacity>
        </View>
        
        
      ) : (
        <Text>Not logged in</Text>
      )}
    </View>
  );
};

export default HomeScreen;
