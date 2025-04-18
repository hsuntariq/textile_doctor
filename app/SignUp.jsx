import { Link } from "expo-router";
import React, { useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";

import { CheckBox } from "react-native-elements";

const SignUp = () => {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <View className="min-h-screen px-5 py-5 bg-white">
      {/* Logo */}
      <View className="flex  flex-row gap-3 items-center justify-start">
        <Image
          source={{
            uri: "https://res-console.cloudinary.com/djo5zsnlq/media_explorer_thumbnails/e7f925c39f7430d40be033e9a31477ea/detailed",
          }}
          style={{ width: 100, height: 100, borderRadius: 10 }}
        />
      </View>

      {/* Form Container */}
      <View className="flex-1 py-10 my-20">
        <Text className="text-[#1E71B7] text-5xl font-semibold">Login</Text>

        {/* Email Input */}
        <TextInput
          placeholder="Enter your email"
          className="border-[#1E71B7] my-6 text-primary font-semibold border border-[3px] rounded-full p-5 w-full"
        />

        {/* Password Input */}
        <TextInput
          placeholder="Enter your password"
          secureTextEntry
          className="border-[#1E71B7] my-6 text-primary font-semibold border border-[3px] rounded-full p-5 w-full"
        />

        {/* Checkbox */}
        <View className="flex flex-row items-center justify-between ">
          <CheckBox
            containerStyle={{ backgroundColor: "transparent", borderWidth: 0 }}
            title="Remember my password"
            textStyle={{ color: "#1E71B7", fontWeight: "bold" }} // Change color here
            checked={isChecked}
            onPress={() => setIsChecked(!isChecked)}
          />

          <Text className="text-primary font-bold">Lorem, ipsum dolor.</Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity className="bg-[#1E71B7] mt-6 p-4 rounded-full">
          <Text className="text-white text-center text-lg font-semibold">
            Sign Up
          </Text>
        </TouchableOpacity>

        <View className="flex my-10  flex-row items-center justify-center ">
          <Text className="text-primary  "> Don't have an account?</Text>
          <Link href="/screens/Departments" className="font-bold ms-4">
            <Text className="text-primary font-bold">Create Account</Text>
          </Link>
        </View>
      </View>
    </View>
  );
};

export default SignUp;
