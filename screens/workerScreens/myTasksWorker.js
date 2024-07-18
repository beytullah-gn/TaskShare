import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { ref, onValue, update } from 'firebase/database';
import { db } from '../firebase-config';
import { acId } from '../loginScreen';
import CheckBox from 'expo-checkbox';

function UserTasks({ userId = acId , navigation }) {
  const [tasks, setTasks] = useState([]); // Görevlerin tutulduğu liste

  // Görevleri getirme işlemi
  useEffect(() => {
    const tasksRef = ref(db, '/tasks');
    onValue(tasksRef, snapshot => {
      const data = snapshot.val();
      if (data) {
        // Tüm görevleri diziye çevir ve bitiş tarihine göre sırala
        const tasksArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
        })).sort((a, b) => new Date(a.finishDate) - new Date(b.finishDate));

        // Kullanıcının görevlerini filtrele
        const userTasks = tasksArray.filter(task => task.userIds.includes(userId));
        setTasks(userTasks);
      } else {
        setTasks([]);
      }
    });
  }, [userId]); // useEffect'in userId değiştiğinde yeniden çalışmasını sağlar

  // Checkbox durumu değiştirme işlemi
  const toggleTaskDone = (taskId, currentDoneStatus) => {
    const taskRef = ref(db, `/tasks/${taskId}`);
    const today = new Date();
    const completionTime = today.toISOString().split('T')[0];
    update(taskRef, { done: !currentDoneStatus, color: !currentDoneStatus ? 'green' : 'red', completionTime: !currentDoneStatus ? completionTime : 'null'  })
      .then(() => console.log('Görev durumu güncellendi'))
      .catch(error => console.error('Görev durumu güncelleme hatası:', error));
  };

  const navigateToTask = (taskId) => {
    console.log("secilen id ",taskId)
   
    navigation.navigate('Seçili Görev', { taskId });
  };


  const renderTasks = () => {
    // Expired özelliği true olan görevleri filtrele
    const activeTasks = tasks.filter(task => !task.expired);
  
    return activeTasks.length > 0 ? (
      activeTasks.map((task, index) => (
        <TouchableOpacity key={task.id} onPress={() => navigateToTask(task.id)}>
          <View  style={styles.taskContainer}>
            <CheckBox
              value={task.done}
              onValueChange={() => toggleTaskDone(task.id, task.done)}
              style={styles.checkbox}
            />
            <View style={styles.taskTextContainer}>
              <Text style={[styles.taskText, { color: task.done ? 'green' : 'red' }]}>
                {index + 1} - {task.text}
              </Text>
              <Text style={styles.taskDate}>
                Başlangıç Tarihi: {task.startDate} - Bitiş Tarihi: {task.finishDate}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        
      ))
    ) : (
      <Text style={styles.noTasksText}>Henüz size atanmış görev bulunmamaktadır.</Text>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {renderTasks()}
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
  taskTextContainer: {
    flex: 1,
  },
  taskText: {
    fontSize: 18,
  },
  taskDate: {
    fontSize: 14,
    color: 'gray',
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
