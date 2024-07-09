import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { ref, onValue, remove } from 'firebase/database';
import { db } from '../firebase-config.js';

function PasswordRequest() {
  const [requests, setRequests] = useState([]);

  // Firebase'den şifre sıfırlama isteklerini okuma
  useEffect(() => {
    const requestsRef = ref(db, '/passwordRequests');
    onValue(requestsRef, snapshot => {
      const data = snapshot.val();
      if (data) {
        const requestsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
          formattedTime: formatTimestamp(data[key].timestamp), // Saat formatını ekliyoruz
        }));
        setRequests(requestsArray);
      } else {
        setRequests([]);
      }
    });
  }, []);

  // Timestamp'i UTC saat formatına çeviren işlev
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false, // 24 saatlik format için
      timeZone: 'UTC'
    };
    return date.toLocaleString('en-US', options); // UTC saat formatına getiriyoruz
  };

  // Şifre sıfırlama isteğini silme işlemi
  const removeRequest = (id) => {
    const requestRef = ref(db, `/passwordRequests/${id}`);
    remove(requestRef)
      .then(() => {
        setRequests(requests.filter(request => request.id !== id));
        Alert.alert('Başarılı', 'Şifre sıfırlama isteği silindi.');
      })
      .catch(error => {
        console.error('Şifre sıfırlama isteği silme hatası:', error);
        Alert.alert('Hata', 'Şifre sıfırlama isteği silinemedi. Lütfen tekrar deneyin.');
      });
  };

  // Liste öğesi render işlevi
  const renderRequestItem = ({ item }) => (
    <View style={styles.requestContainer}>
      <Text style={styles.requestText}>Mesaj: {item.message}</Text>
      <Text style={styles.requestText}>Gönderilme Zamanı (UTC): {item.formattedTime}</Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => removeRequest(item.id)}
      >
        <Text style={styles.deleteButtonText}>Sil</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        keyExtractor={item => item.id}
        renderItem={renderRequestItem}
        ListEmptyComponent={<Text style={styles.emptyListText}>Şifre sıfırlama isteği bulunamadı.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  requestContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  requestText: {
    fontSize: 16,
    marginBottom: 5,
  },
  deleteButton: {
    alignSelf: 'flex-end',
    backgroundColor: 'red',
    padding: 8,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyListText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default PasswordRequest;
