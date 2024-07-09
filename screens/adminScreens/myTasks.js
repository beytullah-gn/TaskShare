import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, StyleSheet, Text, ScrollView, TextInput, Alert, Modal, FlatList, SafeAreaView } from 'react-native';
import CheckBox from 'expo-checkbox';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ref, onValue, push, update, remove } from 'firebase/database';
import { db } from '../firebase-config.js';
import { acType } from '../loginScreen';

function MyTasks() {
  const [tasks, setTasks] = useState([]); // Görevlerin tutulduğu liste
  const [taskText, setTaskText] = useState(''); // Yeni görev metni
  const [editingIndex, setEditingIndex] = useState(-1); // Düzenleme modundaki görevin index'i
  const [users, setUsers] = useState([]); // Kullanıcıların listesi
  const [selectedUserId, setSelectedUserId] = useState(null); // Seçilen kullanıcının ID'si
  const [modalVisible, setModalVisible] = useState(false); // Modal görünürlüğü

  // Kullanıcı verilerini okuyan fonksiyon
  const getUsers = async () => {
    const usersRef = ref(db, '/users');
    onValue(usersRef, snapshot => {
      const data = snapshot.val();
      if (data) {
        const usersArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
        }));
        setUsers(usersArray);
      }
    });
  };

  // Görevleri okuyan fonksiyon
  const getTasks = () => {
    const tasksRef = ref(db, '/tasks');
    onValue(tasksRef, snapshot => {
      const data = snapshot.val();
      if (data) {
        const tasksArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
        }));
        setTasks(tasksArray);
      }
    });
  };

  // Görev ekleme işlemi
  const addTask = () => {
    if (acType === 'Admin') {
      if (taskText.trim() !== '' && selectedUserId !== null) {
        const newTask = {
          text: taskText,
          color: 'red',
          userId: selectedUserId,
          done: false,
        };
        push(ref(db, '/tasks'), newTask);
        setTaskText('');
        setSelectedUserId(null);
      } else {
        Alert.alert('Eksik Bilgi', 'Lütfen görev metni ve kullanıcı seçimi yapınız!');
      }
    } else {
      Alert.alert('Yetki Hatası', 'Görev ekleme yetkiniz yok!');
    }
  };

  // Görev silme işlemi
const removeTask = (id) => {
  if (acType === 'Admin') {
    const taskRef = ref(db, `/tasks/${id}`);
    remove(taskRef)
      .then(() => {
        // Görev Firebase'den silindiğinde görev listesini güncelle
        setTasks(tasks.filter(task => task.id !== id));
      })
      .catch(error => console.error('Görev silme hatası:', error));
  } else {
    Alert.alert('Yetki Hatası', 'Görev silme yetkiniz yok!');
  }
};

  // Tüm görevleri silme işlemi
  const removeAllTasks = () => {
    if (acType === 'Admin') {
      const tasksRef = ref(db, '/tasks');
      remove(tasksRef);
      setTasks([]); // Tüm görevler silindikten sonra görev listesini temizle
    } else {
      Alert.alert('Yetki Hatası', 'Tüm görevleri silme yetkiniz yok!');
    }
  };

  // Görevin rengini ve tamamlanma durumunu değiştirme işlemi
    const toggleTaskColor = (id, currentColor, currentDone) => {
    const newColor = currentColor === 'red' ? 'green' : 'red';
    const newDone = !currentDone;
    const taskRef = ref(db, `/tasks/${id}`);
    update(taskRef, { color: newColor, done: newDone })
      .then(() => console.log('Görev rengi ve tamamlanma durumu güncellendi'))
      .catch(error => console.error('Görev rengi ve tamamlanma durumu güncelleme hatası:', error));
  };
  // Görev düzenleme işlemine başlama
  const startEditingTask = (index) => {
    if (acType === 'Admin') {
      setEditingIndex(index);
      setTaskText(tasks[index].text); // Düzenlenecek görevin metnini set et
    } else {
      Alert.alert('Yetki Hatası', 'Görevleri düzenleme yetkiniz yok!');
    }
  };

  // Görev düzenleme işlemi tamamlama
  const finishEditingTask = (id, newText) => {
    const taskRef = ref(db, `/tasks/${id}`);
    update(taskRef, { text: newText });
    setEditingIndex(-1); // Düzenleme modunu sonlandır
  };

  useEffect(() => {
    getTasks();
    getUsers();
  }, []);

  // Kullanıcı seçim modal'ı
  const renderUserPicker = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(false);
      }}
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
                onPress={() => {
                  setSelectedUserId(item.id);
                  setModalVisible(false);
                }}
              >
                <Text>{item.username}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              setModalVisible(false);
            }}
          >
            <Text style={styles.closeButtonText}>Kapat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput
        style={styles.input}
        value={taskText}
        placeholder="Görev"
        onChangeText={setTaskText}
      />

      {/* Kullanıcı seçimi butonu */}
      <TouchableOpacity style={styles.selectUserButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.selectUserButtonText}>Kullanıcı Seç</Text>
      </TouchableOpacity>

      {/* Görev ekleme ve temizleme işlemleri */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
        <TouchableOpacity style={styles.touchableStyle} onPress={addTask}>
          <Icon name="plus" size={30} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.touchableStyle} onPress={removeAllTasks}>
          <Icon name="remove" size={30} color="black" />
        </TouchableOpacity>
      </View>

      {/* Görev listesi */}
      {tasks.length > 0 ? (
        tasks.map((task, index) => (
          <View key={task.id} style={styles.taskContainer}>
            {editingIndex === index ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.editInput}
                  value={taskText}
                  onChangeText={setTaskText}
                  autoFocus
                />
                <TouchableOpacity onPress={() => finishEditingTask(task.id, taskText)} style={styles.editButton}>
                  <Text style={styles.editButtonText}>Onayla</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <CheckBox
                  onValueChange={() => toggleTaskColor(task.id, task.color, task.done)}
                  value={task.color === 'green'}
                />
                <Text style={[styles.taskText, { color: task.color }]}>
                  {index + 1} - {task.text}
                </Text>
                <View style={styles.buttonsContainer}>
                  <TouchableOpacity onPress={() => startEditingTask(index)} style={styles.taskButton}>
                    <Icon name="edit" size={20} color="black" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeTask(task.id)} style={styles.taskButton}>
                    <Icon name="trash" size={20} color="black" />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        ))
      ) : (
        <Text>Görev yok</Text>
      )}

      {/* Kullanıcı seçim modal'ı */}
      {renderUserPicker()}
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    width: '100%',
  },
  taskContainer: {
    width: '100%',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskText: {
    fontSize: 18,
    flex: 1,
  },
  touchableStyle: {
    width: 80,
    alignItems: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskButton: {
    marginLeft: 10,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  editInput: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginRight: 10,
    paddingHorizontal: 10,
  },
  editButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
  },
  editButtonText: {
    color: 'white',
  },
  selectUserButton: {
    backgroundColor: '#DDDDDD',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  selectUserButtonText: {
    fontSize: 18,
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
  userItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  closeButton: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default MyTasks;
