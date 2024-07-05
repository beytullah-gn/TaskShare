import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableOpacity, View, StyleSheet, Text, ScrollView, TextInput, Alert, Modal, FlatList, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { acType } from '../loginScreen';


const storeData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error(`Error saving ${key}`, e);
  }
};

const getData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error(`Error reading ${key}`, e);
    return [];
  }
};

function MyTasks() {
  const [tasks, setTasks] = useState([]); // Görevlerin tutulduğu liste
  const [taskText, setTaskText] = useState(''); // Yeni görev metni
  const [editingIndex, setEditingIndex] = useState(-1); // Düzenleme modundaki görevin index'i

  const [users, setUsers] = useState([]); // Kullanıcıların listesi
  const [selectedUserId, setSelectedUserId] = useState(null); // Seçilen kullanıcının ID'si

  const [modalVisible, setModalVisible] = useState(false); // Modal görünürlüğü

  // Kullanıcı verilerini okuyan fonksiyon
  const getUsers = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@users');
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error("Kullanıcı verileri alınamadı: ", e);
      return [];
    }
  };

  // Görev ekleme işlemi
  const addTask = () => {
    if (acType === 'Admin') {
      if (taskText.trim() !== '' && selectedUserId !== null) {
        const newTask = { text: taskText, color: 'red', userId: selectedUserId };
        const newList = [...tasks, newTask];
        setTasks(newList);
        setTaskText('');
        setSelectedUserId(null);
        storeData('my-key', newList); // Verileri anahtarla kaydet
      } else {
        Alert.alert('Eksik Bilgi', 'Lütfen görev metni ve kullanıcı seçimi yapınız!');
      }
    } else {
      Alert.alert('Yetki Hatası', 'Görev ekleme yetkiniz yok!');
    }
  };

  // Görev silme işlemi
  const removeTask = (index) => {
    if (acType === 'Admin') {
      const newList = tasks.filter((_, taskIndex) => taskIndex !== index);
      setTasks(newList);
      storeData('my-key', newList); // Verileri anahtarla kaydet
    } else {
      Alert.alert('Yetki Hatası', 'Görev silme yetkiniz yok!');
    }
  };

  // Tüm görevleri silme işlemi
  const removeAllTasks = async () => {
    if (acType === 'Admin') {
      try {
        await AsyncStorage.removeItem('my-key');
        setTasks([]);
      } catch (e) {
        console.error("Error removing value", e);
      }
    } else {
      Alert.alert('Yetki Hatası', 'Tüm görevleri silme yetkiniz yok!');
    }
  };

  // Görevin rengini değiştirme işlemi
  const toggleTaskColor = (index) => {
    const newList = tasks.map((task, taskIndex) => {
      if (taskIndex === index) {
        return { ...task, color: task.color === 'red' ? 'green' : 'red' };
      }
      return task;
    });
    setTasks(newList);
    storeData('my-key', newList); // Verileri anahtarla kaydet
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
  const finishEditingTask = (index, newText) => {
    const newList = tasks.map((task, taskIndex) => {
      if (taskIndex === index) {
        return { ...task, text: newText };
      }
      return task;
    });
    setTasks(newList);
    storeData('my-key', newList); // Verileri anahtarla kaydet
    setEditingIndex(-1); // Düzenleme modunu sonlandır
  };

  // Kayıtlı görevleri ve kullanıcıları getirme işlemi
  const getValues = async () => {
    
    const storedTasks = await getData('my-key');
    setTasks(storedTasks);
    const storedUsers = await getUsers();
    setUsers(storedUsers);
    console.log("Görevler:", storedTasks);
  };

  useEffect(() => {
    
    getValues();
    
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
        {tasks.length > 0 && tasks.map((task, index) => (
          <View key={index} style={styles.taskContainer}>
            {editingIndex === index ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.editInput}
                  value={taskText}
                  onChangeText={setTaskText}
                  autoFocus
                />
                <TouchableOpacity onPress={() => finishEditingTask(index, taskText)} style={styles.editButton}>
                  <Text style={styles.editButtonText}>Onayla</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={[styles.taskText, { color: task.color }]}>{index + 1} - {task.text}</Text>
                <View style={styles.buttonsContainer}>
                  <TouchableOpacity onPress={() => toggleTaskColor(index)} style={styles.taskButton}>
                    <Icon name="check" size={20} color="black" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => startEditingTask(index)} style={styles.taskButton}>
                    <Icon name="edit" size={20} color="black" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeTask(index)} style={styles.taskButton}>
                    <Icon name="trash" size={20} color="black" />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        ))}

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
    paddingHorizontal: 10,
    marginRight: 10,
  },
  editButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },
  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  selectUserButton: {
    marginTop: 10,
    backgroundColor: 'lightblue',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  selectUserButtonText: {
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
    fontWeight: 'bold',
    fontSize: 18,
  },
  userItem: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default MyTasks;

