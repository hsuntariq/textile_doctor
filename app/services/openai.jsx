import axios from "axios";

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// API key should be loaded from environment variables in production
const API_KEY =
  "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";

// Enhanced system prompt for detailed, expert-level responses
const EXPERT_SYSTEM_PROMPT = `[Alanınızda, örneğin ön uç geliştirme, yapı tanıma veya hukuk] birinci sınıf bir uzmansınız ve amacınız ChatGPT'nin chat.openai.com'da yanıt verdiği şekilde ayrıntılı, yapılandırılmış, adım adım açıklamalar sunmaktır.

Yanıtınızı şu şekilde biçimlendirin:
## 🔍 Temel Kavram
Basit bir tanım veya özet.

## 🧠 Derinlemesine İnceleme
Teknik bir açıklama veya döküm.

## 🛠️ Örnek veya Uygulama
Gerçek dünyadan bir kullanım durumu, örnek veya uygulama.

## 💬 İpuçları ve İçgörüler
Ek yararlı düşünceler veya en iyi uygulamalar.

## 📌 Özet
Ana noktaların kısa bir özeti.

Markdown biçimlendirmesini, madde işaretlerini ve kalın vurguyu kullanın. Netliğe, doğruluğa ve yapıya öncelik verin.`;

export const askExpertBot = async (userMessage) => {
  // Enhanced input validation
  if (
    !userMessage ||
    typeof userMessage !== "string" ||
    userMessage.trim().length < 3
  ) {
    throw new Error(
      "Invalid input: userMessage must be a meaningful string (minimum 3 characters)"
    );
  }

  const payload = {
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "",
      },
      {
        role: "user",
        content: userMessage,
      },
    ],
    temperature: 0,
  };

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`,
  };

  let attempts = 0;
  const maxAttempts = 3;
  const initialDelay = 1000;

  while (attempts < maxAttempts) {
    try {
      console.log(`Attempt ${attempts + 1} to call OpenAI API...`);
      console.log("Preparing to send request to OpenAI...");
      console.log("Request payload:", JSON.stringify(payload, null, 2));
      console.log("Request headers:", JSON.stringify(headers, null, 2));

      const startTime = Date.now();
      console.log(
        `Sending request to OpenAI at ${new Date().toISOString()}...`
      );

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        payload,
        {
          headers,
          timeout: 95000,
        }
      );

      const endTime = Date.now();
      console.log(`Received response in ${endTime - startTime}ms`);
      console.log("Response status:", response.status);
      console.log("Response data:", JSON.stringify(response.data, null, 2));

      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error("Malformed API response: Missing content");
      }

      const content = response.data.choices[0].message.content.trim();

      // Verify response meets length requirements
      if (content.split(/\s+/).length < 100) {
        throw new Error("Response too short - possible truncation");
      }

      return content;
    } catch (error) {
      attempts++;
      console.error(`Attempt ${attempts} failed:`, error);

      // Enhanced error logging
      if (error.response) {
        console.error(
          `API Error [${error.response.status}]:`,
          error.response.data
        );
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Request setup error:", error.message);
      }

      if (error.response?.status === 429) {
        const waitTime =
          initialDelay * Math.pow(2, attempts) + Math.random() * 1000;
        console.warn(`Rate limited. Waiting ${waitTime}ms before retry...`);
        await delay(waitTime);
        continue;
      }

      if (
        error.response?.status === 400 &&
        error.response.data?.error?.code === "context_length_exceeded"
      ) {
        return "⚠️ Your question requires more context than currently available. Please try a more specific query.";
      }

      if (attempts >= maxAttempts) {
        return "⚠️ We're unable to process your request at this time. This may be due to high demand or service issues. Please try again later.";
      }
    }
  }
};

// Enhanced example usage
if (require.main === module) {
  (async () => {
    try {
      // Technical question example
      const technicalQuestion = `
      Explain the biochemical pathways involved in human metabolism of ethanol, including:
      1. Enzymatic processes in the liver
      2. Genetic factors affecting alcohol dehydrogenase
      3. Metabolic byproducts and their effects
      4. Clinical implications for chronic consumption
      `;

      console.log("Asking technical question...");
      const techResponse = await askExpertBot(technicalQuestion);
      console.log("\nTechnical Response:\n", techResponse);

      // Creative question example
      const creativeQuestion = `
      Compose a detailed analysis of Shakespeare's Hamlet focusing on:
      1. The psychological complexity of the protagonist
      2. Recurring motifs of madness and deception
      3. Comparative analysis with other revenge tragedies
      4. Modern reinterpretations in film and theater
      `;

      console.log("\nAsking creative question...");
      const creativeResponse = await askExpertBot(creativeQuestion);
      console.log("\nCreative Response:\n", creativeResponse);
    } catch (error) {
      console.error("Error in example usage:", error.message);
      process.exit(1);
    }
  })();
}
