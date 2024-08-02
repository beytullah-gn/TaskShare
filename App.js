import React, { useEffect, useState } from "react";
import './src/Services/firebase-config';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { AppState } from "react-native";
import LoginScreen from "./src/screens/LoginScreen";
import DepartmentScreen from "./src/screens/departmentsScreen";
import AddNewDepartment from "./src/screens/AddNewDepartmentScreen";
import {SignOutService} from "./src/Auth/SignOut";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import './src/Services/firebase-config';
import MyProfile from "./src/screens/myProfile";
import PersonsScreen from "./src/screens/PersonsScreen";
import SelectedDepartment from "./src/screens/SelectedDepartment";
import SettingsScreen from "./src/screens/SettingsScreen";
import AddNewPersonScreen from "./src/screens/AddNewPerson";
import GysDöküman from "./src/screens/MyDocument";
import EntryScreen from "./src/screens/EntryScreen";
import EntryDocument from "./src/screens/entryMyDocument";
import SelectedPerson from "./src/screens/selectedPersonScreen";


const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

function App() {
  const [appState, setAppState] = useState(AppState.currentState);
  const [lastBackgroundTime, setLastBackgroundTime] = useState(Date.now());
  const [isLoggedIn, setIsLoggedIn] = useState(true);


  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        const timeInBackground = Date.now() - lastBackgroundTime;
        if (timeInBackground > 60000) { // 10 seconds
          try {
            await SignOutService();
            setIsLoggedIn(false);
          } catch (error) {
            console.error("Sign out failed", error);
          }
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

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <Stack.Navigator>
          <Stack.Screen name="MyProfile" component={MyProfile} options={{ headerShown: false }} />
          <Stack.Screen name="Departments" component={DepartmentScreen} options={{ headerShown: false }}/>
          <Stack.Screen name="AddNewDepartment" component={AddNewDepartment} options={{title:"Yeni Departman Oluştur"}} />
          <Stack.Screen name="Persons" component={PersonsScreen} options={{ headerShown: false }}/>
          <Stack.Screen name="SelectedDepartment" component={SelectedDepartment} options={{title:'Seçili Departman'}} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AddPerson" component={AddNewPersonScreen} options={{ title:"Yeni Kişi Ekle" }} />
          <Stack.Screen name="MyDocument" component={GysDöküman} options={{title:"Görev Dökümantasyonu"}} />
          <Stack.Screen
              name="SelectedPerson"
              component={SelectedPerson}
              options={({ route }) => ({
                  title: route.params.person.Name+" "+route.params.person.Surname
              })}
          />

        </Stack.Navigator>
      ) : (
        <AuthStack.Navigator>
          <AuthStack.Screen name="EntryScreen" component={EntryScreen} options={{ headerShown: false }} />
          <AuthStack.Screen name="LoginScreen" component={LoginScreen} options={{title:"Giriş Ekranı"}}/>  
          <AuthStack.Screen name="EntryDocument" component={EntryDocument}  options={{title:"Dökümantasyon"}}/>  
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}

export default App;

