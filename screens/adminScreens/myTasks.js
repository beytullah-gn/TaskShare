import React, { useEffect, useState } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  TextInput,
  Alert,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import CheckBox from 'expo-checkbox'; // Expo'nun checkbox bileşeni
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  ref,
  onValue,
  push,
  update,
  remove,
} from 'firebase/database'; // Firebase Realtime Database fonksiyonları
import { db } from '../firebase-config.js'; // Firebase bağlantı yapılandırması
import { acType } from '../loginScreen'; // Kullanıcı türü import ediliyor
import DatePicker from '@react-native-community/datetimepicker'; // Tarih seçim bileşeni

function MyTasks({ navigation }) {
  const [tasks, setTasks] = useState([]); // Görevler state'i
  const [taskText, setTaskText] = useState(''); // Görev metni state'i
  const [editingIndex, setEditingIndex] = useState(-1); // Düzenleme index'i state'i
  const [users, setUsers] = useState([]); // Kullanıcılar state'i
  const [selectedUserIds, setSelectedUserIds] = useState([]); // Seçilen kullanıcı id'leri state'i
  const [modalVisible, setModalVisible] = useState(false); // Modal görünürlük state'i
  const [selectedDate, setSelectedDate] = useState(new Date()); // Seçilen tarih state'i
  const [showDatePicker, setShowDatePicker] = useState(false); // Tarih seçim bileşeni görünürlük state'i
  const [selectedStartDate, setSelectedStartDate] = useState(new Date()); // Seçilen başlangıç tarihi state'i
  const [showStartDatePicker, setShowStartDatePicker] = useState(false); // Başlangıç tarih seçim bileşeni görünürlük state'i
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedEditStartDate,setSelectedEditStartDate] = useState(new Date());//seçilen düzenlenmiş başlangıç tarihi
  const [showEditStartDatePicker,setShowEditStartDatePicker] =useState(false); // BAŞLANGIÇ TARİHİ DÜZENLEME GÖRÜNÜRLÜK
  const [selectedEditFinishDate,setSelectedEditFinishDate]=useState(new Date());
  const [selectedDateID,setSelectedDateID]=useState([]);
  const [showEditFinishDatePicker, setShowEditFinishDatePicker] = useState(false); // Bitiş tarihi düzenleme görünürlük

  
  const renderEditFinishDatePicker = () => {
    if (showEditFinishDatePicker) {
      return (
        <DatePicker
          value={selectedEditFinishDate}
          mode="date"
          display="default"
          minimumDate={selectedEditStartDate}
          onChange={handleEditFinishDateSelect}
        />
      );
    }
    return null;
  };

  const handleEditFinishDateSelect = (event, selectedDate) => {
    setShowEditFinishDatePicker(false); // Bitiş tarih seçim bileşenini kapat
  
    if (event.type === 'set' && selectedDate) {
      if (selectedDate < selectedEditStartDate) {
        Alert.alert('Hata', 'Bitiş tarihi başlangıç tarihinden önce olamaz.');
      } else {
        setSelectedEditFinishDate(selectedDate); // Seçilen bitiş tarihini state'e ata
        console.log('Seçilen Bitiş Tarihi:', selectedDate); // Konsola seçilen tarihi yazdır
        updateFinishDate(selectedDateID, selectedDate); // Bitiş tarihini güncelle
      }
    }
  };
    
  const updateFinishDate = (taskId, Date) => {
    const taskRef = ref(db, `/tasks/${taskId}`);
    const finishDate = Date.toISOString().split('T')[0];
    update(taskRef, { finishDate })
      .then(() => console.log('Görevin bitiş zamanı güncellendi:', finishDate))
      .catch((error) => console.error('Görevin bitiş zamanını güncelleme hatası:', error));
  };

  const changeFinishTime = (taskFinishTime, selectedID, taskStartTime) => {
    setSelectedEditFinishDate(new Date(taskFinishTime));
    setSelectedEditStartDate(new Date(taskStartTime));
    setSelectedDateID(selectedID);
    setShowEditFinishDatePicker(true);
  };
    

  const handleStartDateSelect = (event, selectedDate) => {
    setShowStartDatePicker(false); // Başlangıç tarih seçim bileşenini kapat
    
    if (event.type === 'set' && selectedDate) {
      const today = new Date();
      if (selectedDate < today) {
        Alert.alert('Başlangıç Tarihi', 'Başlangıç tarihini bugünün tarihi ya da öncesi için seçmek istiyor musunuz?', [
          {
            text: 'Hayır',
            onPress: () => console.log('Başlangıç tarihi seçme iptal edildi'),
            style: 'cancel',
          },
          {text: 'Evet', onPress: () => {
            setSelectedStartDate(selectedDate); // Seçilen başlangıç tarihini state'e ata
            console.log('Seçilen Başlangıç Tarihi:', selectedDate); // Konsola seçilen tarihi yazdır
          }},
        ]);
      } else {
        setSelectedStartDate(selectedDate); // Seçilen başlangıç tarihini state'e ata
        console.log('Seçilen Başlangıç Tarihi:', selectedDate); // Konsola seçilen tarihi yazdır
      }
    }
  };
  
  const renderStartDatePicker = () => {
    if (showStartDatePicker) {
      return (
        <DatePicker
          value={selectedStartDate}
          mode="date"
          display="default"
          maximumDate={selectedDate}
          onChange={handleStartDateSelect}
        />
      );
    }
    return null;
  };


  const renderEditStartDatePicker = () => {
    if (showEditStartDatePicker) {
      return (
        <DatePicker
          value={selectedEditStartDate}
          mode="date"
          display="default"
          maximumDate={selectedEditFinishDate}
          onChange={handleEditStartDateSelect}
        />
      );
    }
    return null;
  };

  const handleEditStartDateSelect = (event, selectedDate) => {
    setShowEditStartDatePicker(false); // Başlangıç tarih seçim bileşenini kapat
    
    if (event.type === 'set' && selectedDate) {
      const today = new Date();
      if (selectedDate < today) {
        Alert.alert(
          'Başlangıç Tarihi',
          'Başlangıç tarihini bugünün tarihi ya da öncesi için seçmek istiyor musunuz?',
          [
            {
              text: 'Hayır',
              onPress: () => console.log('Başlangıç tarihi seçme iptal edildi'),
              style: 'cancel',
            },
            {
              text: 'Evet',
              onPress: () => {
                setSelectedEditStartDate(selectedDate); // Seçilen başlangıç tarihini state'e ata
                console.log('Seçilen Başlangıç Tarihi:', selectedDate); // Konsola seçilen tarihi yazdır
                updateStartDate(selectedDateID, selectedDate); // Update the start date
              },
            },
          ]
        );
      } else {
        setSelectedEditStartDate(selectedDate); // Seçilen başlangıç tarihini state'e ata
        console.log('Seçilen Başlangıç Tarihi:', selectedDate); // Konsola seçilen tarihi yazdır
        updateStartDate(selectedDateID, selectedDate); // Update the start date
      }
    }
  };
  


