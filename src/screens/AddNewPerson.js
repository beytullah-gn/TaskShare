import React, { useState } from "react";
import { SafeAreaView, Text, StyleSheet, View, TextInput, Button, Alert, ScrollView, Image } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { auth, db, storage } from "../Services/firebase-config"; // Add storage import
import { ref, set, push } from "firebase/database";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref as sref,uploadBytes, getDownloadURL } from "firebase/storage"; 
import { Picker } from "@react-native-picker/picker";


const AddNewPersonScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [accountType, setAccountType] = useState('Employee');
  const [address, setAddress] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [birthday, setBirthday] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [tcNumber, setTcNumber] = useState('');
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null); 
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const handleAddPerson = async () => {
    if (!email || !password || !name || !surname) {
      Alert.alert('Hata', 'E-posta, şifre, ad ve soyad alanları boş bırakılamaz.');
      return;
    }
  
    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
      return;
    }
  
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Hata', 'Geçerli bir e-posta adresi girin.');
      return;
    }
  
    try {
      setIsButtonDisabled(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
  
      const personRef = push(ref(db, 'Persons'));
      const personId = personRef.key;
  
      let imageUrl = null;
  
      if (image) {
        const imageName = `${userId}`;
        const storageRef = sref(storage, `ProfilePictures/${imageName}`);
        const img = await fetch(image);
        const bytes = await img.blob();
        await uploadBytes(storageRef, bytes);
        imageUrl = await getDownloadURL(storageRef);
        console.log(imageUrl); // URL'yi kontrol edin
      }
  
      await set(ref(db, `Users/${userId}`), {
        EMail: email,
        UserId: userId,
        PersonId: personId,
      });
  
      await set(personRef, {
        AccountType: accountType,
        Address: address,
        BirthPlace: birthPlace,
        Birthday: birthday,
        Name: name,
        PersonId: personId,
        PhoneNumber: phoneNumber,
        Surname: surname,
        TcNumber: tcNumber,
        ProfilePictureUrl: imageUrl // Kayıt için doğru URL
      });
  
      setEmail('');
      setPassword('');
      setName('');
      setSurname('');
      setAddress('');
      setBirthPlace('');
      setBirthday('');
      setPhoneNumber('');
      setTcNumber('');
      setImage(null);
      setImageUrl(null);
  
      Alert.alert('Başarılı', 'Kullanıcı başarıyla eklendi!');
  
      setTimeout(() => setIsButtonDisabled(false), 5000);
    } catch (error) {
      console.log("Error adding user: ", error);
      let errorMessage = 'Kullanıcı eklenirken bir hata oluştu.';
  
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Bu e-posta adresi zaten kullanımda.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Şifre çok zayıf.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Geçersiz e-posta adresi.';
      }
  
      Alert.alert('Hata', errorMessage);
      setIsButtonDisabled(false);
    }
  };
  

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Kameraya erişim izni gerekli!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      console.log("Fotoğraf seçildi:", result.assets[0].uri);
    } else {
      console.log("Fotoğraf seçilmedi.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.form}>
          <Text style={styles.title}>Yeni Kullanıcı Ekle</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="E-posta"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Şifre"
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ad"
          />
          <TextInput
            style={styles.input}
            value={surname}
            onChangeText={setSurname}
            placeholder="Soyad"
          />
          <Picker
            selectedValue={accountType}
            style={styles.picker}
            onValueChange={(itemValue) => setAccountType(itemValue)}
          >
            <Picker.Item label="Çalışan" value="Employee" />
            <Picker.Item label="Müşteri" value="Client" />
          </Picker>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="Adres"
          />
          <TextInput
            style={styles.input}
            value={birthPlace}
            onChangeText={setBirthPlace}
            placeholder="Doğum Yeri"
          />
          <TextInput
            style={styles.input}
            value={birthday}
            onChangeText={setBirthday}
            placeholder="Doğum Tarihi"
          />
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Telefon Numarası"
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            value={tcNumber}
            onChangeText={setTcNumber}
            placeholder="TC Kimlik Numarası"
            keyboardType="number-pad"
          />
          <View style={styles.imagePickerContainer}>
            <Button title="Fotoğraf Seç" onPress={pickImage} color="#003366" />
            {image && (
              <View style={styles.imageContainer}>
                <Text style={styles.imageLabel}>Seçilen fotoğraf:</Text>
                <Image source={{ uri: image }} style={styles.image} />
              </View>
            )}
          </View>
          <View style={styles.buttonContainer}>
            <Button 
              title="Ekle" 
              onPress={handleAddPerson} 
              color="#003366" 
              disabled={isButtonDisabled} 
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f9',
    padding: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  imagePickerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#003366',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  buttonContainer: {
    marginTop: 20,
    borderRadius: 6,
    overflow: 'hidden',
  },
});

export default AddNewPersonScreen;
