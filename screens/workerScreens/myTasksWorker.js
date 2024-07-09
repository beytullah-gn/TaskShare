import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { ref, onValue, update } from 'firebase/database';
import { db } from '../firebase-config';
import { acId } from '../loginScreen';
import CheckBox from 'expo-checkbox';

function UserTasks({ userId = acId }) {
  const [tasks, setTasks] = useState([]); // Görevlerin tutulduğu liste

  // Görevleri getirme işlemi
  useEffect(() => {
    const tasksRef = ref(db, '/tasks');
    onValue(tasksRef, snapshot => {
      const data = snapshot.val();
      if (data) {
        // Tüm görevleri diziye çevir
        const tasksArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
        }));

        // Sadece kullanıcının kendisine atanmış görevleri filtrele
        const userTasks = tasksArray.filter(task => task.userId === userId);
        setTasks(userTasks);
      } else {
        setTasks([]);
      }
    });
  }, [userId]); // useEffect'in userId değiştiğinde yeniden çalışmasını sağlar

 // Checkbox durumu değiştirme işlemi
const toggleTaskDone = (taskId, currentDoneStatus) => {
  const taskRef = ref(db, `/tasks/${taskId}`);
  update(taskRef, { done: !currentDoneStatus, color: !currentDoneStatus ? 'green' : 'red' })
    .then(() => console.log('Görev durumu güncellendi'))
    .catch(error => console.error('Görev durumu güncelleme hatası:', error));
};



  return (
    <ScrollView contentContainerStyle={styles.container}>
      {tasks.length > 0 ? (
        tasks.map((task, index) => (
          <View key={task.id} style={styles.taskContainer}>
            <CheckBox
              value={task.done}
              onValueChange={() => toggleTaskDone(task.id, task.done)}
              style={styles.checkbox}
            />
            <Text style={[styles.taskText, { color: task.done ? 'green' : 'red' }]}>
              {index + 1} - {task.text}
            </Text>
          </View>
        ))
      ) : (
        <Text style={styles.noTasksText}>Henüz size atanmış görev bulunmamaktadır.</Text>
      )}
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
  taskContainer: {
    width: '100%',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskText: {
    fontSize: 18,
    flex: 1,
  },
  noTasksText: {
    fontSize: 16,
    color: 'gray',
    marginTop: 20,
  },
  checkbox: {
    marginRight: 10,
  },
});

export default UserTasks;
