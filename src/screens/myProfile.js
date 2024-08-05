import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import BottomBar from '../Components/BottomBar';
import { fetchDepartmentEmployeeData } from '../Services/fetchDepartmentEmployees';
import { fetchCurrentDepartment } from '../Services/fetchCurrentUserDepartment';
import { fetchPersonData } from '../Services/fetchPersonData';
import { fetchInactiveDepartments } from '../Services/fetchInactiveDepartments';
import fetchAllDepartments from '../Services/fetchAllDepartments';
import { fetchUserRoles } from '../Services/fetchUserRoles';
import fetchAllRoles from '../Services/fetchAllRoles';




const formatDateString = (dateString) => {
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', options);
};

// Function to get color based on index
const getColorForIndex = (index) => {
  return index % 2 === 0 ? '#f0f0f0' : '#ffffff';
};

const renderDepartments = (departments, parentId, index = 0) => {
  return (
    <View>
      {departments
        .filter(dept => dept.ParentDepartment === parentId)
        .map((dept, deptIndex) => (
          <View key={dept.DepartmentId} style={{ marginBottom: 5 }}>
            <View style={[styles.responsibleDepartmentItem, { backgroundColor: getColorForIndex(index + deptIndex) }]}>
              <Text><Text style={styles.boldText}>Departman Adı: </Text>{dept.DepartmentName}</Text>
              <Text><Text style={styles.boldText}>Departman Açıklaması: </Text>{dept.DepartmentDescription}</Text>
            </View>
            {renderDepartments(departments, dept.DepartmentId, index + deptIndex + 1)}
          </View>
        ))}
    </View>
  );
};

