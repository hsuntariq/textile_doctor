import React, { useState, useEffect, useRef, useCallback } from "react";
import Markdown from "react-native-markdown-display";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
  ActivityIndicator,
  PanResponder,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { askExpertBot, askTextileBot } from "../services/openai";

const { width } = Dimensions.get("window");

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Use PanResponder for better swipe control
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to horizontal gestures
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy * 3);
      },
      onPanResponderRelease: (evt, gestureState) => {
        // Even very slow swipes will be detected
        if (gestureState.dx > 20) {
          // Swiped right
          setSidebarVisible(true);
        } else if (gestureState.dx < -20) {
          // Swiped left
          setSidebarVisible(false);
        }
      },
    })
  ).current;

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (currentConversationId) {
      loadMessages(currentConversationId);
    }
  }, [currentConversationId]);

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleSend = async () => {
    if (!input.trim()) return;

    const newConversationId =
      currentConversationId || `conv_${Date.now().toString()}`;
    if (!currentConversationId) {
      setCurrentConversationId(newConversationId);
      const updatedConversations = [newConversationId, ...conversations];
      setConversations(updatedConversations);
      await AsyncStorage.setItem(
        "conversations",
        JSON.stringify(updatedConversations)
      );
    }

    const userMessage = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    await delay(1000);
    const botReply = await askExpertBot(input);

    const botMessage = {
      id: Date.now().toString() + "_bot",
      text: botReply,
      sender: "bot",
    };

    const finalMessages = [...updatedMessages, botMessage];
    setMessages(finalMessages);
    await AsyncStorage.setItem(
      newConversationId,
      JSON.stringify(finalMessages)
    );
    setLoading(false);
  };

  const loadConversations = async () => {
    const stored = await AsyncStorage.getItem("conversations");
    if (stored) {
      setConversations(JSON.parse(stored));
    }
  };

  const loadMessages = async (id) => {
    const stored = await AsyncStorage.getItem(id);
    if (stored) {
      setMessages(JSON.parse(stored));
    } else {
      setMessages([
        {
          id: "1",
          text: "👋 Hello! How can I help with your textile needs?",
          sender: "bot",
        },
      ]);
    }
  };

  const renderItem = ({ item }) => {
    return (
      <View
        style={[
          styles.messageContainer,
          item.sender === "user" ? styles.userMessage : styles.botMessage,
        ]}
      >
        {item.sender === "bot" ? (
          <Markdown style={markdownStyles}>{item.text}</Markdown>
        ) : (
          <Text style={{ color: "#fff" }}>{item.text}</Text>
        )}
      </View>
    );
  };

  const markdownStyles = {
    body: {
      color: "#333",
      fontSize: 16,
      lineHeight: 24,
    },
    strong: {
      fontWeight: "bold",
    },
    table: {
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 6,
      overflow: "hidden",
      marginVertical: 10,
    },
    th: {
      backgroundColor: "#6c63ff", // Purple header
      color: "#fff",
      padding: 10,
      fontWeight: "bold",
      textAlign: "left",
    },
    tr: {
      borderBottomWidth: 1,
      borderColor: "#ccc",
      backgroundColor: "#f9f9f9", // Light default
    },
    tr_even: {
      backgroundColor: "#f1f1f1", // Striped effect
    },
    td: {
      padding: 10,
      color: "#333",
      fontSize: 15,
    },
    list_item: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginVertical: 2,
    },
    bullet_list_icon: {
      marginRight: 6,
      fontSize: 8,
      color: "#6c63ff",
    },
  };

  const renderConversation = ({ item }) => (
    <TouchableOpacity
      style={styles.convoItem}
      onPress={() => {
        setCurrentConversationId(item);
        setSidebarVisible(false);
      }}
    >
      <Text style={{ color: "#333" }}>{item}</Text>
    </TouchableOpacity>
  );

  // Toggle sidebar with button
  const toggleSidebar = () => setSidebarVisible((prev) => !prev);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ flex: 1, flexDirection: "row" }}>
        {sidebarVisible && (
          <View style={styles.sidebar}>
            <Text style={styles.sidebarTitle}>Previous Chats</Text>
            <FlatList
              data={conversations}
              keyExtractor={(item) => item}
              renderItem={renderConversation}
            />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            onPress={toggleSidebar}
            style={styles.sidebarToggle}
          >
            <Icon name="menu" size={28} color="#fff" />
          </TouchableOpacity>

          <View style={styles.header}>
            <LinearGradient
              colors={["#4839C8", "#2BB6E3"]}
              style={styles.gradient}
            >
              <Text style={styles.headerText}>Textile Doctor AI Chat</Text>
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

          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
              style={styles.container}
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              keyboardVerticalOffset={50}
            >
              {/* Apply PanResponder to this View to handle swipe gestures */}
              <View style={styles.chatArea} {...panResponder.panHandlers}>
                <FlatList
                  data={messages}
                  keyExtractor={(item) => item.id}
                  renderItem={renderItem}
                  contentContainerStyle={{ padding: 16, paddingBottom: 50 }}
                  keyboardShouldPersistTaps="handled"
                  // Add this prop to not interfere with PanResponder
                  scrollEnabled={true}
                  // Set lower threshold for momentum scroll
                  onScrollBeginDrag={(e) => e.persist()}
                  scrollEventThrottle={16}
                />
                {loading && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#4839C8" />
                    <Text style={{ marginLeft: 10, color: "#666" }}>
                      Textile Doctor is typing...
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Type your message..."
                  value={input}
                  onChangeText={setInput}
                  multiline
                />
                <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
                  <Icon name="send" size={22} color="#fff" />
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  sidebar: {
    width: 220,
    backgroundColor: "#f1f1f1",
    padding: 12,
    borderRightWidth: 1,
    borderColor: "#ccc",
  },
  sidebarTitle: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
  },
  convoItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  sidebarToggle: {
    position: "absolute",
    top: 15,
    left: 15,
    zIndex: 10,
    backgroundColor: "#4839C8",
    padding: 8,
    borderRadius: 8,
  },
  header: {
    position: "relative",
    backgroundColor: "transparent",
    zIndex: 1,
  },
  gradient: {
    width: "100%",
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "hidden",
  },
  svgCurve: {
    position: "absolute",
    bottom: 0,
    left: 0,
  },
  headerText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  chatArea: {
    flex: 1,
  },
  messageContainer: {
    marginVertical: 6,
    padding: 12,
    borderRadius: 12,
    maxWidth: "95%",
    color: "white",
  },
  userMessage: {
    backgroundColor: "#4839C8",
    alignSelf: "flex-end",
    color: "white",
  },
  botMessage: {
    backgroundColor: "#e2e2e2",
    alignSelf: "flex-start",
  },
  messageText: {
    color: "#fff",
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    margin: 10,
    padding: 8,
    backgroundColor: "#f1f1f1",
    borderRadius: 20,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    maxHeight: 100,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sendBtn: {
    backgroundColor: "#4839C8",
    borderRadius: 20,
    padding: 10,
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
});

export default ChatBox;
