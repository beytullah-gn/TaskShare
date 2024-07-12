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
  const [lastMessages, setLastMessages] = useState({}); // State to hold last messages for each user

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
          const lastMessagesData = {};

          Object.values(data).forEach(message => {
            const { senderId, recipientId, timestamp, text, seen } = message;

            // Only include messages where current user is either sender or recipient
            if (senderId === acId || recipientId === acId) {
              const otherUserId = senderId === acId ? recipientId : senderId;

              if (!lastMessagesData[otherUserId] || timestamp > lastMessagesData[otherUserId].timestamp) {
                lastMessagesData[otherUserId] = { message, timestamp, seen };
              }
            }
          });

          const lastMessagesArray = Object.keys(lastMessagesData).map(userId => ({
            id: userId,
            ...lastMessagesData[userId],
          }));

          setConversations(lastMessagesArray.map(message => ({
            id: message.id,
            username: users.find(user => user.id === message.id)?.username || 'Unknown User',
          })));
          setLastMessages(lastMessagesData);
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
  const textLenght = (text) => {
    if (text.length > 100) {
        return text.substring(0, 100) + '...';
    } else {
        return text;
    }
};

  const closeModal = () => {
    setModalVisible(false);
  };

  const navigateToChat = (userId, username) => {
    setModalVisible(false);
    navigation.navigate('Sohbet', { userId, username });
  };

  const isAdmin = acType === 'Admin';

  const renderItem = ({ item }) => {
    const user = users.find(user => user.id === item.id);
    if (!user || !lastMessages[item.id]) {
      return null;
    }

    const isCurrentUserSender = lastMessages[item.id].message.senderId === acId;
    const isRecipientCurrentUser = lastMessages[item.id].message.recipientId === acId;

    // Check if the current user has sent or received messages with this user
    if (!isCurrentUserSender && !isRecipientCurrentUser) {
      return null;
    }

    return (
      <TouchableOpacity style={styles.userItem} onPress={() => navigateToChat(item.id, user.username)}>
        {images[item.id] ? (
          <Image source={{ uri: images[item.id] }} style={styles.profileImage} />
        ) : (
          <Icon name="user" size={40} color="black" />
        )}
        <View style={styles.userTextContainer}>
          
          
          
            <View style={{flexDirection:'column'}}>
              <Text style={styles.userName}>{user.username.toUpperCase()}</Text>
              <Text style={{paddingTop:5}}>{textLenght(lastMessages[item.id].message.message)}</Text>
              <Text style={styles.lastMessage}>{lastMessages[item.id].message.text}</Text>
            
            
            
            {/* Check if the recipient is the current user and the message is unseen */}
              {isRecipientCurrentUser && !lastMessages[item.id].message.seen && (
                <View style={{ position: 'absolute', top: 0, right: 0 }}>
                  <Icon name="exclamation-circle" size={20} color="red" />
                </View>
              )}

              {isCurrentUserSender && (
                <Text style={lastMessages[item.id].message.seen ? styles.seenText : styles.unseenText}>
                  {lastMessages[item.id].message.seen ? 'Seen' : 'Unseen'}
                </Text>
              )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
                  onPress={() => navigateToChat(item.id,item.username)}
                >
                  <View style={styles.userTextContainer}>
                    {images[item.id] ? (
                      <Image source={{ uri: images[item.id] }} style={styles.profileImage} />
                      ) : (
                      <Icon name="user" size={40} color="black" />
                    )}
                    <Text style={styles.modalUserName}>{item.username.toUpperCase()}</Text>
                    {lastMessages[item.id] && (
                      <>
                        <Text style={styles.lastMessage}>{lastMessages[item.id].message.text}</Text>
                        
                      </>
                    )}
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
    backgroundColor: '#f0f0f0',
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    elevation: 5,
    
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  userTextContainer: {
    alignItems:'center',
    width:'80%',
    marginLeft: 10,
    flexDirection:'row',
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
    
  },
  lastMessage: {
    color: '#666',
    
    
  },
  seenText: {
    color: 'green',
    marginLeft: 5, // Adjust as needed
  },
  unseenText: {
    color: 'red',
    marginLeft: 5, // Adjust as needed
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'gray',
  },
  modalUserName: {
    fontSize: 16,
    marginLeft: 10,
  },
  flatListContainer: {
    flexGrow: 1,
  },
});

export default MyMessagesWorker;
