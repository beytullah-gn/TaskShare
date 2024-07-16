import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import CheckBox from 'expo-checkbox';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ref, onValue, update } from 'firebase/database';
import { db } from '../firebase-config.js';

function SelectedScreenWorker({ navigation, route }) {
  const { taskId } = route.params;

  const [task, setTask] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [users, setUsers] = useState([]);

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
        }
      }
    });

    getUsers();
  }, []);

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

  const toggleSubtaskDone = (subtaskId, currentDone) => {
    const newDone = !currentDone;
    const newColor = newDone ? 'green' : 'red';
    const subtaskRef = ref(db, `/tasks/${taskId}/subtasks/${subtaskId}`);
    update(subtaskRef, { done: newDone, color: newColor })
      .catch((error) =>
        console.error('Alt görev tamamlama durumu güncelleme hatası:', error)
      );
  };

  const renderSubtasks = () => {
    return subtasks.map((subtask) => (
      <View key={subtask.id} style={styles.subtaskContainer}>
        <TouchableOpacity onPress={() => toggleSubtaskDone(subtask.id, subtask.done)} style={{ flex: 1 }}>
          <CheckBox
            value={subtask.done}
            onValueChange={() => toggleSubtaskDone(subtask.id, subtask.done)}
            color={subtask.done ? 'green' : undefined} // Checkbox işaretli ise yeşil olur
          />
        </TouchableOpacity>
        <View style={{ flex: 7 }}>
          <View style={styles.userContainer}>
            <Text style={[styles.userText, { textDecorationLine: subtask.done ? 'line-through' : 'none' }]}>
              {subtask.text}
            </Text>
            <Text style={styles.dateText}>
              Başlangıç Tarihi: <Text style={{ color: 'gray' }}>{subtask.startDate}</Text>
            </Text>
            <Text style={styles.dateText}>
              Bitiş Tarihi: <Text style={{ color: 'gray' }}>{subtask.finishDate}</Text>
            </Text>
            <Text style={styles.dateText}>
              Atanan Kullanıcılar: <Text style={{ color: 'gray' }}>{subtask ? subtask.userIds.map(userId => users.find(user => user.id === userId)?.username).join(', ') : ''}</Text>
            </Text>
          </View>
        </View>
      </View>
    ));
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
      </View>
      <View style={styles.subtasksContainer}>
        <Text style={styles.subtasksTitle}>Alt Görevler</Text>
        {renderSubtasks()}
      </View>
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
  subtasksContainer: {
    marginBottom: 20,
  },
  subtasksTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  subtaskText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
});

export default SelectedScreenWorker;
