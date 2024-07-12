import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
} from 'react-native';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase-config.js';

function SelectedTask({ route }) {
  const { taskId } = route.params;
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    getTasks();
  }, []);

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
          .sort((a, b) => new Date(a.finishDate) - new Date(b.finishDate));

        setTasks(tasksArray);

        // taskId ile eşleşen görevin id'sini console'a yazdır
        tasksArray.forEach(task => {
          if (task.id === taskId) {
            
            // Eşleşen görevi tasks state'ine kaydet
            setTasks([task]);
          }
        });
        
      }
    });
  };

  return (
    <View>
      {tasks.map(task => (
        <Text key={task.id}>
          {task.id} - {task.title} {/* Örneğin, görevin başlığını göstermek isterseniz */}
        </Text>
      ))}
    </View>
  );
}

export default SelectedTask;
