import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { AppState, Alert } from "react-native";
import Login from "./screens/loginScreen";
import MainScreen from "./screens/adminScreens/MainScreen";
import MyTasks from "./screens/adminScreens/myTasks";
import MyTasksWorker from "./screens/workerScreens/myTasksWorker";
import MainScreenWorker from "./screens/workerScreens/mainScreenWorker";
import NewWorker from "./screens/adminScreens/newWorkerAccount";
import SettingsScreen from "./screens/settings";
import MyMessagesWorker from "./screens/workerScreens/myMessagesWorker";
import ChatScreen from "./screens/chatScreen";
import PasswordRequest from "./screens/adminScreens/passwordRequests";
import CalendarScreen from "./screens/calendarScreen";
import ExpiredScreen from "./screens/adminScreens/expiredScreen";
import GraphicsScreen from "./screens/graphicsScreen";
import SelectedTask from "./screens/adminScreens/selectedTaskScreen";
import SelectedScreenWorker from "./screens/workerScreens/selectedTaskWorkerScreen";
import DepartmentScreen from "./src/screens/departmentsScreen";
import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";
import AddNewDepartment from "./src/screens/AddNewDepartmentScreen";
import { SignOutService } from "./src/Auth/SignOut";

const Stack = createNativeStackNavigator();

function App() {
  const [appState, setAppState] = useState(AppState.currentState);
  const [lastBackgroundTime, setLastBackgroundTime] = useState(Date.now());
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        const timeInBackground = Date.now() - lastBackgroundTime;
        if (timeInBackground > 5000) { // 5 seconds
          await SignOutService(); // Call SignOutService to sign out the user
          setShouldRedirect(true); // Set flag to redirect to LoginScreen
        }
      } else if (nextAppState === 'background') {
        setLastBackgroundTime(Date.now());
      }
      setAppState(nextAppState);
    };

    const appStateSubscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      appStateSubscription.remove();
    };
  }, [appState, lastBackgroundTime]);
/*
  if (shouldRedirect) {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
*/
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
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
        <Stack.Screen name="SignOutService" component={SignOutService} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
