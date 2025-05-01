import React, { useRef, useState } from "react";
import {
  View,
  Button,
  Image,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import { Feather } from "@expo/vector-icons";
import axios from "axios"; // Add this dependency

// Your OpenAI API Key - IMPORTANT: Use environment variables in production!
// For development, you can use a config file that's gitignored
const OPENAI_API_KEY =
  "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";

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const [color, setColor] = useState(null);
  const [colorName, setColorName] = useState(null);
  const [fabricType, setFabricType] = useState(null);
  const [fabricDetails, setFabricDetails] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [previousResults, setPreviousResults] = useState([]);
  const [debugLogs, setDebugLogs] = useState([]);
  const [showDebug, setShowDebug] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const cameraRef = useRef(null);

  // Function to get average color from image data
  const getAverageColor = async (uri) => {
    try {
      // Create a small version of the image for color analysis
      const colorSample = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 50, height: 50 } }],
        { format: ImageManipulator.SaveFormat.JPEG }
      );

      // For now, return a placeholder color
      // In a production app, you would implement color extraction here
      return "#7F8C8D"; // Default gray color
    } catch (error) {
      console.error("Error getting average color:", error);
      return "#7F8C8D"; // Default gray color on error
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    setProcessing(true);
    setDebugLogs([]);
    try {
      // Take full quality photo
      const fullQualityPhoto = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: true,
      });

      // Create a resized version for analysis (better network performance)
      const analysisPhoto = await ImageManipulator.manipulateAsync(
        fullQualityPhoto.uri,
        [{ resize: { width: 512, height: 512 } }],
        { base64: true, format: ImageManipulator.SaveFormat.JPEG }
      );

      // We'll get color from OpenAI now instead of calculating it
      // Setting a placeholder until we get the real value
      setColor("#7F8C8D");

      // Set the photo in state with base64 data
      setPhoto({ ...fullQualityPhoto, base64: analysisPhoto.base64 });

      // Process the image with OpenAI API
      await analyzeImageWithOpenAI(analysisPhoto.base64);
    } catch (error) {
      console.error("Error capturing image:", error);
      setDebugLogs((prev) => [...prev, `Error capturing: ${error.message}`]);
      Alert.alert("Error", "Failed to capture or analyze image.");
    } finally {
      setProcessing(false);
    }
  };

  const analyzeImageWithOpenAI = async (base64Image) => {
    try {
      addDebugLog("Sending image to OpenAI...");

      // Prepare the API request
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this fabric image. Identify: 1) the fabric type (e.g., cotton, polyester, wool, linen, silk, etc.), 2) composition, 3) potential uses, and 4) the exact color with both a precise color name (like 'Navy Blue' or 'Burgundy') and its hex code value. Format your response as JSON with these keys: 'fabricType', 'composition', 'uses', 'colorName', and 'hexCode'. Be detailed but concise. answer in turkish",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 300,
          response_format: { type: "json_object" },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );

      // Process the response
      const result = response.data.choices[0].message.content;
      addDebugLog("Received response from OpenAI");

      try {
        const parsedResult = JSON.parse(result);

        setFabricType(parsedResult.fabricType);
        setFabricDetails({
          composition: parsedResult.composition,
          uses: parsedResult.uses,
        });

        // Set color information from OpenAI
        if (parsedResult.hexCode) {
          setColor(parsedResult.hexCode);
        }

        if (parsedResult.colorName) {
          setColorName(parsedResult.colorName);
        }

        // Add to previous results
        const newResult = {
          timestamp: new Date().toLocaleTimeString(),
          fabricType: parsedResult.fabricType,
          composition: parsedResult.composition,
          color: parsedResult.hexCode || color,
          colorName: parsedResult.colorName || "Unknown",
        };

        setPreviousResults((prev) => [newResult, ...prev].slice(0, 5));
        addDebugLog(`Identified fabric: ${parsedResult.fabricType}`);
      } catch (parseError) {
        addDebugLog(`Error parsing JSON: ${parseError.message}`);
        setFabricType("Unknown");
        setFabricDetails(null);
      }
    } catch (error) {
      addDebugLog(`API Error: ${error.message}`);
      console.error("OpenAI API Error:", error.response?.data || error.message);
      Alert.alert(
        "Analysis Failed",
        "Could not analyze the fabric. Please check your internet connection and try again."
      );
    }
  };

  const addDebugLog = (message) => {
    console.log(message);
    setDebugLogs((prev) => [...prev, message]);
  };

  const toggleFlash = () => {
    setFlashEnabled(!flashEnabled);
  };

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>Camera permission required</Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {processing && (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color="#4839C8" />
            <Text style={styles.processingText}>Analyzing fabric...</Text>
          </View>
        )}

        {photo ? (
          <View style={styles.previewContainer}>
            <Image
              source={{ uri: photo.uri }}
              style={styles.fullImage}
              resizeMode="contain"
            />
            <View style={styles.resultsContainer}>
              <View style={styles.resultCard}>
                <Text style={styles.resultTitle}>Kumaş analizi</Text>

                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Renk</Text>
                  <View style={styles.resultValueContainer}>
                    <View
                      style={[styles.colorSample, { backgroundColor: color }]}
                    />
                    <Text style={styles.resultValue}>
                      {colorName || "Unknown"}
                    </Text>
                  </View>
                </View>

                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Hex Kodu</Text>
                  <Text style={styles.resultValue}>{color || "#000000"}</Text>
                </View>

                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Kumaş</Text>
                  <Text style={styles.resultValue}>
                    {fabricType || "Unknown"}
                  </Text>
                </View>

                {fabricDetails?.composition && (
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Kompozisyon</Text>
                    <Text style={styles.resultValue}>
                      {fabricDetails.composition}
                    </Text>
                  </View>
                )}

                {fabricDetails?.uses && (
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Ortak Kullanımlar</Text>
                    <Text style={styles.resultValue}>{fabricDetails.uses}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  setPhoto(null);
                  setColor(null);
                  setColorName(null);
                  setFabricType(null);
                  setFabricDetails(null);
                }}
              >
                <Text style={styles.actionButtonText}>Tekrar çek</Text>
              </TouchableOpacity>

              {/* <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#555" }]}
                onPress={() => setShowDebug(!showDebug)}
              >
                <Text style={styles.actionButtonText}>
                  {showDebug ? "Hide Debug" : "Show Debug"}
                </Text>
              </TouchableOpacity> */}
            </View>

            {showDebug && (
              <ScrollView style={styles.debugContainer}>
                <Text style={styles.debugHeader}>Previous Results:</Text>
                {previousResults.map((result, i) => (
                  <View key={i} style={styles.debugResultItem}>
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        backgroundColor: result.color,
                        marginRight: 5,
                        borderRadius: 10,
                      }}
                    />
                    <Text style={styles.debugText}>
                      {result.timestamp}: {result.fabricType} -{" "}
                      {result.colorName} ({result.composition})
                    </Text>
                  </View>
                ))}

                <Text style={styles.debugHeader}>Debug Logs:</Text>
                {debugLogs.map((log, i) => (
                  <Text key={i} style={styles.debugText}>
                    {log}
                  </Text>
                ))}
              </ScrollView>
            )}
          </View>
        ) : (
          <>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              ref={cameraRef}
              enableTorch={flashEnabled ? true : false}
            />
            <View style={styles.cameraControlsContainer}>
              <TouchableOpacity
                style={styles.flashButton}
                onPress={toggleFlash}
              >
                <Feather
                  name={flashEnabled ? "zap" : "zap-off"}
                  size={24}
                  color="white"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.captureButton}
                onPress={takePicture}
                disabled={processing}
              >
                <Text style={styles.captureButtonText}>Analyze Fabric</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  previewContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  fullImage: {
    width: "90%",
    height: "50%",
    borderRadius: 10,
    marginTop: 10,
  },
  resultsContainer: {
    width: "90%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonRow: {
    marginTop: 15,
    width: "90%",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  actionButton: {
    backgroundColor: "#4839C8",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  cameraControlsContainer: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButton: {
    backgroundColor: "#4839C8",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  captureButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  flashButton: {
    position: "absolute",
    left: 30,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 25,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  processingText: {
    color: "white",
    marginTop: 10,
    fontSize: 16,
    fontWeight: "500",
  },
  debugContainer: {
    marginTop: 10,
    width: "90%",
    maxHeight: 200,
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 10,
  },
  debugHeader: {
    color: "#FFF",
    fontWeight: "bold",
    marginVertical: 5,
  },
  debugText: {
    color: "#CCC",
    fontSize: 12,
    marginBottom: 2,
  },
  debugResultItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  resultCard: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#4839C8",
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    flexWrap: "wrap",
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
    flex: 1,
  },
  resultValue: {
    fontSize: 16,
    color: "#333",
    flex: 2,
    textAlign: "right",
  },
  resultValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
  },
  colorSample: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
});
