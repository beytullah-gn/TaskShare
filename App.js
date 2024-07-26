import React, { useEffect, useState } from "react";
import './src/Services/firebase-config';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { AppState } from "react-native";
import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";
import DepartmentScreen from "./src/screens/departmentsScreen";
import AddNewDepartment from "./src/screens/AddNewDepartmentScreen";
import {SignOutService} from "./src/Auth/SignOut";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import './src/Services/firebase-config';
import MyProfile from "./src/screens/myProfile";

const Stack = createNativeStackNavigator();

function App() {
  const [appState, setAppState] = useState(AppState.currentState);
  const [lastBackgroundTime, setLastBackgroundTime] = useState(Date.now());
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        const timeInBackground = Date.now() - lastBackgroundTime;
        if (timeInBackground > 10000) { // 10 seconds
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
      <Stack.Navigator>
        {!isLoggedIn ? (
          <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="MyProfile" component={MyProfile} options={{ headerShown: false }} />
            <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Departments" component={DepartmentScreen} options={{ headerShown: false }}/>
            <Stack.Screen name="AddNewDepartment" component={AddNewDepartment} />
            {/* Diğer ekranlar buraya eklenir */}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
``
