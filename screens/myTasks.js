import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableOpacity, View, StyleSheet, Text, ScrollView, TextInput, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { acType } from './loginScreen';

const storeData = async (value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem('my-key', jsonValue);
  } catch (e) {
    console.error("Error saving value", e);
  }
};

const getData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('my-key');
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Error reading value", e);
    return [];
  }
};

function MyTasks() {
  const [tasks, setTasks] = useState([]); // Bu görevlerin tutulduğu liste
  const [taskText, setTaskText] = useState(''); // Bu yeni görev 
  const [editingIndex, setEditingIndex] = useState(-1); // Düzenleme modunda olan görevin index'i

  const addTask = () => {
    if (acType === 'Admin') {
      if (taskText.trim() !== '') {
        const newTask = { text: taskText, color: 'red' };
        const newList = [...tasks, newTask];
        setTasks(newList);
        setTaskText('');
        storeData(newList);
      }
    } else {
      Alert.alert('Yetki Hatası', 'Görev ekleme yetkiniz yok!');
    }
  };

  const removeTask = (index) => {
    if (acType === 'Admin') {
      const newList = tasks.filter((_, taskIndex) => taskIndex !== index);
      setTasks(newList);
      storeData(newList);
    } else {
      Alert.alert('Yetki Hatası', 'Görev silme yetkiniz yok!');
    }
  };

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

  const toggleTaskColor = (index) => {
    const newList = tasks.map((task, taskIndex) => {
      if (taskIndex === index) {
        return { ...task, color: task.color === 'red' ? 'green' : 'red' };
      }
      return task;
    });
    setTasks(newList);
    storeData(newList);
  };

  const startEditingTask = (index) => {
    if (acType === 'Admin'){setEditingIndex(index);}
    else{Alert.alert('Yetki Hatası', 'Görevleri düzenleme yetkiniz yok!');}
  };

  const finishEditingTask = (index, newText) => {
    const newList = tasks.map((task, taskIndex) => {
      if (taskIndex === index) {
        return { ...task, text: newText };
      }
      return task;
    });
    setTasks(newList);
    storeData(newList);
    setEditingIndex(-1); // Düzenleme modunu sonlandır
  };

  const getValues = async () => {
    const storedTasks = await getData();
    setTasks(storedTasks);
  };

  useEffect(() => {
    getValues();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput
        style={styles.input}
        value={taskText}
        placeholder="Görev"
        onChangeText={setTaskText}
      />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
        <TouchableOpacity style={styles.touchableStyle} onPress={addTask}>
          <Icon name="plus" size={30} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.touchableStyle} onPress={removeAllTasks}>
          <Icon name="remove" size={30} color="black" />
        </TouchableOpacity>
      </View>

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
});

export default MyTasks;
