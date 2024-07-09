
import React, { useEffect } from "react";
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
   push,
   update,
   remove,
   database,
 } from 'firebase/database';
 import { db } from "./screens/firebase-config";
import ChatScreen from "./screens/chatScreen";
import PasswordRequest from "./screens/adminScreens/passwordRequests";





const Stack = createNativeStackNavigator();
function App() {
   /*addusers(() => {
      
    }, []); */

    
    
    useEffect(() => {
      
      return onValue(ref(db, '/users'), querySnapShot => {
         let data = querySnapShot.val() || {};
         let todoItems = {...data};
         let usernames = Object.values(todoItems).map(item => item.username);
         //console.log(usernames);
         for (let key in todoItems) {
            if (todoItems[key].username === 'admin') {
              //console.log('Password for admin:', todoItems[key].password);
              break; // admin bulundu, döngüden çık
            }
          }
      });
    }, []);
  



   return(
    
    <NavigationContainer>
         <Stack.Navigator >
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
                          
            
         </Stack.Navigator>
      </NavigationContainer>
    
   );
   
  
}



export default App;