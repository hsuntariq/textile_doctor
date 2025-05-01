export const convertImageToSVG = async (base64Image) => {
  const OPENAI_API_KEY =
    "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";

  try {
    console.log("Starting SVG conversion process");

    // Determine image format and construct the correct data URL
    let imageDataUrl;
    if (base64Image.startsWith("data:")) {
      // Already in data URL format
      imageDataUrl = base64Image;
    } else {
      // Assume it's a raw base64 string, try to detect format or default to PNG
      const detectedFormat = detectImageFormat(base64Image) || "image/png";
      imageDataUrl = `data:${detectedFormat};base64,${base64Image}`;
    }

    console.log("Image prepared for API request");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-2",
        messages: [
          {
            role: "system",
            content:
              "You are a A rank service that converts images into minimalist SVG files accurate to the minute details. ONLY reply with raw SVG code. The response MUST start with <svg and end with </svg>. No explanations, no markdown, no additional text.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Convert this image into a simple SVG drawing. Return ONLY the SVG code with no additional text or explanations.",
              },
              {
                type: "image_url",
                image_url: {
                  url: imageDataUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(
        `API error (${response.status}): ${errorText.substring(0, 100)}`
      );
    }

    const data = await response.json();
    console.log("API response received, processing SVG");

    // Extract SVG from various possible response formats
    let svgText = data.choices[0]?.message?.content || "";

    // Extract the SVG if it's wrapped in backticks, code blocks, or has explanatory text
    svgText = extractSVG(svgText);

    if (!svgText || !svgText.includes("<svg")) {
      console.error("Invalid SVG received:", svgText.substring(0, 100));
      throw new Error("Failed to extract valid SVG from API response");
    }

    // Ensure proper SVG encoding for display
    const svgBase64 = btoa(unescape(encodeURIComponent(svgText)));
    console.log("SVG conversion successful");

    return svgBase64;
  } catch (error) {
    console.error("Error in convertImageToSVG:", error);
    throw new Error(`SVG conversion failed: ${error.message}`);
  }
};

// Helper function to detect image format from base64 string
function detectImageFormat(base64String) {
  // Check the first few characters after decoding to identify format
  try {
    const prefix = atob(base64String.substring(0, 8));

    // Common image format signatures
    if (prefix.startsWith("\x89PNG")) return "image/png";
    if (prefix.startsWith("\xFF\xD8")) return "image/jpeg";
    if (prefix.startsWith("GIF87a") || prefix.startsWith("GIF89a"))
      return "image/gif";
    if (prefix.startsWith("RIFF") && prefix.includes("WEBP"))
      return "image/webp";
    if (prefix.startsWith("<svg")) return "image/svg+xml";

    // Default to png if unknown
    return "image/png";
  } catch (e) {
    console.warn("Error detecting image format:", e);
    return "image/png"; // Default to PNG
  }
}

// Extract SVG code from various text formats
function extractSVG(text) {
  // Direct SVG case
  if (text.trim().startsWith("<svg") && text.trim().endsWith("</svg>")) {
    return text.trim();
  }

  // Handle markdown code blocks
  const codeBlockRegex = /```(?:html|svg)?\s*(<svg[\s\S]*?<\/svg>)\s*```/;
  const codeBlockMatch = text.match(codeBlockRegex);
  if (codeBlockMatch && codeBlockMatch[1]) {
    return codeBlockMatch[1].trim();
  }

  // Handle backtick wrapping
  const backtickRegex = /`(<svg[\s\S]*?<\/svg>)`/;
  const backtickMatch = text.match(backtickRegex);
  if (backtickMatch && backtickMatch[1]) {
    return backtickMatch[1].trim();
  }

  // Extract any SVG tag from the text
  const svgRegex = /<svg[\s\S]*?<\/svg>/;
  const svgMatch = text.match(svgRegex);
  if (svgMatch && svgMatch[0]) {
    return svgMatch[0].trim();
  }

  return text; // Return original text if no SVG pattern found
}
