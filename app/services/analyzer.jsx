export const OPENAI_API_KEY =
  "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";

// api.js
import axios from "axios";

export const analyzeImageWithOpenAI = async (base64Image) => {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o", // Using the vision model for image analysis
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

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API Error:", error.response?.data || error.message);
    throw error;
  }
};

const processOpenAIResponse = (jsonResponse) => {
  try {
    // Parse the JSON response
    const fabricData = JSON.parse(jsonResponse);

    return fabricData;
  } catch (error) {
    console.error("Failed to parse API response:", error);
    return {
      fabricType: "Unknown",
      composition: "Could not determine",
      uses: "N/A",
      colorName: "Unknown",
      hexCode: "#000000",
    };
  }
};

const robustAPICall = async (base64Image) => {
  try {
    // Set a timeout for the API call
    const timeoutDuration = 15000; // 15 seconds

    const apiCall = analyzeImageWithOpenAI(base64Image);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error("API request timed out")),
        timeoutDuration
      );
    });

    // Race between the API call and the timeout
    const response = await Promise.race([apiCall, timeoutPromise]);

    return processOpenAIResponse(response);
  } catch (error) {
    // Handle different types of errors
    if (error.response) {
      // The API responded with an error status code
      console.error("API Error:", error.response.status, error.response.data);

      // Handle rate limiting
      if (error.response.status === 429) {
        return { error: "Rate limit exceeded. Please try again later." };
      }

      // Handle authorization issues
      if (error.response.status === 401) {
        return { error: "API key invalid or expired." };
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Network Error:", error.message);
      return { error: "Network error. Please check your internet connection." };
    } else {
      // Something else happened while setting up the request
      console.error("Request Error:", error.message);
      return { error: "An unexpected error occurred." };
    }

    // Default error response
    return {
      fabricType: "Error",
      composition: "Could not analyze the image",
      uses: "Please try again",
      colorName: "Error",
      hexCode: "#FF0000", // Red to indicate error
    };
  }
};
