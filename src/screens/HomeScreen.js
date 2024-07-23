import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { fetchEmployeeData } from '../Components/fetchEmployeeData';
import { getToken } from '../Components/tokenStorage';
import { fetchDepartmentEmployeeData } from '../Components/fetchDepartmentEmployees';
import { fetchCurrentDepartment } from '../Components/fetchCurrenUserDepartment';

const HomeScreen = ({ navigation }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [userDepartment, setUserDepartment] = useState(null);
  const [userCurrentDepartment, setUserCurrentDepartment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserData = async () => {
      setLoading(true);
      const data = await fetchEmployeeData();
      const department = await fetchDepartmentEmployeeData();
      const currentDepartment = await fetchCurrentDepartment();

      if (data) {
        setUserInfo(data);
        if (department) {
          setUserDepartment(department);
        }
        if (currentDepartment) {
          setUserCurrentDepartment(currentDepartment);
        }
      }
      setLoading(false);
    };

    getUserData();
  }, []);

  const getUserDepartment = async () => {
    const department = await fetchDepartmentEmployeeData();
    const currentDepartment = await fetchCurrentDepartment();
    if (department && currentDepartment) {
      setUserDepartment(department);
      setUserCurrentDepartment(currentDepartment);
    }
  };

  useEffect(() => {
    console.log("DepartmentEmployeee    :", userDepartment);
  }, [userDepartment]);

  useEffect(() => {
    console.log("Current Department    :", userCurrentDepartment);
  }, [userCurrentDepartment]);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View>
      {userInfo ? (
        <View>
          <Text>Welcome, {userInfo.Name + ' ' + userInfo.Surname}!</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Yeni Kullanici Ekle")}>
            <Text>Departmanları Listele</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={getToken}>
            <Text>Tokenı consola yazdır</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={getUserDepartment}>
            <Text>Kullanıcının departmanının görüntüle</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text>Not logged in</Text>
      )}
    </View>
  );
};

export default HomeScreen;
