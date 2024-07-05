import React, { useState } from "react";
import { StyleSheet, SafeAreaView, Text, TextInput, View, TouchableOpacity, Modal, Alert, ScrollView } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

const storeUserData = async (users) => {
  try {
    const jsonValue = JSON.stringify(users);
    await AsyncStorage.setItem('@users', jsonValue);
    console.log("Kullanıcı verileri başarıyla kaydedildi.");
  } catch (e) {
    console.error("Kullanıcı verileri kaydedilemedi: ", e);
  }
};

const getUserData = async () => {
  try {
    const storedUsers = await AsyncStorage.getItem('@users');
    return storedUsers ? JSON.parse(storedUsers) : [];
  } catch (e) {
    console.error("Kullanıcı verileri getirilemedi: ", e);
    return [];
  }
};

const deleteUser = async (userId) => {
  try {
    const storedUsers = await AsyncStorage.getItem('@users');
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    const filteredUsers = users.filter(user => user.id !== userId);
    await storeUserData(filteredUsers);
    console.log("Kullanıcı başarıyla silindi.");
  } catch (e) {
    console.error("Kullanıcı silinemedi: ", e);
  }
};

function NewWorker() {
  const [modalVisible, setModalVisible] = useState(false);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState('');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const handleOption = (type) => {
    setAccountType(type);
    setModalVisible(false);
  };

  const handleSaveUser = async () => {
    if (!username || !password || !accountType) {
      setError("Lütfen tüm alanları doldurun ve yetki düzeyi seçin.");
      return;
    }

    const newUser = {
      id: Date.now().toString(),
      username: username,
      password: password,
      accountType: accountType,
    };
    try {
      const storedUsers = await AsyncStorage.getItem('@users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      users.push(newUser);
      await storeUserData(users);
      console.log("Yeni kullanıcı başarıyla kaydedildi.");

      // Formu sıfırla
      setUsername('');
      setPassword('');
      setAccountType('');
      setError('');
    } catch (e) {
      console.error("Yeni kullanıcı kaydedilemedi: ", e);
    }
  };

  const handleViewUsers = async () => {
    const users = await getUserData();
    console.log(users);
    setUsers(users);
    setUserModalVisible(true);
  };

  const handleDeleteUser = async (userId) => {
    if (userId === '1') {
      Alert.alert("Hata", "Bu kullanıcı silinemez.");
      return;
    }

    await deleteUser(userId);
    const users = await getUserData();
    setUsers(users);
  };

  return (
    <SafeAreaView style={style.safeStyle}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={style.modalOverlay}>
          <View style={style.modalContent}>
            <Text style={style.modalTitle}>Yetki Düzeyi Seçin</Text>
            <TouchableOpacity style={style.modalButton} onPress={() => handleOption('Admin')}>
              <Text>Yönetici</Text>
            </TouchableOpacity>
            <TouchableOpacity style={style.modalButton} onPress={() => handleOption('worker')}>
              <Text>Çalışan</Text>
            </TouchableOpacity>
            <TouchableOpacity style={style.modalButton} onPress={() => setModalVisible(false)}>
              <Text>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={userModalVisible}
        onRequestClose={() => setUserModalVisible(false)}
      >
        <View style={style.modalOverlay}>
          <View style={style.modalContent}>
            <Text style={style.modalTitle}>Kullanıcılar</Text>
            <ScrollView style={{ width: '100%' }}>
              {users.map((user) => (
                <View key={user.id} style={style.userContainer}>
                  <Text>{`${user.username} (${user.accountType})`}</Text>
                  <TouchableOpacity style={style.deleteButton} onPress={() => handleDeleteUser(user.id)}>
                    <Text>Sil</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={style.modalButton} onPress={() => setUserModalVisible(false)}>
              <Text>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={style.topAreaView}>
        <Text style={{ fontSize: 20, color: 'green' }}>Yeni Kullanıcı Oluştur</Text>
      </View>

      <View style={style.BottomAreaView}>
        <View>
          <Text>Kullanıcı Adı</Text>
          <TextInput style={style.inputStyle} value={username} onChangeText={setUsername} />
          <Text>Şifre</Text>
          <TextInput style={style.inputStyle} value={password} onChangeText={setPassword} />
        </View>
        <View style={{ width: '90%', paddingVertical: 20 }}>
          <Text>Oluşturulacak hesabın yetki düzeyini seçin</Text>
          <View style={{ flexDirection: 'row', paddingTop: 30, paddingBottom: 30, justifyContent: 'space-between' }}>
            <Text>{accountType ? `Seçilen Yetki: ${accountType}` : 'Yetki düzeyi seçilmedi'}</Text>
            <TouchableOpacity
              style={{ backgroundColor: 'red', alignItems: 'center', justifyContent: 'center', borderRadius: 5, padding: 10 }}
              onPress={() => setModalVisible(true)}
            >
              <Text style={{ color: 'white' }}>Yetki Düzeyi Seç</Text>
            </TouchableOpacity>
          </View>
          {error ? <Text style={style.errorText}>{error}</Text> : null}
          <TouchableOpacity
            style={{ backgroundColor: 'blue', alignItems: 'center', justifyContent: 'center', borderRadius: 5, padding: 10 }}
            onPress={handleSaveUser}
          >
            <Text style={{ color: 'white' }}>Kullanıcıyı Kaydet</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: 'gray', alignItems: 'center', justifyContent: 'center', borderRadius: 5, padding: 10, marginTop: 10 }}
            onPress={handleViewUsers}
          >
            <Text style={{ color: 'white' }}>Tüm Kullanıcıları Gör</Text>
          </TouchableOpacity>
        </View>
      </View>
      
    </SafeAreaView>
  );
}

const style = StyleSheet.create({
  safeStyle: {
    flex: 1,
  },
  topAreaView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  BottomAreaView: {
    padding: 5,
    margin: 10,
    flex: 9,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  inputStyle: {
    borderWidth: 1,
    borderRadius: 10,
    width: 300,
    marginBottom: 10,
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    width: '100%',
    alignItems: 'center',
  },
  userContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 5,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default NewWorker;
