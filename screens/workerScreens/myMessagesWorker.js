import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Button, FlatList } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../firebase-config';
import { acId, acType } from '../loginScreen';
import Icon from 'react-native-vector-icons/FontAwesome';

function MyMessagesWorker({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const fetchUsers = () => {
      const usersRef = ref(db, '/users');
      onValue(usersRef, snapshot => {
        const data = snapshot.val();
        if (data) {
          const usersArray = Object.keys(data).map(key => ({
            id: key,
            ...data[key],
          }));
          setUsers(usersArray.filter(user => user.id !== acId));
        }
        
      });
    };

    fetchUsers();

    return () => {
      const usersRef = ref(db, '/users');
      off(usersRef);
    };
  }, []);

  useEffect(() => {
    const fetchConversations = () => {
      const messagesRef = ref(db, '/messages');
      onValue(messagesRef, snapshot => {
        const data = snapshot.val();
        if (data) {
          const conversationUsers = new Set();
          Object.values(data).forEach(message => {
            if (message.senderId === acId) {
              conversationUsers.add(message.recipientId);
            } else if (message.recipientId === acId) {
              conversationUsers.add(message.senderId);
            }
          });
          const conversationUsersArray = Array.from(conversationUsers).map(userId => users.find(user => user.id === userId)).filter(Boolean);
          setConversations(conversationUsersArray);
        }
      });
    };

    fetchConversations();

    return () => {
      const messagesRef = ref(db, '/messages');
      off(messagesRef);
    };
  }, [users]);

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const navigateToChat = (userId, username) => {
    setModalVisible(false);
    navigation.navigate('Sohbet', { userId, username });
  };
  

  const isAdmin = acType === 'Admin';

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.userItem} onPress={() => navigateToChat(item.id, item.username)}>
      <Text style={styles.userName}>{item.username.toUpperCase()}</Text>
    </TouchableOpacity>
  );

  const handleAdminAction = () => {
    // Admin butonu için işlemler buraya eklenebilir
    console.log('Admin butonu tıklandı');
    navigation.navigate('Şifre Talepleri');
  };

  return (
    <View style={styles.container}>
      <FlatList
        style={{width:'100%',padding:10}}
        data={conversations}
        keyExtractor={item => item.id}
        renderItem={renderItem}
      />

      <TouchableOpacity style={styles.addButton} onPress={openModal}>
        <FontAwesome name="plus" size={24} color="white" />
      </TouchableOpacity>

      {isAdmin && (
        <TouchableOpacity style={styles.adminButton} onPress={handleAdminAction}>
          <Icon name="info" size={20} color="black" />
        </TouchableOpacity>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Kullanıcı Seç</Text>
            <FlatList
              data={users}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.userItem}
                  onPress={() => navigateToChat(item.id)}
                >
                  <Text style={styles.modalUserName}>{item.username.toUpperCase()}</Text>
                </TouchableOpacity>
              )}
            />
            <Button title="Kapat" onPress={closeModal} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: '50%', // Ekranın ortasında
    transform: [{ translateX: 30 }], // Sağa kaydırma
    backgroundColor: 'blue',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  adminButton: {
    position: 'absolute',
    bottom: 20,
    right: 20, // En sağ alt köşe
    backgroundColor: 'green',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  adminButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
  },
  modalUserName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  userItem: {
    width: '100%',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  flatListContainer: {
    flexGrow: 1,  // Ekran boyunca genişlemesini sağlamak için flexGrow kullanın
  },
});

export default MyMessagesWorker;