const openEditModal = (taskId) => {
  setSelectedTaskId(taskId);
  setEditModalVisible(true);
};

const confirmTaskFinished=(taskId)=>{
  Alert.alert('Görevin tamamlandığını onayla', 'Görevin tamamlandığını onaylamak istiyor musunuz?', [
    {
      text: 'Hayır',
      onPress: () => console.log('Görev onay işlemi iptal edildi'),
      style: 'cancel',
    },
    {text: 'Evet', onPress: () => {okPressed(taskId)}},
  ]);
};

const okPressed = (id) => {
  const taskRef = ref(db, `/tasks/${id}`);

  onValue(taskRef, (snapshot) => {
    const taskData = snapshot.val();
    if (taskData && taskData.done) {
      update(taskRef, { expired: true }) // expired'i güncelle
        .then(() =>
          console.log('Görev expired durumu güncellendi')
        )
        .catch((error) =>
          console.error('Görev expired durumu güncelleme hatası:', error)
        );
    } else {
      console.log('Görev tamamlanmamış.');
    }
  }, {
    onlyOnce: true
  });
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

  const getTasks = () => {
    const tasksRef = ref(db, '/tasks');
    onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const tasksArray = Object.keys(data)
          .map((key) => ({
            id: key,
            ...data[key],
          }))
          .filter((task) => !task.expired) // Sadece expired: false olanları al
          .sort((a, b) => new Date(a.finishDate) - new Date(b.finishDate)); // Bitiş tarihine göre sırala
        setTasks(tasksArray);
        //console.log(tasksArray)
      }
    });
  };
  
  

  const addTask = () => {
    if (acType === 'Admin') {
      if (taskText.trim() !== '' && selectedUserIds.length > 0) {
        const newTask = {
          text: taskText,
          color: 'red',
          userIds: selectedUserIds,
          done: false,
          startDate: selectedStartDate.toISOString().split('T')[0], // Başlangıç tarihini ekledik
          finishDate: selectedDate.toISOString().split('T')[0],
          expired: false,
          priority:false,
          completionTime:"null",

        };
        push(ref(db, '/tasks'), newTask)
          .then(() => {
            setTaskText('');
            setSelectedUserIds([]);
          })
          .catch((error) =>
            console.error('Görev ekleme hatası:', error)
          );
      } else {
        Alert.alert('Eksik Bilgi', 'Lütfen görev metni ve kullanıcı seçimi yapınız!');
      }
    } else {
      Alert.alert('Yetki Hatası', 'Görev ekleme yetkiniz yok!');
    }
  };
  

  const removeTask = (id) => {
    if (acType === 'Admin') {
      const taskRef = ref(db, `/tasks/${id}`);
      remove(taskRef)
        .then(() => {
          setTasks(tasks.filter((task) => task.id !== id));
        })
        .catch((error) => console.error('Görev silme hatası:', error));
    } else {
      Alert.alert('Yetki Hatası', 'Görev silme yetkiniz yok!');
    }
  };

  const removeAllTasks = () => {
    if (acType === 'Admin') {
      const tasksToRemove = tasks.filter(task => !task.expired); // Sadece expired: false olan görevleri filtrele
      tasksToRemove.forEach(task => {
        const taskRef = ref(db, `/tasks/${task.id}`);
        remove(taskRef)
          .then(() => {
            setTasks(prevTasks => prevTasks.filter(prevTask => prevTask.id !== task.id));
          })
          .catch((error) => console.error('Görev silme hatası:', error));
      });
    } else {
      Alert.alert('Yetki Hatası', 'Tüm görevleri silme yetkiniz yok!');
    }
  };
  

  const toggleTaskColor = (id, currentColor, currentDone) => {
    const newColor = currentColor === 'red' ? 'green' : 'red';
    const newDone = !currentDone;
  
    const taskRef = ref(db, `/tasks/${id}`);
    update(taskRef, { color: newColor, done: newDone,}) 
      .then(() =>
        console.log('Görev rengi, tamamlanma durumu ve expired durumu güncellendi')
      )
      .catch((error) =>
        console.error('Görev rengi, tamamlanma durumu ve expired durumu güncelleme hatası:', error)
      );
  };
  const navigateToTask = (taskId) => {
    console.log("secilen id ",taskId)
   
    navigation.navigate('Seçilen Görev', { taskId });
  };


  const startEditingTask = (index) => {
    if (acType === 'Admin') {
      setEditingIndex(index);
      setTaskText(tasks[index].text);
    } else {
      Alert.alert('Yetki Hatası', 'Görevleri düzenleme yetkiniz yok!');
    }
  };

  const finishEditingTask = (id, newText) => {
    const taskRef = ref(db, `/tasks/${id}`);
    update(taskRef, { text: newText });
    setEditingIndex(-1);
  };

  useEffect(() => {
    getTasks();
    getUsers();
  }, []);

  const renderUserNames = (userIds) => {
    const userNames = userIds.map((id) => {
      const user = users.find((user) => user.id === id);
      return user ? user.username : null;
    }).filter((username) => username !== null);
  
    return (
      <Text style={styles.userName}>
        {userNames.join(', ')}
      </Text>
    );
  };

  const renderEditModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={editModalVisible}
      onRequestClose={() => setEditModalVisible(false)}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Atanan Kullanıcıları Düzenle</Text>
          <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.userItem}>
                <CheckBox
                  style={{ margin: 10 }}
                  value={tasks.find((task) => task.id === selectedTaskId)?.userIds.includes(item.id)}
                  onValueChange={(newValue) => {
                    const taskIndex = tasks.findIndex((task) => task.id === selectedTaskId);
                    if (newValue) {
                      const updatedUserIds = [...tasks[taskIndex].userIds, item.id];
                      updateAssignedUsers(selectedTaskId, updatedUserIds);
                    } else {
                      const updatedUserIds = tasks[taskIndex].userIds.filter((id) => id !== item.id);
                      updateAssignedUsers(selectedTaskId, updatedUserIds);
                    }
                  }}
                />
                <Text>{item.username}</Text>
              </View>
            )}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setEditModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Kapat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const updateStartDate = (taskId, Date) => {
    const taskRef = ref(db, `/tasks/${taskId}`);
    startDate = Date.toISOString().split('T')[0];
    update(taskRef, { startDate })
      .then(() => console.log('Görevin başlangıç zamanı güncellendi:', startDate))
      .catch((error) => console.error('Görevin başlangıç zamanını güncelleme hatası:', error));
  };

  const updateAssignedUsers = (taskId, updatedUserIds) => {
    if (updatedUserIds.length === 0) {
      Alert.alert('Hata', 'En az bir kullanıcı seçilmelidir.');
      return;
    }
  
    const taskRef = ref(db, `/tasks/${taskId}`);
    update(taskRef, { userIds: updatedUserIds })
      .then(() => console.log('Atanan kullanıcılar güncellendi'))
      .catch((error) => console.error('Atanan kullanıcıları güncelleme hatası:', error));
  };
  

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
            keyExtractor={(item) => item.id} // Benzersiz key olarak item.id kullanılıyor
            renderItem={({ item }) => (
              <View style={styles.userItem}>
                <CheckBox
                  style={{ margin: 10 }}
                  value={selectedUserIds.includes(item.id)}
                  onValueChange={(newValue) => {
                    if (newValue) {
                      setSelectedUserIds((prev) => [...prev, item.id]);
                    } else {
                      setSelectedUserIds((prev) =>
                        prev.filter((id) => id !== item.id)
                      );
                    }
                  }}
                />
                <Text>{item.username}</Text>
              </View>
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


  const handleDateSelect = (event, selectedDate) => {
    setShowDatePicker(false); // Bitiş tarih seçim bileşenini kapat
    if (selectedDate) {
      if (selectedStartDate && selectedDate < selectedStartDate) {
        Alert.alert('Hata', 'Bitiş tarihi başlangıç tarihinden önce olamaz.');
      } else {
        setSelectedDate(selectedDate); // Seçilen tarihi state'e ata
        console.log('Seçilen Tarih:', selectedDate); // Konsola seçilen tarihi yazdır
      }
    }
  };

  const setCompletionTime = (id,currentdone) => {
    const newDone = !currentdone;
    const today = new Date();
    const completionTime = newDone ? today.toISOString().split('T')[0] : 'null' ; // YYYY-MM-DD formatında bugünün tarihi
  
    const taskRef = ref(db, `/tasks/${id}`);
    update(taskRef, { completionTime })
      .then(() => console.log('Görevin tamamlanma zamanı güncellendi:', completionTime))
      .catch((error) => console.error('Görevin tamamlanma zamanını güncelleme hatası:', error));
  };

  const renderDatePicker = () => {
    if (showDatePicker) {
      return (
        <DatePicker
          value={selectedDate}
          mode="date"
          display="default"
          minimumDate={selectedStartDate || new Date()} // minimumDate'i başlangıç tarihine göre ayarla
          onChange={handleDateSelect}
        />
      );
    }
    return null;
  };

  const changeStartTime = (taskStartTime, selectedID, taskFinishTime) => {
    setSelectedEditStartDate(new Date(taskStartTime));
    setSelectedEditFinishDate(new Date(taskFinishTime));
    setSelectedDateID(selectedID);
    setShowEditStartDatePicker(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topContainer}>
        <TextInput
          style={styles.input}
          value={taskText}
          placeholder="Görev"
          onChangeText={setTaskText}
        />
        <View style={styles.userSelectionContainer}>
          <TouchableOpacity style={styles.addButton} onPress={addTask}>
            <Text style={styles.addButtonText}>Görev Ekle</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.selectUserButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.selectUserButtonText}>Kullanıcı Seç</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.expiredButton}
            onPress={()=>{navigation.navigate("Arşiv")}}
          >
            <Text style={styles.selectUserButtonText}>Arşiv</Text>
          </TouchableOpacity>
          
        </View>
        {selectedUserIds.length > 0 && (
            <View style={styles.selectedUserContainer}>
              <Text style={styles.selectedUserText}>
                Seçilen kullanıcılar:{' '}
                {selectedUserIds
                  .map(
                    (id) =>
                      users.find((user) => user.id === id)?.username
                  )
                  .join(', ')}
              </Text>
            </View>
          )}
        
        <TouchableOpacity
          style={styles.dateSelectButton}
          onPress={() => setShowStartDatePicker(true)}
        >
          <Text style={styles.selectUserButtonText}>Başlangıç Tarihi Seç</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dateSelectButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.selectUserButtonText}>Bitiş Tarihi Seç</Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom:20,
        }}
      >
        <View style={{flexDirection:'column'}}>
          <Text style={{ fontSize: 20, marginRight: 10 }}>
            Seçilen Başlangıç Tarihi:
          </Text>
          <Text style={{ fontSize: 20 }}>
            {selectedStartDate.toISOString().split('T')[0]}
          </Text>
          <Text style={{ fontSize: 20, marginRight: 10 }}>
            Seçilen Bitiş Tarihi:
          </Text>
          <Text style={{ fontSize: 20 }}>
            {selectedDate.toISOString().split('T')[0]}
          </Text>
        </View>
      </View>

      {renderDatePicker()}

      

      {tasks.map((task, index) => (
        <TouchableOpacity key={task.id} onPress={() => navigateToTask(task.id)}>
          <View style={styles.taskContainer}>
            <View style={{flexDirection:'row'}}>
            <View style={styles.taskDetails}>
              <Text style={[styles.taskText, { color: task.color }]}>
                {task.text}
              </Text>
              <Text style={styles.taskUsers}>
                Atanan Kullanıcılar: <Text style={{color:'gray',fontWeight:'normal'}}>{renderUserNames(task.userIds)}</Text>
              </Text>
              <Text style={styles.taskDate}>
                Başlangıç Tarihi: <Text style={{color:'gray',fontWeight:'normal'}}>{task.startDate}</Text>
              </Text>
              <Text style={styles.taskDate}>
                Bitiş Tarihi: <Text style={{color:'gray',fontWeight:'normal'}}>{task.finishDate}</Text>
              </Text>
              <TouchableOpacity
                style={{ backgroundColor: 'gold', borderRadius: 15, height: 30, justifyContent: 'center', alignItems: 'center', marginVertical: 7 }}
                onPress={() => openEditModal(task.id)}
              >
                <Text>Atanan Kullanıcıları Düzenle</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ backgroundColor: 'gold', borderRadius: 15, height: 30, justifyContent: 'center', alignItems: 'center', marginVertical: 7 }}
                onPress={() => confirmTaskFinished(task.id)}
              >
                <Text>Görevin Bittiğini Onayla</Text>
              </TouchableOpacity>
              
              {index === editingIndex && (
                <View style={styles.editInputContainer}>
                  <TextInput
                    style={styles.editInput}
                    value={taskText}
                    onChangeText={setTaskText}
                  />
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={() => finishEditingTask(task.id, taskText)}
                  >
                    <Text style={styles.saveButtonText}>Kaydet</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <View style={{flex:2,justifyContent:'space-around',alignItems:'center'}}>{/*Düzenle,sil,chekbox ana viewi */}
              <View style={{width:'90%'}}>
                <TouchableOpacity
                 style={{backgroundColor:'darkturquoise',padding:5,borderRadius:3}} 
                 onPress={()=>changeStartTime(task.startDate,task.id,task.finishDate)}
                 >
                  <Text style={{color:'#fff',fontWeight:'bold',}}>Başlangıç Tarihi Değiştir </Text>
                </TouchableOpacity>               
              </View>
              <View style={styles.taskActions}>
                
                {!task.done && (
                  
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => startEditingTask(index)}
                  >
                    <Icon name="edit" size={20} color="blue" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => removeTask(task.id)}
                >
                  <Icon name="trash" size={20} color="red" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.colorToggleButton}
                  onPress={() => {
                    toggleTaskColor(task.id, task.color, task.done);
                    setCompletionTime(task.id,task.done); // Burada tamamlanma zamanını güncelle
                  }}
                >
                  <Icon
                    name={task.color === 'red' ? 'toggle-off' : 'toggle-on'}
                    size={20}
                    color={task.color === 'red' ? 'gray' : 'green'}
                  />
                </TouchableOpacity>
                
              </View>
              <View style={{width:'90%'}}>             
                <TouchableOpacity
                  style={{ backgroundColor: 'darkturquoise', padding: 5, borderRadius: 3 }}
                  onPress={() => changeFinishTime(task.finishDate, task.id, task.startDate)}
                >
                  <Text style={{color:'#fff',fontWeight:'bold',}}>Bitiş Tarihini Düzenle</Text>
                </TouchableOpacity>
                            
              </View>
            </View>
            </View>
            
            
            
          </View>
        </TouchableOpacity>
      ))}


      {tasks.length > 0 && (
        <TouchableOpacity
          style={styles.deleteAllButton}
          onPress={removeAllTasks}
        >
          <Text style={styles.deleteAllButtonText}>Tüm Görevleri Sil</Text>
        </TouchableOpacity>
      )}

      {renderUserPicker()}
      {renderEditModal()}
      {renderEditFinishDatePicker()}
      {renderEditStartDatePicker()}
      {renderStartDatePicker()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff5ee',
  },
  topContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
  },
  userSelectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent:'space-around'
  },
  selectUserButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'blue',
    borderRadius: 5,
    marginRight: 10,
  },
  expiredButton: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: 'gray',
    borderRadius: 5,
    marginRight: 10,
  },
  selectUserButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  selectedUserContainer: {
    backgroundColor: 'lightskyblue',
    padding: 10,
    borderRadius: 5,
    flex: 1,
  },
  selectedUserText: {
    fontSize: 14,
    color:'#fff',
    borderColor:'black',
    
  },
  dateSelectButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'goldenrod',
    borderRadius: 5,
    marginTop: 10,
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    
  },
  taskDetails: {
    flex: 4,
  },
  taskText: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight:'bold'
  },
  taskUsers: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight:'bold'
  },
  taskDate: {
    fontSize: 14,
    fontWeight:'bold'
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
    
  },
  editButton: {
    marginRight: 10,
  },
  deleteButton: {
    marginRight: 10,
  },
  colorToggleButton: {
    marginRight: 10,
    
  },
  editInputContainer: {
    flex:1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'center',
    marginTop: 10,
    
    
  },
  editInput: {
    flex:2,
    
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 5,
    marginRight: 10,
  },
  saveButton: {
    flex:1,
    backgroundColor: 'blue',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  addButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'green',
    borderRadius: 5,
    marginRight: 10,
    
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  deleteAllButton: {
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: 'center',
    marginTop: 20,
  },
  deleteAllButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  userName: {
    fontSize: 16,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalText: {
    marginBottom: 15,
    fontSize: 18,
    textAlign: 'center',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'flex-end',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default MyTasks;