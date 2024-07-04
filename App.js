
import React from "react";
import Login from "./screens/loginScreen";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import MainScreen from "./screens/MainScreen";



const Stack = createNativeStackNavigator();
function App() {
   return(
    
    <NavigationContainer>
         <Stack.Navigator >
            <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
            <Stack.Screen name="MainScreen" component={MainScreen} options={{ headerShown: false }} />
         </Stack.Navigator>
      </NavigationContainer>
    
   );
   
  
}



export default App;