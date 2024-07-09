import React, { useState, useEffect } from "react";
import { StyleSheet, SafeAreaView, Text, TextInput, View, TouchableOpacity, Modal, Alert, ScrollView } from "react-native";
import { ref, onValue, push, remove } from 'firebase/database';
import { db } from "../firebase-config";

function NewWorker() {
  const [modalVisible, setModalVisible] = useState(false);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState('');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const usersRef = ref(db, '/users');
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      const loadedUsers = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setUsers(loadedUsers);
    });
  }, []);

  const handleOption = (type) => {
    setAccountType(type);
    setModalVisible(false);
  };

  const handleSaveUser = async () => {
    if (!username || !password || !accountType) {
      setError("Lütfen tüm alanları doldurun ve yetki düzeyi seçin.");
      return;
    }

    // Check if username already exists
    const usernameExists = users.some(user => user.username === username);
    if (usernameExists) {
      setError("Bu kullanıcı adı zaten mevcut.");
      return;
    }

    const newUser = {
      username: username,
      password: password,
      accountType: accountType,
    };
    try {
      const usersRef = ref(db, '/users');
      await push(usersRef, newUser);
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
    setUserModalVisible(true);
  };

  const handleDeleteUser = async (userId) => {
    if (userId === '1') {
      Alert.alert("Hata", "Bu kullanıcı silinemez.");
      return;
    }

    try {
      const userRef = ref(db, `/users/${userId}`);
      await remove(userRef);
      console.log("Kullanıcı başarıyla silindi.");
    } catch (e) {
      console.error("Kullanıcı silinemedi: ", e);
    }
  };

  return (
    <SafeAreaView style={styles.safeStyle}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Yetki Düzeyi Seçin</Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => handleOption('Admin')}>
              <Text>Yönetici</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={() => handleOption('worker')}>
              <Text>Çalışan</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kullanıcılar</Text>
            <ScrollView style={{ width: '100%' }}>
              {users.map((user) => (
                <View key={user.id} style={styles.userContainer}>
                  <Text>{`${user.username} (${user.accountType})`}</Text>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteUser(user.id)}>
                    <Text>Sil</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalButton} onPress={() => setUserModalVisible(false)}>
              <Text>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.topAreaView}>
        <Text style={{ fontSize: 20, color: 'green' }}>Yeni Kullanıcı Oluştur</Text>
      </View>

      <View style={styles.BottomAreaView}>
        <View>
          <Text>Kullanıcı Adı</Text>
          <TextInput style={styles.inputStyle} value={username} onChangeText={setUsername} />
          <Text>Şifre</Text>
          <TextInput style={styles.inputStyle} value={password} onChangeText={setPassword} secureTextEntry />
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
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
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

const styles = StyleSheet.create({
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
