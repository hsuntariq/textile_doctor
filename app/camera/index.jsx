import React, { useRef, useState } from "react";
import {
  View,
  Button,
  Image,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import { WebView } from "react-native-webview";

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const [color, setColor] = useState(null);
  const [showWebView, setShowWebView] = useState(false);
  const cameraRef = useRef(null);
  const [processing, setProcessing] = useState(false);

  const takePicture = async () => {
    if (!cameraRef.current) return;

    setProcessing(true);
    try {
      // Capture full quality image
      const fullQualityPhoto = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: true,
      });

      // Create a smaller version for analysis (keep original sharp)
      const analysisPhoto = await ImageManipulator.manipulateAsync(
        fullQualityPhoto.uri,
        [{ resize: { width: 100 } }], // Reduced size for analysis
        { base64: true, format: ImageManipulator.SaveFormat.JPEG }
      );

      setPhoto(fullQualityPhoto); // Store the sharp original
      setShowWebView(true);
    } catch (error) {
      console.error("Error capturing image:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleMessage = (event) => {
    setColor(event.nativeEvent.data);
    setShowWebView(false);
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
    <View style={{ flex: 1 }}>
      {/* WebView for color analysis (hidden) */}
      {showWebView && photo?.base64 && (
        <WebView
          originWhitelist={["*"]}
          source={{
            html: `
              <html>
                <body style="margin:0;">
                  <canvas id="canvas"></canvas>
                  <script>
                    const img = new Image();
                    img.src = "data:image/jpeg;base64,${photo.base64}";
                    img.onload = function() {
                      const canvas = document.getElementById("canvas");
                      const ctx = canvas.getContext("2d");
                      canvas.width = 100;
                      canvas.height = 100;
                      ctx.drawImage(img, 0, 0, 100, 100);
                      
                      const pixelData = ctx.getImageData(0, 0, 100, 100).data;
                      let r = 0, g = 0, b = 0, count = 0;
                      
                      for (let i = 0; i < pixelData.length; i += 4) {
                        r += pixelData[i];
                        g += pixelData[i+1];
                        b += pixelData[i+2];
                        count++;
                      }
                      
                      const hex = "#" + 
                        [Math.round(r/count), Math.round(g/count), Math.round(b/count)]
                        .map(x => x.toString(16).padStart(2, '0')).join('');
                      
                      window.ReactNativeWebView.postMessage(hex);
                    };
                  </script>
                </body>
              </html>
            `,
          }}
          onMessage={handleMessage}
          style={{ width: 0, height: 0 }} // Hide the WebView
        />
      )}

      {processing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="#4839C8" />
        </View>
      )}

      {photo ? (
        <View style={styles.previewContainer}>
          {/* Display original sharp image */}
          <Image
            source={{ uri: photo.uri }}
            style={styles.fullImage}
            resizeMode="contain"
          />

          {color && (
            <View style={[styles.colorResult, { backgroundColor: color }]}>
              <Text style={styles.colorText}>{color}</Text>
            </View>
          )}

          <View style={styles.buttonRow}>
            <Button
              title="Retake"
              onPress={() => {
                setPhoto(null);
                setColor(null);
              }}
            />
          </View>
        </View>
      ) : (
        <>
          <CameraView style={StyleSheet.absoluteFillObject} ref={cameraRef} />
          <View style={styles.captureButtonContainer}>
            <Button
              title="Capture"
              onPress={takePicture}
              disabled={processing}
              color="white"
            />
          </View>
        </>
      )}
    </View>
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
    backgroundColor: "#000",
  },
  fullImage: {
    width: "90%",
    height: "60%",
    borderRadius: 10,
  },
  colorResult: {
    marginTop: 20,
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  colorText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonRow: {
    marginTop: 30,
    width: "80%",
  },
  captureButtonContainer: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    backgroundColor: "#4839C8",
    padding: 10,
    borderRadius: 10,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
});
