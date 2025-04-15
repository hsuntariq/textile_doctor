import React, { useEffect } from "react";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import { Image } from "react-native";
import { getColorName } from "./colorUtils";

const DominantColorExtractor = ({ imageUri, onColorExtracted }) => {
  useEffect(() => {
    const analyzeImage = async () => {
      try {
        // 1. Resize image for faster processing
        const resized = await ImageManipulator.manipulateAsync(
          imageUri,
          [{ resize: { width: 100 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );

        // 2. Get image dimensions and create a canvas-like analysis
        Image.getSize(
          resized.uri,
          async (width, height) => {
            try {
              // 3. Get image as base64
              const base64 = await FileSystem.readAsStringAsync(resized.uri, {
                encoding: FileSystem.EncodingType.Base64,
              });

              // 4. Create a temporary image element
              const img = new Image();
              img.src = `data:image/jpeg;base64,${base64}`;

              img.onload = () => {
                // 5. Create canvas context (simulated)
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);

                // 6. Sample pixels (simplified approach)
                const pixelData = ctx.getImageData(0, 0, width, height).data;
                const colorCounts = {};

                // Sample every 10th pixel for performance
                for (let i = 0; i < pixelData.length; i += 40) {
                  const r = pixelData[i];
                  const g = pixelData[i + 1];
                  const b = pixelData[i + 2];
                  const hex = rgbToHex(r, g, b);

                  colorCounts[hex] = (colorCounts[hex] || 0) + 1;
                }

                // 7. Find most frequent color
                let dominantHex = "#000000";
                let maxCount = 0;

                for (const hex in colorCounts) {
                  if (colorCounts[hex] > maxCount) {
                    maxCount = colorCounts[hex];
                    dominantHex = hex;
                  }
                }

                onColorExtracted({
                  hex: dominantHex,
                  name: getColorName(dominantHex),
                  rgb: hexToRgb(dominantHex),
                });
              };
            } catch (error) {
              console.error("Pixel analysis error:", error);
              onColorExtracted({
                hex: "#CCCCCC",
                name: "Analysis Failed",
                error: true,
              });
            }
          },
          (error) => console.error("Image size error:", error)
        );
      } catch (error) {
        console.error("Color analysis failed:", error);
        onColorExtracted({
          hex: "#CCCCCC",
          name: "Error",
          error: true,
        });
      }
    };

    analyzeImage();
  }, [imageUri]);

  return null;
};

// Helper functions
const rgbToHex = (r, g, b) => {
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
};

const hexToRgb = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
};

export default DominantColorExtractor;
