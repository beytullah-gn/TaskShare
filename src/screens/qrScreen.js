import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const QRCodeScannerScreen = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const devices = useCameraDevices();
  const device = devices.back;

  useEffect(() => {
    (async () => {
      const result = await request(PERMISSIONS.ANDROID.CAMERA);
      console.log('İzin sonucu:', result);
      if (result === RESULTS.GRANTED) {
        setHasPermission(true);
      } else {
        alert('Kamera izni verilmedi.');
      }
    })();
  }, []);

  useEffect(() => {
    console.log('Cihazlar:', devices);
    console.log('Seçilen cihaz:', device);
  }, [devices]);

  const handleQRCodeDetected = (event) => {
    alert(`QR Kod Verisi: ${event.nativeEvent.codeStringValue}`);
  };

  if (!devices || !device) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      {hasPermission ? (
        <Camera
          style={styles.camera}
          onBarcodeScanned={handleQRCodeDetected}
          device={device}
          isActive={true}
        />
      ) : (
        <Text>Kamera izni verilmedi.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
});

export default QRCodeScannerScreen;
