import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import CheckBox from 'expo-checkbox';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  ref,
  onValue,
  push,
  update,
  remove,
} from 'firebase/database';
import { db } from '../firebase-config.js';
import DateTimePicker from 'react-native-modal-datetime-picker';

function SelectedTask({ navigation, route }) {
  const { taskId } = route.params;
  
  const [task, setTask] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [taskText, setTaskText] = useState('');
  const [editingIndex, setEditingIndex] = useState(-1);
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [subtaskAssignments, setSubtaskAssignments] = useState({});
  const [editingSubtaskId, setEditingSubtaskId] = useState(null);

  useEffect(() => {
    const taskRef = ref(db, `/tasks/${taskId}`);
    onValue(taskRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTask(data);
        if (data.subtasks) {
          const subtasksArray = Object.keys(data.subtasks)
            .map((key) => ({
              id: key,
              ...data.subtasks[key],
            }))
            .sort((a, b) => a.priority - b.priority);
          setSubtasks(subtasksArray);
  
          // Fetch user assignments for each subtask
          const assignments = {};
          subtasksArray.forEach((subtask) => {
            if (subtask.userIds) {
              const assignedUsers = users.filter((user) =>
                subtask.userIds.includes(user.id)
              );
              assignments[subtask.id] = assignedUsers;
            }
          });
          setSubtaskAssignments(assignments);
        }
      }
    });
  
    getUsers();
  }, []);

  // Açılacak modali ve atanmış kullanıcıları ayarlamak için
const openUserEditModal = (subtask) => {
  setSelectedUserIds(subtask.userIds || []);
  setEditingSubtaskId(subtask.id);
  setModalVisible(true);
};

// Seçili kullanıcıları kaydetmek için
const saveUserEditModal = () => {
  if (editingSubtaskId) {
    const subtaskRef = ref(db, `/tasks/${taskId}/subtasks/${editingSubtaskId}`);
    update(subtaskRef, { userIds: selectedUserIds })
      .then(() => {
        setModalVisible(false);
        setEditingSubtaskId(null);
        setSelectedUserIds([]);
      })
      .catch((error) => console.error('Kullanıcı güncelleme hatası:', error));
  }
};




  const getUsers = async () => {
    const usersRef = ref(db, '/users');
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setUsers(usersArray);
      }
    });
  };

  const addSubtask = () => {
    if (!taskText) {
      Alert.alert('Hata', 'Alt görev metni boş olamaz.');
      return;
    }
    if (!selectedStartDate || !selectedDate) {
      Alert.alert('Hata', 'Başlangıç ve bitiş tarihi seçmelisiniz.');
      return;
    }
    if (selectedUserIds.length === 0) {
      Alert.alert('Hata', 'En az bir kullanıcı seçmelisiniz.');
      return;
    }
  
    const newSubtask = {
      text: taskText,
      done: false,
      priority: false,
      completionTime: "null",
      startDate: selectedStartDate.toISOString().split('T')[0], // Yıl/Ay/Gün olarak kaydet
      finishDate: selectedDate.toISOString().split('T')[0], // Yıl/Ay/Gün olarak kaydet
      userIds: selectedUserIds,
      color:'red',
      expired:false,
    };
  
    const subtaskRef = ref(db, `/tasks/${taskId}/subtasks`);
    push(subtaskRef, newSubtask)
      .then(() => {
        setTaskText('');
        setSelectedStartDate(null); // Seçili tarihleri sıfırla
        setSelectedDate(null); // Seçili tarihleri sıfırla
        setSelectedUserIds([]); // Seçili kullanıcıları sıfırla
      })
      .catch((error) =>
        console.error('Alt görev ekleme hatası:', error)
      );
  };

  const removeSubtask = (subtaskId) => {
    const subtaskRef = ref(db, `/tasks/${taskId}/subtasks/${subtaskId}`);
    remove(subtaskRef)
      .catch((error) =>
        console.error('Alt görev silme hatası:', error)
      );
  };

  const toggleSubtaskDone = (subtaskId, currentDone) => {
    const newDone = !currentDone;
    const newColor = newDone ? 'green' : 'red';
    const subtaskRef = ref(db, `/tasks/${taskId}/subtasks/${subtaskId}`);
    update(subtaskRef, { done: newDone, color: newColor })
      .catch((error) =>
        console.error('Alt görev tamamlama durumu güncelleme hatası:', error)
      );
  };

  const startEditingSubtask = (index) => {
    setEditingIndex(index);
    setTaskText(subtasks[index].text);
  };

  const finishEditingSubtask = (subtaskId, newText) => {
    const subtaskRef = ref(db, `/tasks/${taskId}/subtasks/${subtaskId}`);
    update(subtaskRef, { text: newText });
    setEditingIndex(-1);
  };

