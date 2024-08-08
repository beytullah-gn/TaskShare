import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Alert, TouchableOpacity } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { useCodeScanner } from 'react-native-vision-camera';
import fetchPersonById from '../Services/fetchPersonById';
import BottomBar from '../Components/BottomBar';
import Icon from 'react-native-vector-icons/Ionicons'; // İkon kütüphanesi
import { useFocusEffect } from '@react-navigation/native'; // Ekran odaklama hook'u

const QRCodeScannerScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const devices = useCameraDevices();
  const device = devices[0]; // Use the back camera by default
  const cameraRef = useRef(null);

  useEffect(() => {
    const getCameraPermission = async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    };

    getCameraPermission();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      // Kamera her odaklandığında kapalı olarak ayarlanır
      setIsCameraVisible(false);
    }, [])
  );

  const handleDepartments = () => {
    navigation.navigate('Departments');
  };

  const handleProfile = () => {
    navigation.navigate('MyProfile');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const handlePersons = () => {
    navigation.navigate("Persons");
  };

  const handleButtonPress = () => {
    setIsCameraVisible(true);
  };

  const handleCloseCamera = () => {
    setIsCameraVisible(false);
  };

  const handleScan = async (data) => {
    try {
      const person = await fetchPersonById(data);
      console.log(person);
      navigation.navigate("SelectedPerson", { person });
    } catch (error) {
      console.error("Error fetching person:", error);
    }
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: (codes) => {
      if (codes.length > 0) {
        const data = codes[0].value;
        setIsCameraVisible(false);
        Alert.alert('Tarama Sonucu', data, [
          {
            text: 'Tamam',
            onPress: () => handleScan(data),
          },
        ]);
      }
    },
  });

  if (!hasPermission) {
    return <Text>Kamera izni gereklidir.</Text>;
  }

  return (
    <View style={styles.container}>
      {!isCameraVisible ? (
        <TouchableOpacity style={styles.openButton} onPress={handleButtonPress}>
          <Text style={styles.openButtonText}>Kamerayı Aç</Text>
        </TouchableOpacity>
      ) : (
        <>
          <TouchableOpacity style={styles.closeButton} onPress={handleCloseCamera}>
            <Icon name="close-circle" size={30} color="#fff" />
          </TouchableOpacity>
          <View style={styles.cameraContainer}>
            {device && (
              <Camera
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={isCameraVisible}
                codeScanner={codeScanner}
                onInitialized={() => console.log('Kamera başlatıldı')}
                onError={(error) => console.error('Kamera hatası:', error)}
              />
            )}
          </View>
        </>
      )}
      <BottomBar
        onProfile={handleProfile}
        onDepartments={handleDepartments}
        onPersons={handlePersons}
        onSettings={handleSettings}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ADD8E6', // Beyaz arka plan
  },
  openButton: {
    backgroundColor: '#003366', // Yeşil arka plan
    padding: 15,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  openButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Yarı şeffaf arka plan
    borderRadius: 25,
    padding: 10,
    elevation: 5,
    zIndex: 1, // Butonun kamera görüntüsünün üzerinde görünmesini sağlar
  },
  cameraContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ddd', // Hafif gri kenarlık
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
});

export default QRCodeScannerScreen;
