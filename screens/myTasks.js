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

  const addTask = () => {
    if (acType === 'Admin') {
      if (taskText.trim() !== '') { // .trim başındaki ve sonundaki boşlukları kaldırıyor
        const newTask = { text: taskText, color: 'red' }; // Görevin başlangıçta kırmızı olması
        const newList = [...tasks, newTask];
        setTasks(newList); // yeni görevi görev listesine ekliyoruz
        setTaskText(''); // görevi ekledikten sonra input alanını temizleme
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

  const getValues = async () => {
    const storedTasks = await getData();
    setTasks(storedTasks);
  };

  // useEffect ilk çalışan kod, [] kullanımı olmaz ise döngüye girer 
  // [] içerisine yazılan değeri takip eder 
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
      {tasks.length > 0 && tasks.map((task, index) => ( // tasks.map bu dize içerisindeki her eleman için bu işlemi yapıyor
        // key={index} benzersiz olması için ID gibi bir şey
        <View key={index} style={styles.taskContainer}>
          <Text style={[styles.taskText, { color: task.color }]}>{index + 1} - {task.text}</Text>
          <TouchableOpacity onPress={() => toggleTaskColor(index)}>
            <Icon name="check" size={20} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => removeTask(index)}>
            <Icon name="trash" size={20} color="black" />
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, // İçerik büyüdükçe container büyür
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
  },
  touchableStyle: {
    width: 80,
    alignItems: 'center',
  },
});

export default MyTasks;
