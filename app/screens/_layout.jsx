import { Tabs } from "expo-router";
import React from "react";
import {
  Feather,
  FontAwesome5,
  Octicons,
  EvilIcons,
  AntDesign,
} from "@expo/vector-icons";

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#1E71B7",
        tabBarInactiveTintColor: "#888",
      }}
    >
      <Tabs.Screen
        name="Departments"
        options={{
          title: "Departments",
          headerShown: false,

          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ), // ✅ Explicitly returning JSX
        }}
      />
      <Tabs.Screen
        name="Settings"
        options={{
          title: "Settings",
          headerShown: false,

          tabBarIcon: ({ color, size }) => (
            <EvilIcons name="gear" size={size} color={color} />
          ), // ✅ Explicitly returning JSX
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: "Profile",
          headerShown: false,

          tabBarIcon: ({ color, size }) => (
            <AntDesign name="user" size={size} color={color} />
          ), // ✅ Explicitly returning JSX
        }}
      />
      <Tabs.Screen
        name="Clinic"
        options={{
          title: "Clinic",
          headerShown: false,

          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="clinic-medical" size={size} color={color} />
          ), // ✅ Explicitly returning JSX
        }}
      />
      <Tabs.Screen
        name="Appointments"
        options={{
          title: "Appointments",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Octicons name="checklist" size={size} color={color} />
          ), // ✅ Explicitly returning JSX
        }}
      />
    </Tabs>
  );
};

export default _layout;