// Kullanıcı seçimlerini güncellemek için
const toggleUserSelection = (userId) => {
  if (selectedUserIds.includes(userId)) {
    setSelectedUserIds(selectedUserIds.filter(id => id !== userId));
  } else {
    setSelectedUserIds([...selectedUserIds, userId]);
  }
};

  const handleStartDateSelect = (selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      if (task && selectedDate > new Date(task.finishDate)) {
        Alert.alert('Hata', 'Başlangıç tarihi ana görevin bitiş tarihinden sonra olamaz.');
      } else if (selectedDate < new Date(task.startDate)) {
        Alert.alert('Hata', 'Başlangıç tarihi ana görevin başlangıç tarihinden önce olamaz.');
      } else {
        setSelectedStartDate(selectedDate);
        console.log('Seçilen Başlangıç Tarihi:', selectedDate);
  
        // Ana görevin başlangıç tarihini güncelle
        const taskStartDateRef = ref(db, `/tasks/${taskId}/startDate`);
        update(taskStartDateRef, selectedDate.toISOString());
      }
    }
  };
  
  const handleDateSelect = (selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      if (selectedDate < selectedStartDate) {
        Alert.alert('Hata', 'Bitiş tarihi başlangıç tarihinden önce olamaz.');
      } else if (task && selectedDate > new Date(task.finishDate)) {
        Alert.alert('Hata', 'Bitiş tarihi ana görevin bitiş tarihinden sonra olamaz.');
      } else {
        setSelectedDate(selectedDate);
        console.log('Seçilen Bitiş Tarihi:', selectedDate);
  
        // Ana görevin bitiş tarihini güncelle
        const taskFinishDateRef = ref(db, `/tasks/${taskId}/finishDate`);
        update(taskFinishDateRef, selectedDate.toISOString());
      }
    }
  };
  
  const renderSelectedDates = () => {
    return (
      <View>
        {selectedStartDate && (
          <Text>Başlangıç Tarihi Seçildi: {selectedStartDate.toLocaleDateString()}</Text>
        )}
        {selectedDate && (
          <Text>Bitiş Tarihi Seçildi: {selectedDate.toLocaleDateString()}</Text>
        )}
      </View>
    );
  };
//Alt görevlerin listelendiği yer
const renderSubtasks = () => {
  return subtasks.map((subtask, index) => (
    <View key={subtask.id} style={styles.subtaskContainer}>
      <TouchableOpacity onPress={() => toggleSubtaskDone(subtask.id, subtask.done)} style={{flex:1}}>
        <CheckBox
          value={subtask.done}
          onValueChange={() => toggleSubtaskDone(subtask.id, subtask.done)}
          color={subtask.done ? 'green' : undefined} // Checkbox işaretli ise yeşil olur
        />
      </TouchableOpacity>
      <View style={{flex:7}}>
        <View style={styles.userContainer}>
          <Text style={[styles.userText, { textDecorationLine: subtask.done ? 'line-through' : 'none' }]}>
            {subtask.text}
          </Text>
          <Text style={styles.dateText}>
            Başlangıç Tarihi: <Text style={{color:'gray'}}>{subtask.startDate}</Text>
          </Text>
          <Text style={styles.dateText}>
            Bitiş Tarihi: <Text style={{color:'gray'}}>{subtask.finishDate}</Text>
          </Text>
          <Text style={styles.dateText}>
            Atanan Kullanıcılar: <Text style={{color:'gray'}}>{subtask.userIds.map(userId => users.find(user => user.id === userId)?.username).join(', ')}</Text>
          </Text>
          <View style={{flexDirection:'row'}}>
            <TouchableOpacity
              style={{backgroundColor:'gold',borderRadius:15,height:30,justifyContent:'center',alignItems:'center',marginVertical:7,}}
              onPress={() => openUserEditModal(subtask)}
            >
              <Text style={{color:'blue'}}>    Atanan kullanıcıları düzenle    </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{backgroundColor:'gold',marginHorizontal:12,borderRadius:5,height:30,justifyContent:'center',alignItems:'center',marginVertical:7,}}
              onPress={() => openUserEditModal(subtask)}
            >
              <Text style={{color:'blue'}}>Onayla</Text>
            </TouchableOpacity>

          </View>
          
        </View>
        <View>
        {index === editingIndex && (
          <View style={styles.editSubtaskContainer}>
            <TextInput
              style={styles.editSubtaskInput}
              value={taskText}
              onChangeText={setTaskText}
            />
            <TouchableOpacity
              style={styles.saveSubtaskButton}
              onPress={() => finishEditingSubtask(subtask.id, taskText)}
            >
              <Text style={styles.saveSubtaskButtonText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        )}
        </View>
      </View>
      
      <View style={{flex:1,flexDirection:'row'}}>
        <TouchableOpacity
          style={styles.deleteSubtaskButton}
          onPress={() => removeSubtask(subtask.id)}
        >
          <Icon name="trash" size={20} color="red" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editSubtaskButton}
          onPress={() => startEditingSubtask(index)}
        >
          <Icon name="edit" size={20} color="blue" />
        </TouchableOpacity>
      </View>
    </View>
  ));
};

