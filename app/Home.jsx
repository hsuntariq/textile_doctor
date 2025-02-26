import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Link } from "expo-router";
import { Feather } from "@expo/vector-icons";

const Home = () => {
  return (
    <>
      <SafeAreaView>
        <LinearGradient
          className="min-h-screen relative flex justify-center items-center"
          colors={["#4839C8", "#2BB6E3"]}
        >
          <View className="flex  flex-row gap-3 items-center justify-center">
            <Image
              source={require("../assets/images/logo.png")}
              className="w-[100%] h-[100px] rounded-xl"
              onError={(e) =>
                console.log("Image Load Error:", e.nativeEvent.error)
              }
            />

            {/* <View className="">
              <Text className="text-5xl flex font-bold text-white">
                Textile
              </Text>
              <View className="flex flex-row gap-2">
                <Text className="text-5xl flex font-bold text-white">
                  Doctor
                </Text>
                <Text className="text-2xl flex font-bold text-white">®</Text>
              </View>
            </View> */}
          </View>

          <View className="my-20">
            <Text className="text-xl text-center text-gray-100">
              2.0 Version
            </Text>
          </View>
          <View className="absolute bottom-[20%]">
            <Text className="text-xl text-center text-gray-100">
              Root of knowledge{" "}
            </Text>
          </View>
          <View className="absolute bottom-[10%] right-[20px]">
            <Link
              href="/SignUp"
              className="text-xl bg-white  px-4 py-2 rounded-md text-center flex flex-row text-white items-center gap-3"
            >
              <Text className="text-[16px] text-primary font-semibold">
                Get Started
              </Text>
              <Feather name="arrow-right" size={16} color="#1e71b7" />
            </Link>
          </View>
        </LinearGradient>
      </SafeAreaView>
    </>
  );
};

export default Home;
