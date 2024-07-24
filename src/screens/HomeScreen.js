import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import { fetchEmployeeData } from '../Services/fetchEmployeeData';
import { getToken } from '../Services/tokenStorage';
import { fetchDepartmentEmployeeData } from '../Services/fetchDepartmentEmployees';
import { fetchCurrentDepartment } from '../Services/fetchCurrenUserDepartment';
import BottomBar from '../Components/BottomBar';

const HomeScreen = ({ navigation }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [userDepartment, setUserDepartment] = useState(null);
  const [userCurrentDepartment, setUserCurrentDepartment] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    // Çıkış yapma işlemleri
    console.log('Çıkış yapıldı');
  };

  const handleSettings = () => {
    navigation.navigate('Settings'); // Ayarlar sayfasına yönlendirir
  };

  useEffect(() => {
    const getUserData = async () => {
      try {
        setLoading(true);
        const [employeeData, departmentData, currentDepartmentData] = await Promise.all([
          fetchEmployeeData(),
          fetchDepartmentEmployeeData(),
          fetchCurrentDepartment()
        ]);

        setUserInfo(employeeData);
        setUserDepartment(departmentData);
        setUserCurrentDepartment(currentDepartmentData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, []);

  const getUserDepartment = async () => {
    try {
      const [department, currentDepartment] = await Promise.all([
        fetchDepartmentEmployeeData(),
        fetchCurrentDepartment()
      ]);

      setUserDepartment(department);
      setUserCurrentDepartment(currentDepartment);
    } catch (error) {
      console.error('Error fetching department data:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00f" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {userInfo ? (
          <View style={styles.contentContainer}>
            <Text style={styles.welcomeText}>Welcome, {userInfo.Name + ' ' + userInfo.Surname}!</Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("Yeni Kullanici Ekle")}
            >
              <Text style={styles.buttonText}>Departmanları Listele</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={async () => {
                const token = await getToken();
                console.log(token);
              }}
            >
              <Text style={styles.buttonText}>Tokenı consola yazdır</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={getUserDepartment}
            >
              <Text style={styles.buttonText}>Kullanıcının departmanını görüntüle</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={getUserDepartment}
            >
              <Text style={styles.buttonText}>Kullanıcının departmanını görüntüle</Text>
            </TouchableOpacity>

            {userCurrentDepartment && (
              <View style={styles.departmentInfo}>
                <Text style={styles.departmentTitle}>Current Department:</Text>
                <Text style={styles.departmentText}>{userCurrentDepartment.DepartmentName}</Text>
                <Text style={styles.departmentText}>Description: {userCurrentDepartment.DepartmentDescription}</Text>
              </View>
            )}
          </View>
        ) : (
          <Text style={styles.notLoggedInText}>Not logged in</Text>
        )}
      </ScrollView>
      <BottomBar onLogout={handleLogout} onSettings={handleSettings} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollViewContent: {
 
  },
  contentContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  departmentInfo: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 5,
    elevation: 3,
  },
  departmentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  departmentText: {
    fontSize: 16,
    marginBottom: 5,
  },
  notLoggedInText: {
    fontSize: 18,
    color: '#ff0000',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
