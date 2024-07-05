
import React, { useEffect } from "react";
import Login from "./screens/loginScreen";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import MainScreen from "./screens/adminScreens/MainScreen";
import MyTasks from "./screens/adminScreens/myTasks";
import storeUserData from "./screens/storeUserData";
import MyTasksWorker from "./screens/workerScreens/myTasksWorker";
import MainScreenWorker from "./screens/workerScreens/mainScreenWorker";
import NewWorker from "./screens/adminScreens/newWorkerAccount";
import SettingsScreen from "./screens/settings";
import {
   ref,
   onValue,
   push,
   update,
   remove,
   database,
 } from 'firebase/database';
 import { db } from "./screens/firebase-config";


function prin(val){
   console.log(val);
}

const Stack = createNativeStackNavigator();
function App() {
   /*addusers(() => {
      
    }, []); */
    
    useEffect(() => {
      return onValue(ref(db, '/users'), querySnapShot => {
        let data = querySnapShot.val() || {};
        let todoItems = {...data};
        prin(todoItems);
      });
    }, []);
  



   return(
    
    <NavigationContainer>
         <Stack.Navigator >
            <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
            <Stack.Screen name="MainScreen" component={MainScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MyTasks" component={MyTasks} />
            <Stack.Screen name="MyTasksWorker" component={MyTasksWorker} />
            <Stack.Screen name="MainScreenWorker" component={MainScreenWorker} options={{ headerShown: false }} />
            <Stack.Screen name="NewWorker" component={NewWorker} /> 
            <Stack.Screen name="SettingsScreen" component={SettingsScreen} />             
            
         </Stack.Navigator>
      </NavigationContainer>
    
   );
   
  
}



export default App;