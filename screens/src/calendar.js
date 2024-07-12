import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, FlatList, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../firebase-config';
import { acType, acId } from '../loginScreen';
import ColorInformation from './colorInformation';

const CalendarComponent = () => {
  const [selected, setSelected] = useState('');
  const [users, setUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [selectedTasks, setSelectedTasks] = useState([]);

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
          setUsers(usersArray);
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
    if (selectedUser) {
      const tasksRef = ref(db, '/tasks');
      onValue(tasksRef, snapshot => {
        const data = snapshot.val();
        if (data) {
          const userTasks = Object.keys(data)
            .map(key => ({ id: key, ...data[key] }))
            .filter(task => task.userIds.includes(selectedUser.id));

          let markedDatesObj = {};
          userTasks.forEach(task => {
            const startDate = new Date(task.startDate);
            const finishDate = new Date(task.finishDate);
            let currentDate = startDate;

            while (currentDate <= finishDate) {
              const dateString = currentDate.toISOString().split('T')[0];
              if (!markedDatesObj[dateString]) {
                markedDatesObj[dateString] = {
                  selected: true,
                  selectedColor: getTaskColor(task),
                  taskStatuses: [task.done],
                };
              } else {
                markedDatesObj[dateString].taskStatuses.push(task.done);
                markedDatesObj[dateString].selectedColor = getTaskColor(task);
              }
              currentDate.setDate(currentDate.getDate() + 1);
            }
          });

          setTasks(userTasks);
          setMarkedDates(markedDatesObj);
        } else {
          setTasks([]);
          setMarkedDates({});
        }
      });
    } else {
      setTasks([]);
      setMarkedDates({});
    }
  }, [selectedUser]);

  const getTaskColor = (task) => {
    const today = new Date().toISOString().split('T')[0];
    const taskFinishDate = new Date(task.finishDate).toISOString().split('T')[0];
  
    if (task.done && task.expired) {
      return 'green'; // expired:true && done:true ise yeşil
    } else if (task.done && !task.expired) {
      return 'blue'; // expired:false && done:true ise mavi
    } else if (!task.done && task.expired) {
      return 'red'; // expired:true && done:false ise kırmızı
    } else if (!task.done && !task.expired) {
      return 'gold'; // expired:false && done:false ise golden
    } else {
      return 'orange'; // Aynı gün birden fazla görev varsa turuncu
    }
  };

  const handleUserSelect = user => {
    if (acType === 'Admin' || user.id === acId) {
      setSelectedUser(user);
      setModalVisible(false);
    } else {
      alert("Diğer kullanıcıların takvimini görüntüleme yetkiniz yok.");
    }
  };

  const handleDayPress = day => {
    setSelected(day.dateString);
    const tasksForTheDay = tasks.filter(task => {
      const startDate = new Date(task.startDate);
      const finishDate = new Date(task.finishDate);
      const selectedDate = new Date(day.dateString);
      return selectedDate >= startDate && selectedDate <= finishDate;
    });
    setSelectedTasks(tasksForTheDay);
  };

  const renderTasks = () => {
    return selectedTasks.map(task => (
      <View key={task.id} style={styles.taskContainer}>
        <Text style={styles.taskTitle}>
          Görev Adı: <Text style={styles.taskText}>{task.text}</Text>
        </Text>
        <Text style={styles.taskTitle}>
          Atanan Kullanıcılar: <Text style={styles.taskText}>{task.userIds.map(userId => {
            const user = users.find(user => user.id === userId);
            return user ? user.username : 'Bilinmeyen Kullanıcı';
          }).join(', ')}</Text>
        </Text>
        <Text style={styles.taskTitle}>
          Durum: <Text style={[styles.taskText, { color: task.done ? 'green' : 'red' }]}>{task.done ? 'Tamamlandı' : 'Tamamlanmadı'}</Text>
        </Text>
        <Text style={styles.taskTitle}>
          Başlangıç Tarihi: <Text style={styles.taskText}>{task.startDate}</Text> - Bitiş Tarihi: <Text style={styles.taskText}>{task.finishDate}</Text>
        </Text>
      </View>
    ));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          setModalVisible(true);
        }}
      >
        <Text style={styles.buttonText}>Kullanıcı Seç</Text>
      </TouchableOpacity>

      <ColorInformation/>
      <Text style={styles.selectedText}>
        {selectedUser ? `Seçilen kullanıcı: ${selectedUser.username}` : 'Lütfen bir kullanıcı seçin'}
      </Text>
      <Calendar
        style={styles.calendar}
        onDayPress={handleDayPress}
        markedDates={{
          ...markedDates,
          [selected]: { selected: true, selectedColor: 'pink' },
        }}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kullanıcı Seç</Text>
            <FlatList
              data={users}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.userItem} onPress={() => handleUserSelect(item)}>
                  <Text style={styles.userText}>{item.username}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.tasksContainer}>
        {selectedTasks.length > 0 ? renderTasks() : <Text style={styles.noTasksText}>Görev bulunamadı.</Text>}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  selectedText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  calendar: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  userItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  userText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  tasksContainer: {
    flex: 1,
    marginTop: 20,
  },
  taskContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  taskTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  taskText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'normal',
  },
  noTasksText: {
    fontSize: 16,
    color: '#999',
    marginTop: 20,
  },
});

export default CalendarComponent;
