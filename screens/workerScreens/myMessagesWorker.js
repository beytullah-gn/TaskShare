import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Button, FlatList, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { ref, onValue, off } from 'firebase/database';
import { db, storage } from '../firebase-config';
import { acId, acType } from '../loginScreen';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ref as refStorage, getDownloadURL } from 'firebase/storage';

function MyMessagesWorker({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [images, setImages] = useState({});

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

  useEffect(() => {
    const fetchProfileImages = async () => {
      const imageUrls = {};
      await Promise.all(users.map(async user => {
        try {
          const imageUrl = await getDownloadURL(refStorage(storage, `images/${user.id}/profilepicture.jpg`));
          imageUrls[user.id] = imageUrl;
        } catch (error) {
          console.log(`Profil fotoğrafı bulunamayan kullanıcı için varsayılan fotoğraf kullanılıyor: ${user.id}`);
          imageUrls[user.id] = await getDownloadURL(refStorage(storage, '/default/profilepicture.jpg'));
        }
      }));
      setImages(imageUrls);
    };

    fetchProfileImages();

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
      {images[item.id] ? (
        <Image source={{ uri: images[item.id] }} style={styles.profileImage} />
      ) : (
        <Icon name="user" size={40} color="black" />
      )}
      <View style={styles.userTextContainer}>
        <Text style={styles.userName}>{item.username.toUpperCase()}</Text>
        
      </View>
    </TouchableOpacity>
  );

  const handleAdminAction = () => {
    console.log('Admin butonu tıklandı');
    navigation.navigate('Şifre Talepleri');
  };

  return (
    <View style={styles.container}>
      <FlatList
        style={{ width: '100%', padding: 10 }}
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
                  <View style={styles.userTextContainer}>
                    {images[item.id] ? (
                      <Image source={{ uri: images[item.id] }} style={styles.profileImage} />
                      ) : (
                      <Icon name="user" size={40} color="black" />
                    )}
                    <Text style={styles.modalUserName}>{item.username.toUpperCase()}</Text>
                    
                  </View>
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
    right: '50%',
    transform: [{ translateX: 30 }],
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
    right: 20,
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
    paddingHorizontal: 20,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  userTextContainer: {
    alignItems:'center',
    width:'80%',
    marginLeft: 10,
    flexDirection:'row',
  },
  userName: {
    fontSize: 18,
    paddingHorizontal: 20,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  userId: {
    fontSize: 12,
    color: 'gray',
  },
  flatListContainer: {
    flexGrow: 1,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'gray',
  },
  
});

export default MyMessagesWorker;
