
import React, { useEffect,useState } from "react";
import Login from "./screens/loginScreen";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import MainScreen from "./screens/adminScreens/MainScreen";
import MyTasks from "./screens/adminScreens/myTasks";
import MyTasksWorker from "./screens/workerScreens/myTasksWorker";
import MainScreenWorker from "./screens/workerScreens/mainScreenWorker";
import NewWorker from "./screens/adminScreens/newWorkerAccount";
import SettingsScreen from "./screens/settings";
import MyMessagesWorker from "./screens/workerScreens/myMessagesWorker";
import {
   ref,
   onValue,
   update,
 
 } from 'firebase/database';
 import { db } from "./screens/firebase-config";
import ChatScreen from "./screens/chatScreen";
import PasswordRequest from "./screens/adminScreens/passwordRequests";
import CalendarScreen from "./screens/calendarScreen";
import ExpiredScreen from "./screens/adminScreens/expiredScreen";
import GraphicsScreen from "./screens/graphicsScreen";
import SelectedTask from "./screens/adminScreens/selectedTaskScreen";
import moment from "moment";
import SelectedScreenWorker from "./screens/workerScreens/selectedTaskWorkerScreen";
import DepartmentScreen from "./src/screens/departmentsScreen";
import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";
import AddNewDepartment from "./src/screens/AddNewDepartmentScreen";





const Stack = createNativeStackNavigator();
function App() {

    const [tasks, setTasks] = useState([]);
   
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
         if (tasksArray.length > 0){
            const today = moment.utc().endOf('day');
          
          tasksArray.forEach(task => {
            const finishDate = new Date(task.finishDate);
            finishDate.setDate(finishDate.getDate()+1)
            
            if(finishDate<today)
            {
               const expiredRef = ref(db, `/tasks/${task.id}`);
               update(expiredRef, { expired: true }) // expired'i güncelle
               .then(() =>
                  console.log("Today date ---->",today,"FİNİSH DATE ----->",finishDate,"Task id --->",task.id)
               )
               .catch((error) =>
                 console.error('Süresi geçmiş görevler güncellenirken hata : ', error)
               );
            }
          })
         }
          
          //console.log(tasksArray)
        }
      });
    };
    
    
    useEffect(() => {
      
      getTasks();
    }, []);
  



   return(
    
    <NavigationContainer>
         <Stack.Navigator >
            <Stack.Screen name="LoginScreen" component={LoginScreen} options={{headerShown:false}} />
            <Stack.Screen name="HomeScreen" component={HomeScreen} options={{headerShown:false}} />
            <Stack.Screen name="Yeni Kullanici Ekle" component={DepartmentScreen} />
            <Stack.Screen name="Yeni Departman Ekle" component={AddNewDepartment} />
            <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
            <Stack.Screen name="MainScreen" component={MainScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Görev Ata" component={MyTasks} />
            <Stack.Screen name="Görevlerim" component={MyTasksWorker} />
            <Stack.Screen name="MainScreenWorker" component={MainScreenWorker} options={{ headerShown: false }} />
            <Stack.Screen name="Kullanıcıları Yönet" component={NewWorker} /> 
            <Stack.Screen name="Ayarlar" component={SettingsScreen} />
            <Stack.Screen name="Mesajlarım" component={MyMessagesWorker} />
            <Stack.Screen name="Sohbet" component={ChatScreen} />
            <Stack.Screen name="Şifre Talepleri" component={PasswordRequest} />
            <Stack.Screen name="Takvim" component={CalendarScreen} />
            <Stack.Screen name="Arşiv" component={ExpiredScreen} />
            <Stack.Screen name="Performans Analizi" component={GraphicsScreen} />
            <Stack.Screen name="Seçilen Görev" component={SelectedTask} />
            <Stack.Screen name="Seçili Görev" component={SelectedScreenWorker} />
            
   
                          
            
         </Stack.Navigator>
      </NavigationContainer>
    
   );
   
  
}



export default App;