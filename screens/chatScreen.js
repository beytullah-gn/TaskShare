import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image } from 'react-native';
import { ref, onChildAdded, push, remove, query, orderByChild } from 'firebase/database';
import { db, storage } from './firebase-config';
import { acId } from './loginScreen';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ref as refStorage, getDownloadURL } from 'firebase/storage';

function ChatScreen({ route }) {
  const { userId, username } = route.params; // Alıcı ID'sini ve kullanıcı adını al
  
  const [messages, setMessages] = useState([]); // Mesaj listesi
  const [messageText, setMessageText] = useState(''); // Mesaj metni
  const [recipientImage, setRecipientImage] = useState(null); // Alıcı profil fotoğrafı

  useEffect(() => {
    const messagesRef = query(ref(db, '/messages'), orderByChild('timestamp'));
    const unsubscribe = onChildAdded(messagesRef, snapshot => {
      const message = snapshot.val();
      if ((message.senderId === acId && message.recipientId === userId) || (message.senderId === userId && message.recipientId === acId)) {
        setMessages(prevMessages => [...prevMessages, { id: snapshot.key, ...message }]);
      }
    });

    return () => unsubscribe();
  }, [userId]);

  useEffect(() => {
    const fetchRecipientImage = async () => {
      try {
        const imageUrl = await getDownloadURL(refStorage(storage,`images/${userId}/profilepicture.jpg`));
        setRecipientImage(imageUrl);
      } catch (error) {
        console.error('Profil fotoğrafı getirme hatası:', error);
      }
    };

    fetchRecipientImage();
  }, [userId]);

  const sendMessage = () => {
    if (messageText.trim() === '') return; // Boş mesaj gönderme

    const newMessage = {
      message: messageText,
      senderId: acId,
      recipientId: userId,
      timestamp: new Date().toISOString(),
    };
    push(ref(db, '/messages'), newMessage)
      .then(() => {
        console.log('Mesaj gönderildi:', newMessage);
        setMessageText(''); // Mesaj alanını temizle
      })
      .catch(error => console.error('Mesaj gönderme hatası:', error));
  };

  const deleteMessage = (messageId) => {
    remove(ref(db, `/messages/${messageId}`))
      .then(() => {
        console.log('Mesaj silindi:', messageId);
        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId)); // Mesajı listeden çıkar
      })
      .catch(error => console.error('Mesaj silme hatası:', error));
  };

  return (
    <View style={styles.container}>
      {/* Başlık alanı */}
      <View style={styles.header}>
        {recipientImage ? (
          <Image source={{ uri: recipientImage }} style={styles.profileImage} />
        ) : (
          <Icon name="user" size={40} color="black" style={styles.profileIcon} />
        )}
        <Text style={styles.headerText}>{`Şuna gönder: ${username}`}</Text>
      </View>

      {/* Mesajlar gösterilecek alan */}
      <FlatList
        style={{ paddingHorizontal: 10 }}
        data={messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))} // Tarihsel olarak sıralama
        renderItem={({ item }) => (
          <View style={[
            styles.messageContainer,
            { alignSelf: item.senderId === acId ? 'flex-end' : 'flex-start' },
            { backgroundColor: item.senderId === acId ? '#e0ffe0' : '#ffffe0' } // Renkleri ayarla
          ]}>
            <Text style={styles.messageText}>{item.message}</Text>
            {item.senderId === acId && (
              <TouchableOpacity onPress={() => deleteMessage(item.id)} style={styles.deleteButton}>
                <Text>
                  <Icon name="trash" size={20} color="red" />
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* Mesaj gönderme alanı */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Mesajınızı buraya yazın..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Gönder</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: 'greenyellow',
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: 'lightgray',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'navy',
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    position: 'relative',
  },
  messageText: {
    fontSize: 16,
    marginRight: 40, // Silme düğmesi ile metin arasında mesafe
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: 'blue',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ChatScreen;
