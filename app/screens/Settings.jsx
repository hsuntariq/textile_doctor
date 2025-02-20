import React from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";

const { width } = Dimensions.get("window");

const settingsOptions = [
  {
    name: "Profile",
    icon: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
  },
  {
    name: "Security",
    icon: "https://cdn-icons-png.flaticon.com/512/3064/3064155.png",
  },
  {
    name: "Notifications",
    icon: "https://cdn-icons-png.flaticon.com/512/561/561127.png",
  },
  {
    name: "Language",
    icon: "https://cdn-icons-png.flaticon.com/512/2276/2276931.png",
  },
  {
    name: "Privacy",
    icon: "https://cdn-icons-png.flaticon.com/512/3524/3524638.png",
  },
  {
    name: "Help",
    icon: "https://cdn-icons-png.flaticon.com/512/1828/1828666.png",
  },
];

const SettingsScreen = () => {
  return (
    <View className="bg-white min-h-screen relative">
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient colors={["#4839C8", "#2BB6E3"]} style={styles.gradient}>
          <Text className="text-white text-4xl">SETTINGS</Text>
        </LinearGradient>
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

      {/* Settings Options */}
      <View className="flex flex-row flex-wrap gap-3">
        {settingsOptions.map((item, index) => (
          <View
            key={index}
            className="card w-[45%] rounded-xl mx-auto gap-3 p-10 flex items-center justify-center bg-white shadow-2xl"
          >
            <Image
              source={{ uri: item.icon }}
              className="w-[100px] h-[100px] rounded-xl"
            />
            <Text className="text-primary font-semibold capitalize text-2xl">
              {item.name}
            </Text>
          </View>
        ))}
      </View>

      {/* Footer Title */}
      <Text className="absolute bottom-[10%] text-2xl font-bold text-primary start-[50%] -translate-x-[50%]">
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
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  svgCurve: {
    position: "absolute",
    bottom: 0,
  },
});

export default SettingsScreen;
