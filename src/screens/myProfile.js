import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, StyleSheet, View, Text } from "react-native";
import BottomBar from "../Components/BottomBar";
import { fetchDepartmentEmployeeData } from '../Services/fetchDepartmentEmployees';
import { fetchCurrentDepartment } from '../Services/fetchCurrentUserDepartment';
import { fetchPersonData } from '../Services/fetchPersonData';
import { fetchInactiveDepartments } from "../Services/fetchInactiveDepartments";
import fetchAllDepartments from "../Services/fetchAllDepartments";
import fetchAllDepartmentEmployees from "../Services/fetchAllDepartmentEmployees";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

const MyProfile = ({ navigation }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [userDepartment, setUserDepartment] = useState(null);
  const [userCurrentDepartment, setUserCurrentDepartment] = useState(null);
  const [userOldDepartment, setUserOldDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allDepartments, setAllDepartments] = useState(null);
  const [allDepartmentEmployees, setAllDepartmentEmployees] = useState(null);

  const getUserData = useCallback(async () => {
    try {
      setLoading(true);
      const [employeeData, departmentData, currentDepartmentData, oldDepartmentData, allDepartments, allDepartmentEmployees] = await Promise.all([
        fetchPersonData(),
        fetchDepartmentEmployeeData(),
        fetchCurrentDepartment(),
        fetchInactiveDepartments(),
        fetchAllDepartments(),
        fetchAllDepartmentEmployees()
      ]);

      setUserInfo(employeeData);
      setUserDepartment(departmentData);
      setUserCurrentDepartment(currentDepartmentData);
      setUserOldDepartment(oldDepartmentData);
      setAllDepartments(allDepartments);
      setAllDepartmentEmployees(allDepartmentEmployees);
    } catch (error) {
      console.log('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      getUserData();
    }, [getUserData])
  );

  const handleDepartments = () => {
    navigation.navigate('Departments');
  };
  const handlePersons = () => {
    navigation.navigate('Persons');
  };
  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  return (
    <SafeAreaView style={styles.topView}>
      <View style={styles.header}>
        {loading ? (
          <Text style={styles.headerText}>Yükleniyor...</Text>
        ) : (
          <Text style={styles.headerText}>Profilim</Text>
        )}
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {!loading && (
          <>
            {userInfo ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Kişi Bilgileri</Text>
                <Text>Adı: {userInfo.Name}</Text>
                <Text>Soyadı: {userInfo.Surname}</Text>
                <Text>TC : {userInfo.TcNumber}</Text>
                <Text>Telefon Numarası: {userInfo.PhoneNumber}</Text>
                <Text>Doğum Günü: {userInfo.Birthday}</Text>
                <Text>Doğum Yeri: {userInfo.BirthPlace}</Text>
                <Text>Adresi: {userInfo.Address}</Text>
              </View>
            ) : (
              <Text>Kişi bulunamadı.</Text>
            )}
            {userDepartment && userCurrentDepartment ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Mevcut Departman ve Bilgileri</Text>
                <Text>Departman Adı: {userCurrentDepartment.DepartmentName}</Text>
                <Text>Departman Açıklaması: {userCurrentDepartment.DepartmentDescription}</Text>
                <Text>Başlama Tarihi: {userDepartment.StartingDate}</Text>
              </View>
            ) : null}
            {userOldDepartment && userOldDepartment.length > 0 ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Çalışma Geçmişi</Text>
                {userOldDepartment.map((dept, index) => {
                  const department = allDepartments.find(d => d.DepartmentId === dept.DepartmentId);
                  return (
                    <View
                      key={index}
                      style={[
                        styles.oldDepartmentItem,
                        { backgroundColor: index % 2 === 0 ? '#f0f0f0' : '#ffffff' }
                      ]}
                    >
                      <Text>Departman Adı: {department ? department.DepartmentName : 'Bilinmiyor'}</Text>
                      <Text>Başlama Tarihi: {dept.StartingDate}</Text>
                      <Text>Bitiş Tarihi: {dept.EndDate}</Text>
                    </View>
                  );
                })}
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
      <View style={styles.bottomBarContainer}>
        <BottomBar onDepartments={handleDepartments} onPersons={handlePersons} onSettings={handleSettings} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#003366',
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  card: {
    width: '90%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    marginVertical: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  oldDepartmentItem: {
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  bottomBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default MyProfile;
