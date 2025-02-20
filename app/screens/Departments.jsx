import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, View, StyleSheet, Dimensions, Image } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import Appointment from "./Appointments";
const { width } = Dimensions.get("window");

const Tab = createBottomTabNavigator();

const ServicesScreen = () => (
  <View className="flex-1 items-center justify-center">
    <Text className="text-2xl font-bold text-[#4839C8]">Services</Text>
  </View>
);

const ContactScreen = () => (
  <View className="flex-1 items-center justify-center">
    <Text className="text-2xl font-bold text-[#4839C8]">Contact</Text>
  </View>
);

const Departments = () => {
  return (
    <View className="bg-white min-h-screen relative">
      <View style={styles.header}>
        <LinearGradient colors={["#4839C8", "#2BB6E3"]} style={styles.gradient}>
          <Text className="text-white text-4xl">DEPARTMENTS</Text>
        </LinearGradient>
        {/* Curved Bottom Shape */}
        <Svg
          height="50"
          width={width}
          viewBox={`0 0 ${width} 50`}
          style={styles.svgCurve}
        >
          <Path
            fill="white"
            d={`M0,0 Q${width / 2},50 ${width},0 L${width},50 L0,50 Z`}
          />
        </Svg>
      </View>

      {/* departments */}
      <View className="flex flex-row flex-wrap gap-3">
        <View className="card w-[45%] rounded-xl mx-auto gap-3 p-10 flex items-center justify-center bg-white shadow-2xl">
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/256/3293/3293466.png",
            }}
            className="w-[100px] h-[100px] rounded-xl"
          />
          <Text className="text-primary font-semibold capitalize text-2xl">
            Doctor
          </Text>
        </View>
        <View className="card w-[45%] rounded-xl mx-auto gap-3 p-10 flex items-center justify-center bg-white shadow-2xl">
          <Image
            source={{
              uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHgnOdie6fCLfjYg5-k7uh7N9mu8lEWiHI0A&s",
            }}
            className="w-[100px] h-[100px] rounded-xl"
          />
          <Text className="text-primary font-semibold capitalize text-2xl">
            Textile clinics
          </Text>
        </View>
        <View className="card w-[45%] rounded-xl mx-auto gap-3 p-10 flex items-center justify-center bg-white shadow-2xl">
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/8506/8506684.png",
            }}
            className="w-[100px] h-[100px] rounded-xl"
          />
          <Text className="text-primary font-semibold capitalize text-2xl">
            Emergence
          </Text>
        </View>
        <View className="card w-[45%] rounded-xl mx-auto gap-3 p-10 flex items-center justify-center bg-white shadow-2xl">
          <Image
            source={{
              uri: "https://wallpapers.com/images/hd/blue-checklist-vector-illustration-hlhxaknu987mtfky.png",
            }}
            className="w-[100px] h-[100px] rounded-xl"
          />
          <Text className="text-primary font-semibold capitalize text-2xl">
            Appointments
          </Text>
        </View>
        <View className="card w-[45%] rounded-xl mx-auto gap-3 p-10 flex items-center justify-center bg-white shadow-2xl">
          <Image
            source={{
              uri: "https://png.pngtree.com/png-clipart/20240804/original/pngtree-blue-camera-app-icon-for-instagram-vector-png-image_15703916.png",
            }}
            className="w-[100px] h-[100px] rounded-xl"
          />
          <Text className="text-primary font-semibold capitalize text-2xl">
            Archive
          </Text>
        </View>
        <View className="card w-[45%] rounded-xl mx-auto gap-3 p-10 flex items-center justify-center bg-white shadow-2xl">
          <Image
            source={{
              uri: "https://cdn-icons-png.freepik.com/512/7960/7960288.png",
            }}
            className="w-[100px] h-[100px] rounded-xl"
          />
          <Text className="text-primary font-semibold capitalize text-2xl">
            Prescriptions
          </Text>
        </View>
      </View>
      <Text className="absolute bottom-[5%] text-2xl font-bold text-primary start-[50%] -translate-x-[50%]">
        Textile Doctor
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: "transparent",
  },
  gradient: {
    width: "100%",
    height: 150, // Adjust as needed
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    textTransform: "uppercase",
  },
  svgCurve: {
    position: "absolute",
    bottom: 0,
  },
});

export default Departments;
