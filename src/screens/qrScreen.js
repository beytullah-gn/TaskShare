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
    return (
      <View style={styles.container}>
        <Text>Kamera izni gereklidir.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!isCameraVisible ? (
        <>
          <TouchableOpacity style={styles.openButton} onPress={handleButtonPress}>
            <Text style={styles.openButtonText}>Kamerayı Aç</Text>
          </TouchableOpacity>
          <Text style={styles.descriptionText}>QR kodu okutmak için kamerayı açın</Text>
        </>
      ) : (
        <>
          <View style={styles.cameraContainer}>
            {device && (
              <Camera
                ref={cameraRef}
                style={styles.camera}
                device={device}
                isActive={isCameraVisible}
                codeScanner={codeScanner}
                onInitialized={() => console.log('Kamera başlatıldı')}
                onError={(error) => console.error('Kamera hatası:', error)}
              />
            )}
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={handleCloseCamera}>
            <Text style={styles.closeButtonText}>Kamerayı Kapat</Text>
          </TouchableOpacity>
        </>
      )}
      <BottomBar
        onProfile={handleProfile}
        onDepartments={handleDepartments}
        onPersons={handlePersons}
        onSettings={handleSettings}
        activePage="qr"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#dfe3ee',
  },
  openButton: {
    backgroundColor: '#3b5998',
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
  descriptionText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  cameraContainer: {
    width: '80%',
    aspectRatio: 1, // Kamera kutusunun kare olmasını sağlar
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20, // Kameranın altında boşluk bırakır
  },
  camera: {
    flex: 1,
  },
  closeButton: {
    backgroundColor: '#3b5998',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default QRCodeScannerScreen;