// Modalı render etmek için
const renderModal = () => {
  // Sadece ana görevin atanmış kullanıcılarını filtreliyoruz
  const assignedUsers = users.filter(user => task.userIds.includes(user.id));

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Kullanıcıları Seç</Text>
          <FlatList
            data={assignedUsers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.userListItem}>
                <CheckBox
                  style={styles.checkbox}
                  value={selectedUserIds.includes(item.id)}
                  onValueChange={() => toggleUserSelection(item.id)}
                />
                <Text style={styles.modalText}>{item.username}</Text>
              </View>
            )}
          />
          <TouchableOpacity
            style={styles.modalButton}
            onPress={saveUserEditModal}
          >
            <Text style={styles.modalButtonText}>Kaydet</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.modalButtonText}>Kapat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topContainer}>
        <Text style={styles.taskText}>
          Görev: {task ? task.text : ''}
        </Text>
        <View style={styles.userContainer}>
          <Text style={styles.userText}>
            Atanan Kullanıcılar: {task ? task.userIds.map(userId => users.find(user => user.id === userId)?.username).join(', ') : ''}
          </Text>
        </View>
        <Text style={styles.dateText}>
          Başlangıç Tarihi: {task ? task.startDate : ''}
        </Text>
        <Text style={styles.dateText}>
          Bitiş Tarihi: {task ? task.finishDate : ''}
        </Text>
        <TouchableOpacity
          style={styles.selectUserButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.selectUserButtonText}>Kullanıcı Seç</Text>
        </TouchableOpacity>
        {selectedUserIds.length > 0 && (
          <View style={styles.selectedUserContainer}>
            <Text style={styles.selectedUserText}>
              Seçilen Kullanıcılar: {selectedUserIds.map(userId => users.find(user => user.id === userId)?.username).join(', ')}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.subtasksContainer}>
        <Text style={styles.subtasksTitle}>Alt Görevler</Text>
        {renderSubtasks()}
        <View style={styles.addSubtaskContainer}>
          <TextInput
            style={styles.addSubtaskInput}
            placeholder="Alt görev ekle..."
            value={taskText}
            onChangeText={setTaskText}
          />
          <TouchableOpacity
            style={styles.addSubtaskButton}
            onPress={addSubtask}
          >
            <Text style={styles.addSubtaskButtonText}>Ekle</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.dateSelectionContainer}>
        <TouchableOpacity
          style={styles.dateSelectButton}
          onPress={() => setShowStartDatePicker(true)}
        >
          <Text style={styles.dateSelectButtonText}>Başlangıç Tarihi Seç</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dateSelectButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateSelectButtonText}>Bitiş Tarihi Seç</Text>
        </TouchableOpacity>
        {renderSelectedDates()}
        {showStartDatePicker && (
          <DateTimePicker
            isVisible={showStartDatePicker}
            date={selectedStartDate || new Date()}
            mode="date"
            onConfirm={handleStartDateSelect}
            onCancel={() => setShowStartDatePicker(false)}
            minimumDate={task && new Date(task.startDate)}
            maximumDate={task && new Date(task.finishDate)}
          />
          
        )}
        {showDatePicker && (
          <DateTimePicker
            isVisible={showDatePicker}
            date={selectedDate || new Date()}
            mode="date"
            onConfirm={handleDateSelect}
            onCancel={() => setShowDatePicker(false)}
            minimumDate={task && new Date(task.startDate)}
            maximumDate={task && new Date(task.finishDate)}
          />
        )}
      </View>
      {renderModal()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  topContainer: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
  taskText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  userContainer: {
    marginBottom: 10,
  },
  userText: {
    fontSize: 16,
    
  },
  dateText: {
    fontSize: 16,
    
  },
  selectUserButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  selectUserButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  selectedUserContainer: {
    marginTop: 10,
  },
  selectedUserText: {
    fontSize: 16,
  },
  subtasksContainer: {
    marginBottom: 20,
  },
  subtasksTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtaskContainer: {
    flex:1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'space-between',
    marginBottom: 5,
  },
  subtaskText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  deleteSubtaskButton: {
    marginLeft: 5,
  },
  editSubtaskButton: {
    marginLeft: 5,
  },
  editSubtaskContainer: {
    marginHorizontal:20,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  editSubtaskInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 5,
    marginRight: 5,
  },
  saveSubtaskButton: {
    backgroundColor: '#28a745',
    padding: 5,
    borderRadius: 5,
  },
  saveSubtaskButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  addSubtaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  addSubtaskInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 5,
    marginRight: 5,
  },
  addSubtaskButton: {
    backgroundColor: '#007bff',
    padding: 5,
    borderRadius: 5,
  },
  addSubtaskButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dateSelectionContainer: {
    marginTop: 20,
  },
  dateSelectButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  dateSelectButtonText: {
    color: '#fff',
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
    borderRadius: 10,
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
  modalTitle: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  userListItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: 10,
  },
  modalButton: {
    backgroundColor: '#007bff',
    borderRadius: 5,
    padding: 10,
    elevation: 2,
    marginTop: 10,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SelectedTask;
