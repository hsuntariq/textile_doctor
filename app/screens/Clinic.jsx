import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";

const { width } = Dimensions.get("window");

// Sample icons (replace with actual icons)
const icons = [
  {
    name: "Composition",
    icon: "https://cdn-icons-png.flaticon.com/512/1160/1160358.png",
  },
  {
    name: "Weaving",
    icon: "https://cdn-icons-png.flaticon.com/512/1160/1160311.png",
  },
  {
    name: "Knitted",
    icon: "https://cdn-icons-png.flaticon.com/512/1160/1160367.png",
  },
  {
    name: "Fabric Dyeing",
    icon: "https://cdn-icons-png.flaticon.com/512/1160/1160347.png",
  },
  {
    name: "Colour",
    icon: "https://cdn-icons-png.flaticon.com/512/1160/1160381.png",
  },
  {
    name: "Design",
    icon: "https://cdn-icons-png.flaticon.com/512/1160/1160329.png",
  },
];

const Clinic = () => {
  return (
    <View className="bg-white min-h-screen relative">
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient colors={["#4839C8", "#2BB6E3"]} style={styles.gradient}>
          <Text className="text-white text-4xl">TEXTILE CLINIC</Text>
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

      {/* Grid Layout */}
      <View className="flex flex-row flex-wrap gap-3">
        {icons.map((item, index) => (
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

      {/* Footer */}
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

export default Clinic;
