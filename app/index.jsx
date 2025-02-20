import React from "react";
import "./global.css";
import { NavigationContainer } from "@react-navigation/native";
import Home from "./Home"; // ✅ Import Home component
import SignUp from "./SignUp"; // ✅ Import SignUp component
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator(); // ✅ Use createNativeStackNavigator instead of Stack

const Index = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Home"
        component={Home}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="SignUp" component={SignUp} />
    </Stack.Navigator>
  );
};

export default Index;
