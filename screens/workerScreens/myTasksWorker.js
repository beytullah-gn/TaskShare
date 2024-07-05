import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { acId } from '../loginScreen';

const getData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error(`Error reading ${key}`, e);
    return [];
  }
};
async function getUsers() {
    try {
        const jsonValue = await AsyncStorage.getItem('@users');
        
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error("Kullanıcı verileri alınamadı: ", e);
        return [];
    }
}
function UserTasks({ userId=acId }) {
  const [tasks, setTasks] = useState([]); // Görevlerin tutulduğu liste

  // Görevleri getirme işlemi
  const getTasks = async () => {

    const storedTasks = await getData('my-key');
    const userTasks = storedTasks.filter(task => task.userId === userId);
    setTasks(userTasks);
    
  };

  useEffect(() => {
    
    getUsers();
    getTasks();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {tasks.length > 0 ? (
        tasks.map((task, index) => (
          <View key={index} style={styles.taskContainer}>
            <Text style={[styles.taskText, { color: task.color }]}>{index + 1} - {task.text}</Text>
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
    justifyContent: 'space-between',
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
});

export default UserTasks;