const MyProfile = ({ navigation }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [userDepartment, setUserDepartment] = useState(null);
  const [userCurrentDepartment, setUserCurrentDepartment] = useState([]);
  const [userOldDepartment, setUserOldDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allDepartments, setAllDepartments] = useState(null);
  const [departmentEmployeesData, setDepartmentEmployeesData] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [allRoles, setAllRoles] = useState([]);

  const getUserData = useCallback(async () => {
    try {
      setLoading(true);
      const [employeeData, departmentData, currentDepartmentData, oldDepartmentData, allDepartmentsData, departmentEmployees,roles,allRoles] = await Promise.all([
        fetchPersonData(),
        fetchDepartmentEmployeeData(),
        fetchCurrentDepartment(),
        fetchInactiveDepartments(),
        fetchAllDepartments(),
        fetchDepartmentEmployeeData(), // Tarih verilerini burada çekiyoruz
        fetchUserRoles(), // Kullanıcı rol bilgilerini burada alıyoruz
        fetchAllRoles(), // Kullanıcı rol bilgilerini burada alıyoruz
        
      ]);
      console.log("current department", currentDepartmentData);
      console.log(oldDepartmentData);
      setUserInfo(employeeData);
      setUserDepartment(departmentData);
      setUserCurrentDepartment(currentDepartmentData);
      setUserOldDepartment(oldDepartmentData);
      setAllDepartments(allDepartmentsData);
      setDepartmentEmployeesData(departmentEmployees); // Tarih verilerini buraya kaydediyoruz
      setUserRoles(roles); // Kullanıcı rol bilgilerini burada kaydediyoruz
      setAllRoles(allRoles);
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

  const handleViewPDF = (pdfUrl) => {
    if (pdfUrl) {
      navigation.navigate("MyDocument", { pdfUrl });
    } else {
      alert('PDF dosyası bulunamadı.');
    }
  };

  // Find departments where the current user is responsible
  const responsibleDepartments = allDepartments?.filter(dept => dept.ParentDepartment === userDepartment?.DepartmentId) || [];

  // Get department data with corresponding employee dates
  const getDepartmentDate = (departmentId) => {
    const departmentData = departmentEmployeesData.find(dept => {
      return userRoles.some(role => role.RoleID === dept.RoleID && role.DepartmentId === departmentId);
    });
    return departmentData ? departmentData.StartingDate : 'Bilgi Yok';
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
                <Text><Text style={styles.boldText}>Adı: </Text>{userInfo.Name}</Text>
                <Text><Text style={styles.boldText}>Soyadı: </Text>{userInfo.Surname}</Text>
                <Text><Text style={styles.boldText}>TC: </Text>{userInfo.TcNumber}</Text>
                <Text><Text style={styles.boldText}>Telefon Numarası: </Text>{userInfo.PhoneNumber}</Text>
                <Text><Text style={styles.boldText}>Doğum Günü: </Text>{userInfo.Birthday}</Text>
                <Text><Text style={styles.boldText}>Doğum Yeri: </Text>{userInfo.BirthPlace}</Text>
                <Text><Text style={styles.boldText}>Adresi: </Text>{userInfo.Address}</Text>
              </View>
            ) : (
              <Text>Kişi bulunamadı.</Text>
            )}
            {userCurrentDepartment.length > 0 ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Mevcut Departman ve Bilgileri</Text>
                {userCurrentDepartment.map((dept, index) => (
                  <View key={index} style={styles.departmentItem}>
                    <Text><Text style={styles.boldText}>Departman Adı: </Text>{dept.DepartmentName || 'Bilgi Yok'}</Text>
                    <Text><Text style={styles.boldText}>Departman Açıklaması: </Text>{dept.DepartmentDescription || 'Bilgi Yok'}</Text>
                    <Text><Text style={styles.boldText}>Başlama Tarihi: </Text>{formatDateString(getDepartmentDate(dept.DepartmentId)) || 'Bilgi Yok'}</Text>
                    
                      <TouchableOpacity style={styles.pdfButton} onPress={() => handleViewPDF(dept.PDFUrl)}>
                        <Text style={styles.pdfButtonText}>Departman PDF'ini Görüntüle</Text>
                      </TouchableOpacity>
                    
                  </View>
                ))}
              </View>
            ) : null}
            {userOldDepartment && userOldDepartment.length > 0 ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Çalışma Geçmişi</Text>
                {userOldDepartment.map((dept, index) => {
                  // Eşleşen rolü bul
                  const role = userRoles.find(role => role.RoleID === dept.RoleID);
                  // Eğer rol varsa, departman ID'sini kullanarak departmanı bul
                  const department = role ? allDepartments.find(d => d.DepartmentId === role.DepartmentId) : null;
                  return (
                    <View
                      key={index}
                      style={[
                        styles.oldDepartmentItem,
                        { backgroundColor: index % 2 === 0 ? '#f0f0f0' : '#ffffff' }
                      ]}
                    >
                      <Text><Text style={styles.boldText}>Departman Adı: </Text>{department ? department.DepartmentName : 'Bilinmiyor'}</Text>
                      <Text><Text style={styles.boldText}>Başlama Tarihi: </Text>{formatDateString(dept.StartingDate)}</Text>
                      <Text><Text style={styles.boldText}>Bitiş Tarihi: </Text>{formatDateString(dept.EndDate)}</Text>
                    </View>
                  );
                })}
              </View>
            ) : null}
            {responsibleDepartments.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Sorumlu Olduğu Departmanlar</Text>
                {renderDepartments(allDepartments, userDepartment?.DepartmentId)}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <View style={styles.bottomBarContainer}>
        <BottomBar onDepartments={handleDepartments} onPersons={handlePersons} onSettings={handleSettings} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  topView: {
    flex: 1,
    backgroundColor: '#ADD8E6'
  },
  header: {
    paddingTop: 30,
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
    color: '#003366',
  },
  responsibleDepartmentItem: {
    width: 300,
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
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
  pdfButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  pdfButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  departmentItem: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  boldText: {
    color: '#003366',
    fontWeight: 'bold',
  },
});

export default MyProfile;
