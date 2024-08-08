import React, { useState, useEffect } from 'react';
import { Button, Image, View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ref as refDB, onValue, update } from 'firebase/database';
import { storage } from './firebase-config';
import { ref, getDownloadURL, deleteObject, uploadBytesResumable } from 'firebase/storage';
import { acId, acName } from './loginScreen';
import { db } from './firebase-config';

export default function SettingsScreen() {
  const [image, setImage] = useState(null); // Kullanıcının seçtiği veya alınan resmin URI'sini tutar
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [users, setUsers] = useState([]);

  const getUsers = async () => {
    const usersRef = refDB(db, '/users');
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
        }));
        setUsers(usersArray);
        console.log(usersArray);
      }
    }, (error) => {
      console.error("Kullanıcı verileri alınamadı: ", error);
    });
  }

  // Profil resmini yükleme fonksiyonu
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      uploadImageToStorage(result.assets[0].uri);
    }
  };

  // Resmi Firebase Storage'a yükleme fonksiyonu
  const uploadImageToStorage = async (uri) => {
    setIsLoading(true);
    try {
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const blob = await response.blob();
      const fileName = `${acId}/profilepicture.jpg`; // acId ile dosya adı oluşturuldu
      const storageRef = ref(storage, `images/${fileName}`);

      // Eğer aynı isimde bir dosya varsa sil
      const existingImageRef = ref(storage, `images/${fileName}`);
      const existingImageSnapshot = await getDownloadURL(existingImageRef).catch(() => null);
      if (existingImageSnapshot) {
        await deleteObject(existingImageRef);
      }

      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.on('state_changed',
        (snapshot) => {
          // Yükleme ilerlemesi burada takip edilebilir
        },
        (error) => {
          console.error(error);
          setIsLoading(false);
          setStatus('Bir hata oluştu');
        },
        async () => {
          setIsLoading(false);
          setStatus('Resim başarıyla yüklendi');

          // İndirme URL'sini al ve kullanıcı arayüzünü güncelle
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('İndirme URL\'si:', downloadURL);
          setImage(downloadURL); // İndirme URL'si ile resim state'ini güncelle
        }
      );
    } catch (error) {
      console.error('Yükleme başarısız oldu:', error.message);
      setIsLoading(false);
      setStatus('Yükleme başarısız oldu');
    }
  };

  // Kullanıcı adını güncelleme fonksiyonu
  const updateUsername = async () => {
    // Kullanıcıyı bul
    const currentUser = users.find(u => u.id === acId);

    // Eğer kullanıcı id 1 ise işlem yapma
    if (currentUser && currentUser.id === '1') {
      alert('Bu hesabın kullanıcı adı değiştirilemez!');
      return;
    }

    // Yeni kullanıcı adı
    const newUsername = username.trim();

    // Eğer yeni kullanıcı adı boş ise işlem yapma
    if (!newUsername) {
      alert('Lütfen geçerli bir kullanıcı adı girin!');
      return;
    }

    // Eğer aynı kullanıcı adına sahip bir hesap varsa işlem yapma
    const existingUser = users.find(u => u.username.toLowerCase() === newUsername.toLowerCase());
    if (existingUser && existingUser.id !== acId) {
      alert('Bu kullanıcı adı zaten kullanılıyor!');
      return;
    }

    // Firebase'de kullanıcı adını güncelle
    try {
      const usernameRef = refDB(db, `/users/${acId}`);
      update(usernameRef, { username: username });
      setUsername(''); // Kullanıcı adı alanını temizle
      alert('Kullanıcı adı başarıyla güncellendi!');
    } catch (error) {
      console.error('Kullanıcı adı güncelleme hatası:', error.message);
      alert('Kullanıcı adı güncelleme sırasında bir hata oluştu!');
    }
  };

  // Biyografiyi güncelleme fonksiyonu
  const updateBio = () => {
    // Biyografi güncelleme işlemi burada gerçekleştirilecek
    console.log('Biyografi güncellendi:', bio);
  };

  // Bileşen yüklendiğinde mevcut profil resmini getir (useEffect)
  useEffect(() => {
    const getProfilePicture = async () => {
      const fileName = `${acId}/profilepicture.jpg`;
      const storageRef = ref(storage, `images/${fileName}`);

      try {
        const downloadURL = await getDownloadURL(storageRef);
        setImage(downloadURL); // Bulunduğunda resim state'ini güncelle
      } catch (error) {
        console.log('Profil resmi bulunamadı:', error);
        // Profil resmi bulunamazsa default resmi kullan
        const defaultStorageRef = ref(storage, '/default/profilepicture.jpg');
        const defaultDownloadURL = await getDownloadURL(defaultStorageRef);
        setImage(defaultDownloadURL);
      }
    };

    getUsers();
    getProfilePicture();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {isLoading && <ActivityIndicator size="large" style={styles.loadingIndicator} />}

      <View style={styles.profileSection}>
        {image && <Image source={{ uri: image }} style={styles.image} />}
        <Button title="Profil Fotoğrafını Değiştir" onPress={pickImage} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kullanıcı Adı</Text>
        <Text style={styles.currentUsername}>Mevcut kullanıcı adınız = {acName}</Text>
        <TextInput
          style={styles.input}
          placeholder="Yeni kullanıcı adınızı girin"
          value={username}
          onChangeText={setUsername}
        />
        <Button title="Değiştir" onPress={updateUsername} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Biyografi</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          multiline
          placeholder="Biyografinizi girin"
          value={bio}
          onChangeText={setBio}
        />
        <Button title="Kaydet" onPress={updateBio} />
      </View>

      {status !== '' && <Text>{status}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 10,
  },
  section: {
    marginBottom: 20,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  currentUsername: {
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    fontSize: 16,
  },
  loadingIndicator: {
    position: 'absolute',
    zIndex: 5,
    width: '100%',
    height: '100%',
  },
});
