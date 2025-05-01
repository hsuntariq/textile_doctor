import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  Image,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import SvgUri from "react-native-svg-uri";
import ViewShot from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";

const OPENAI_API_KEY = "sk-..."; // your OpenAI key

export default function TextileDoctorChat() {
  const [message, setMessage] = useState("");
  const [prompt, setPrompt] = useState("");
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [svgData, setSvgData] = useState("");
  const [format, setFormat] = useState("png"); // Default format: png, svg, or jpg
  const viewShotRef = useRef(null);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const data = await AsyncStorage.getItem("textileChats");
      if (data) setChats(JSON.parse(data));
    } catch (error) {
      console.error("Failed to load chats:", error);
    }
  };

  const saveChats = async (newChats) => {
    try {
      await AsyncStorage.setItem("textileChats", JSON.stringify(newChats));
    } catch (error) {
      console.error("Failed to save chats:", error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = { text: message, isUser: true, timestamp: Date.now() };
    const updatedChats = [...chats, userMessage];
    setChats(updatedChats);
    setMessage("");
    setLoading(true);

    try {
      const systemPrompt =
        "You are Textile Doctor, an AI assistant specializing in textile, fabric, clothing care, and fashion advice. Keep responses concise and helpful.";

      const res = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
          messages: [
            { role: "system", content: systemPrompt },
            ...updatedChats.map((chat) => ({
              role: chat.isUser ? "user" : "assistant",
              content: chat.text,
            })),
          ],
          temperature: 0.7,
          max_tokens: 500,
        },
        {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const botResponse = {
        text: res.data.choices[0].message.content,
        isUser: false,
        timestamp: Date.now(),
      };

      const finalChats = [...updatedChats, botResponse];
      setChats(finalChats);
      await saveChats(finalChats);
    } catch (error) {
      console.error("Error getting response:", error);
      // Add error message to chat
      const errorMsg = {
        text: "Sorry, I couldn't process your request. Please try again.",
        isUser: false,
        timestamp: Date.now(),
      };
      setChats([...updatedChats, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const generateImage = async () => {
    if (!prompt.trim()) {
      Alert.alert("Error", "Please enter a prompt first");
      return;
    }

    setLoading(true);
    try {
      const systemPrompt = `You are an SVG illustrator. Return ONLY a valid SVG string representing a clean vector outline illustration of: ${prompt}`;

      const res = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
          messages: [{ role: "system", content: systemPrompt }],
          temperature: 0.4,
          max_tokens: 1000,
        },
        {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const rawSVG = res.data.choices[0].message.content;
      setSvgData(rawSVG);

      // Create a chat message with the prompt and image info
      const newChat = {
        text: `Generated image for: "${prompt}"`,
        isUser: false,
        timestamp: Date.now(),
        svg: rawSVG,
      };

      const updatedChats = [...chats, newChat];
      setChats(updatedChats);
      await saveChats(updatedChats);
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async () => {
    if (!viewShotRef.current || !svgData) {
      Alert.alert("Error", "No image to download");
      return;
    }

    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission denied to save image");
        return;
      }

      if (format === "svg") {
        // Save raw SVG as file
        const fileUri =
          FileSystem.documentDirectory +
          `textile_${prompt.replace(/\s+/g, "_")}.svg`;

        await FileSystem.writeAsStringAsync(fileUri, svgData, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        await MediaLibrary.saveToLibraryAsync(fileUri);
      } else {
        // Capture screenshot for PNG or JPG
        const uri = await viewShotRef.current.capture({
          format: format === "jpg" ? "jpg" : "png",
          quality: 0.9,
        });
        await MediaLibrary.saveToLibraryAsync(uri);
      }

      Alert.alert("Success", `Image saved in ${format.toUpperCase()} format`);
    } catch (error) {
      Alert.alert("Error", `Failed to save image: ${error.message}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* Header with gradient */}
      <View style={styles.header}>
        <LinearGradient colors={["#4839C8", "#5E7CE2"]} style={styles.gradient}>
          {/* Hamburger menu */}
          <TouchableOpacity style={styles.menuButton}>
            <View style={styles.menuLine}></View>
            <View style={styles.menuLine}></View>
            <View style={styles.menuLine}></View>
          </TouchableOpacity>

          <Text style={styles.headerText}>Textile Doctor AI Chat</Text>

          {/* Wave shape at bottom of header */}
          <View style={styles.headerWave}>
            <Image
              source={{ uri: "https://reactnative.dev/img/header_logo.svg" }} // Replace with actual wave SVG
              style={{ width: "100%", height: 30 }}
              resizeMode="stretch"
            />
          </View>
        </LinearGradient>
      </View>

      {/* Chat area */}
      <ScrollView
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
      >
        {/* Image Generation Section */}
        <View style={styles.imageGenSection}>
          <Text style={styles.sectionTitle}>🎨 Generate Textile Image</Text>
          <TextInput
            placeholder="e.g., Vector image of a t-shirt pattern"
            value={prompt}
            onChangeText={setPrompt}
            style={styles.promptInput}
            multiline
          />

          <TouchableOpacity
            style={styles.generateBtn}
            onPress={generateImage}
            disabled={loading}
          >
            <Text style={styles.generateBtnText}>Generate Image</Text>
          </TouchableOpacity>

          {/* Format Selection */}
          <View style={styles.formatContainer}>
            <Text style={styles.formatLabel}>Export Format:</Text>
            <View style={styles.formatOptions}>
              {["svg", "png", "jpg"].map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.formatBtn,
                    format === opt && styles.formatBtnSelected,
                  ]}
                  onPress={() => setFormat(opt)}
                >
                  <Text
                    style={{
                      color: format === opt ? "#fff" : "#333",
                      fontWeight: format === opt ? "bold" : "normal",
                    }}
                  >
                    {opt.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Image Preview */}
          {svgData ? (
            <View style={styles.imagePreview}>
              <Text style={styles.previewLabel}>Image Preview:</Text>
              <ViewShot
                ref={viewShotRef}
                options={{
                  format: format === "jpg" ? "jpg" : "png",
                  quality: 0.9,
                }}
                style={styles.imageContainer}
              >
                <SvgUri width="100%" height={250} svgXmlData={svgData} />
              </ViewShot>

              <TouchableOpacity
                style={styles.downloadBtn}
                onPress={downloadImage}
              >
                <Text style={styles.downloadBtnText}>
                  Download as {format.toUpperCase()}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        <View style={styles.divider} />

        {/* Chat Messages */}
        <Text style={styles.sectionTitle}>💬 Chat History</Text>
        {chats.map((chat, index) => (
          <View
            key={index}
            style={[
              styles.messageContainer,
              chat.isUser ? styles.userMessage : styles.botMessage,
            ]}
          >
            <Text style={{ color: chat.isUser ? "#fff" : "#333" }}>
              {chat.text}
            </Text>
            {chat.svg && (
              <View style={styles.messageSvg}>
                <SvgUri width="100%" height={150} svgXmlData={chat.svg} />
              </View>
            )}
          </View>
        ))}
        {loading && (
          <View style={styles.loadingContainer}>
            <Text>Textile Doctor is thinking...</Text>
          </View>
        )}
      </ScrollView>

      {/* Message input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={message}
          onChangeText={setMessage}
          multiline
          placeholderTextColor="#999"
        />
        <TouchableOpacity
          style={styles.sendBtn}
          onPress={sendMessage}
          disabled={loading}
        >
          <Text style={{ color: "white", fontSize: 20 }}>▶</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    height: 140,
    width: "100%",
  },
  gradient: {
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  menuButton: {
    position: "absolute",
    left: 20,
    top: 40,
    width: 30,
    height: 25,
    justifyContent: "space-between",
  },
  menuLine: {
    width: 30,
    height: 3,
    backgroundColor: "#fff",
    borderRadius: 3,
  },
  headerText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },
  headerWave: {
    position: "absolute",
    bottom: -1,
    width: "100%",
    height: 30,
  },
  chatArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  chatContent: {
    padding: 15,
    paddingBottom: 30,
  },
  // Image Generation Styles
  imageGenSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4839C8",
    marginBottom: 12,
  },
  promptInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  generateBtn: {
    backgroundColor: "#4839C8",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    marginBottom: 15,
  },
  generateBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  formatContainer: {
    marginVertical: 10,
  },
  formatLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: "#666",
  },
  formatOptions: {
    flexDirection: "row",
  },
  formatBtn: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: "#e0e0e0",
  },
  formatBtnSelected: {
    backgroundColor: "#5E7CE2",
  },
  imagePreview: {
    marginTop: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
  },
  previewLabel: {
    fontSize: 14,
    marginBottom: 10,
    color: "#666",
  },
  imageContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  downloadBtn: {
    backgroundColor: "#5E7CE2",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  downloadBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 15,
  },
  // Chat Message Styles
  messageContainer: {
    padding: 12,
    borderRadius: 18,
    maxWidth: "85%",
    marginBottom: 12,
    elevation: 1,
  },
  userMessage: {
    backgroundColor: "#5E7CE2",
    alignSelf: "flex-end",
    borderBottomRightRadius: 5,
  },
  botMessage: {
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 5,
  },
  messageSvg: {
    marginTop: 10,
    padding: 5,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  input: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    borderRadius: 24,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
  },
  sendBtn: {
    backgroundColor: "#4839C8",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    padding: 10,
    alignSelf: "flex-start",
  },
});
