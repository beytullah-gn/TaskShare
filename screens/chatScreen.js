import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { ref, onChildAdded, push, remove, query, orderByChild } from 'firebase/database';
import { db } from './firebase-config';
import { acId } from './loginScreen';
import Icon from 'react-native-vector-icons/FontAwesome';

function ChatScreen({ route }) {
  const { userId, username } = route.params; // Alıcı ID'sini ve kullanıcı adını al
  
  const [messages, setMessages] = useState([]); // Mesaj listesi
  const [messageText, setMessageText] = useState(''); // Mesaj metni

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
        <Text style={styles.headerText}>Şuna gönder : {username}</Text>
      </View>

      {/* Mesajlar gösterilecek alan */}
      <FlatList
        style={{paddingHorizontal:10}}
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
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor:'greenyellow',
    alignItems:'flex-start',
    marginBottom:20,
  
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal:15,
    color:"navy"
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
