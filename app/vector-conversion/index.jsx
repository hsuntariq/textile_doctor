import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { Picker } from "@react-native-picker/picker";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
const API_KEY =
  "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";
const { width } = Dimensions.get("window");

const chatStylePrompt = `Only return a black line vector illustration of the requested clothing item. No colors, no shadows, no background, no shading—only simple clean outlines.`;

const ImageGeneration = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [format, setFormat] = useState("png");
  const [chatHistory, setChatHistory] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarAnim = useRef(new Animated.Value(-250)).current;
  const flatListRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const toggleSidebar = () => {
    if (sidebarOpen) {
      Animated.timing(sidebarAnim, {
        toValue: -250,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(sidebarAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
    setSidebarOpen(!sidebarOpen);
  };

  const generateImage = async () => {
    if (!input.trim()) return;
    setIsLoading(true);

    // Add user message first
    const userMessage = { type: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const fullPrompt = `${chatStylePrompt} Subject: ${input}`;

      const res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: fullPrompt,
          n: 1,
          size: "1024x1024",
          response_format: "url",
        }),
      });

      const data = await res.json();
      const imageUrl = data.data[0].url;
      const aiMessage = { type: "ai", content: imageUrl, prompt: input };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { type: "error", content: "Failed to generate image" },
      ]);
    }

    setInput("");
    setIsLoading(false);
  };

  const downloadImage = async (url, type) => {
    try {
      setIsLoading(true);
      let fileUri = FileSystem.documentDirectory + `image.${type}`;

      if (type === "svg") {
        const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Placeholder for SVG content -->
  <rect width="1024" height="1024" fill="none" stroke="black"/>
  <text x="512" y="512" text-anchor="middle" fill="black">Vector Outline</text>
</svg>`;

        await FileSystem.writeAsStringAsync(fileUri, svgContent);
      } else {
        const { uri } = await FileSystem.downloadAsync(url, fileUri);
        fileUri = uri;
      }

      const perm = await MediaLibrary.requestPermissionsAsync();
      if (perm.granted) {
        await MediaLibrary.saveToLibraryAsync(fileUri);
        alert(`Image downloaded as ${type.toUpperCase()}!`);
      }
    } catch (e) {
      console.error("Download failed:", e);
      alert("Download failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    if (messages.length > 0) {
      setChatHistory((prev) => [...prev, { id: Date.now(), messages }]);
    }
    setMessages([]);
    setInput("");
    if (sidebarOpen) toggleSidebar();
  };

  const loadChat = (chat) => {
    setMessages(chat.messages);
    if (sidebarOpen) toggleSidebar();
  };

  const renderMessage = ({ item, index }) => {
    if (item.type === "user") {
      return (
        <View style={styles.userMessageContainer}>
          <View style={styles.userMessageBubble}>
            <Text style={styles.userMessageText}>{item.content}</Text>
          </View>
        </View>
      );
    } else if (item.type === "ai") {
      return (
        <View style={styles.aiMessageContainer}>
          <View style={styles.aiMessageBubble}>
            <Image
              source={{ uri: item.content }}
              style={styles.generatedImage}
              resizeMode="contain"
            />
            <View style={styles.downloadControls}>
              <Picker
                selectedValue={format}
                onValueChange={(itemValue) => setFormat(itemValue)}
                style={styles.formatPicker}
                dropdownIconColor="#fff"
              >
                <Picker.Item label="PNG" value="png" />
                <Picker.Item label="JPEG" value="jpg" />
                <Picker.Item label="SVG" value="svg" />
              </Picker>
              <TouchableOpacity
                onPress={() => downloadImage(item.content, format)}
                style={styles.downloadButton}
              >
                <Feather name="download" size={20} color="white" />
                <Text style={styles.downloadButtonText}>İndirmek</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    } else if (item.type === "error") {
      return (
        <View style={styles.errorMessageContainer}>
          <Text style={styles.errorMessageText}>{item.content}</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <LinearGradient colors={["#4839C8", "#2BB6E3"]} style={styles.gradient}>
          <Text className="text-white text-4xl">Vektör Üretimi</Text>
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
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <TouchableOpacity
          style={styles.overlay}
          onPress={toggleSidebar}
          activeOpacity={1}
        />
      )}

      {/* Sidebar */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            transform: [{ translateX: sidebarAnim }],
          },
        ]}
      >
        <TouchableOpacity onPress={startNewChat} style={styles.newChatButton}>
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.newChatButtonText}>New Chat</Text>
        </TouchableOpacity>

        <FlatList
          data={chatHistory}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => loadChat(item)}
              style={styles.chatHistoryItem}
            >
              <MaterialIcons name="chat-bubble" size={16} color="#666" />
              <Text style={styles.chatHistoryText} numberOfLines={1}>
                Chat {index + 1} - {item.messages.length} items
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.chatHistoryList}
        />
      </Animated.View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
            <Ionicons name="menu" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vector Outline Generator</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesContainer}
          style={styles.messagesList}
        />

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="üretmek için bir giyim eşyasını tanımlayın..."
            placeholderTextColor="#999"
            style={styles.input}
            multiline
            onSubmitEditing={generateImage}
          />
          <TouchableOpacity
            onPress={generateImage}
            style={styles.sendButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="send" size={24} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 1,
  },
  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 250,
    backgroundColor: "#fff",
    borderRightWidth: 1,
    borderRightColor: "#eee",
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  newChatButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4839C8",
    padding: 15,
    borderRadius: 8,
    margin: 15,
    marginBottom: 10,
  },
  newChatButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 10,
  },
  chatHistoryList: {
    paddingBottom: 20,
  },
  chatHistoryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  chatHistoryText: {
    marginLeft: 10,
    color: "#333",
    fontSize: 14,
    flex: 1,
  },
  mainContent: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  menuButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  headerRight: {
    width: 28,
  },
  messagesContainer: {
    padding: 15,
    paddingBottom: 80,
  },
  messagesList: {
    flex: 1,
  },
  userMessageContainer: {
    marginBottom: 15,
    alignItems: "flex-end",
  },
  userMessageBubble: {
    backgroundColor: "#4839C8",
    padding: 12,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    maxWidth: "80%",
  },
  userMessageText: {
    color: "white",
    fontSize: 16,
  },
  aiMessageContainer: {
    marginBottom: 25,
    alignItems: "flex-start",
  },
  aiMessageBubble: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    maxWidth: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  generatedImage: {
    width: 300,
    height: 300,
    borderRadius: 12,
    backgroundColor: "#f9f9f9",
  },
  downloadControls: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  formatPicker: {
    height: 40,
    width: 120,
    backgroundColor: "#4839C8",
    color: "white",
    borderRadius: 8,
    overflow: "hidden",
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4839C8",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  downloadButtonText: {
    color: "white",
    marginLeft: 5,
    fontSize: 14,
  },
  errorMessageContainer: {
    alignSelf: "center",
    backgroundColor: "#ffebee",
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
  errorMessageText: {
    color: "#c62828",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    paddingBottom: Platform.OS === "ios" ? 30 : 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  input: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    padding: 12,
    paddingTop: 12,
    maxHeight: 120,
    fontSize: 16,
    color: "#333",
  },
  sendButton: {
    backgroundColor: "#4839C8",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
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

export default ImageGeneration;
