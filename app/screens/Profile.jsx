import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";

const { width } = Dimensions.get("window");

const Profile = () => {
  const [name, setName] = useState("Hassan Tariq");
  const [email, setEmail] = useState("hassan@example.com");
  const [phone, setPhone] = useState("+92 300 1234567");

  return (
    <View className="bg-white min-h-screen relative">
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient colors={["#4839C8", "#2BB6E3"]} style={styles.gradient}>
          <Text className="text-white text-4xl">PROFILE</Text>
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

      {/* Profile Picture */}
      <View className="flex items-center mt-6">
        <Image
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
          }}
          className="w-[120px] h-[120px] rounded-full border-4 border-gray-200"
        />
      </View>

      {/* Editable Profile Fields */}
      <View className="px-6 mt-6">
        <Text className="text-xl font-semibold text-gray-700">Full Name</Text>
        <TextInput
          className="border p-3 rounded-xl mt-2 text-lg bg-gray-100"
          value={name}
          onChangeText={setName}
        />

        <Text className="text-xl font-semibold text-gray-700 mt-4">Email</Text>
        <TextInput
          className="border p-3 rounded-xl mt-2 text-lg bg-gray-100"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <Text className="text-xl font-semibold text-gray-700 mt-4">Phone</Text>
        <TextInput
          className="border p-3 rounded-xl mt-2 text-lg bg-gray-100"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity className="bg-[#1E71B7] p-4 rounded-xl mx-6 mt-6">
        <Text className="text-white text-xl text-center font-bold">
          Save Changes
        </Text>
      </TouchableOpacity>

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

export default Profile;
