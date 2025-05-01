import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import Appointment from "./Appointments";
import { useRouter } from "expo-router";
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
  const router = useRouter();
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
          <TouchableOpacity onPress={() => router.push("/camera")}>
            <Image
              source={{
                uri: "https://cdn-icons-png.flaticon.com/256/3293/3293466.png",
              }}
              className="w-[100px] h-[100px] rounded-xl"
            />
            <Text className="text-primary text-center font-semibold capitalize text-2xl">
              Doctor
            </Text>
          </TouchableOpacity>
        </View>
        <View className="card w-[45%] rounded-xl mx-auto gap-3 p-10 flex items-center justify-center bg-white shadow-2xl">
          <TouchableOpacity onPress={() => router.push("/chat")}>
            <Image
              source={{
                uri: "https://cdn.shopify.com/app-store/listing_images/92d57e9e47200cac41dff5a47f51b5fc/icon/COqM7qSt2YoDEAE=.png",
              }}
              className="w-[100px] h-[100px] rounded-xl"
            />
          </TouchableOpacity>
          <Text className="text-primary flex font-semibold capitalize text-2xl">
            <Text className="uppercase">AI</Text> Chat
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
          <TouchableOpacity onPress={() => router.push("/vector-conversion")}>
            <Image
              source={{
                uri: "https://wallpapers.com/images/hd/blue-checklist-vector-illustration-hlhxaknu987mtfky.png",
              }}
              className="w-[100px] h-[100px] rounded-xl"
            />
          </TouchableOpacity>
          <Text className="text-primary font-semibold capitalize text-2xl">
            Vector Conversion
          </Text>
        </View>
        <View className="card w-[45%] rounded-xl mx-auto gap-3 p-10 flex items-center justify-center bg-white shadow-2xl">
          <TouchableOpacity onPress={() => router.push("/converter")}>
            <Image
              source={{
                uri: "https://png.pngtree.com/png-clipart/20240804/original/pngtree-blue-camera-app-icon-for-instagram-vector-png-image_15703916.png",
              }}
              className="w-[100px] h-[100px] rounded-xl"
            />
            <Text className="text-primary font-semibold capitalize text-2xl">
              Archive
            </Text>
          </TouchableOpacity>
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
