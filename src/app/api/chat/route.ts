import { NextRequest, NextResponse } from "next/server";

// Remove edge runtime to access server-side env variables
// export const runtime = "edge";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatRequest {
  messages: Message[];
  model?: string; // Made optional with default
}

interface ChatResponse {
  message: string;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Best free models from Groq (in order of recommendation)
const RECOMMENDED_MODELS = [
  "llama-3.3-70b-versatile", // Best overall - newest and most capable
  "llama-3.1-70b-versatile", // Fallback option
  "llama-3.1-8b-instant", // Fastest for quick responses
  "mixtral-8x7b-32768", // Good for longer contexts
  "gemma2-9b-it", // Alternative option
];

const DEFAULT_MODEL = "llama-3.3-70b-versatile";

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { messages, model = DEFAULT_MODEL } = body;

    // Validation
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required and must not be empty" },
        { status: 400 }
      );
    }

    // Validate model is in the recommended list
    const selectedModel = RECOMMENDED_MODELS.includes(model)
      ? model
      : DEFAULT_MODEL;

    if (model && !RECOMMENDED_MODELS.includes(model)) {
      console.warn(
        `Model ${model} not in recommended list, using ${DEFAULT_MODEL}`
      );
    }

    // Get API key - try both environment variable names
    const apiKey =
      process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_LLM_API_KEY;

    if (!apiKey) {
      console.error("API key not found in environment variables");
      return NextResponse.json(
        { error: "API key is not configured" },
        { status: 500 }
      );
    }

    // Get API URL from environment or use default
    const apiUrl =
      process.env.LLM_API_URL ||
      "https://api.groq.com/openai/v1/chat/completions";

    // Multilingual system message for voice assistant
    const systemMessage: Message = {
      role: "system",
      content: `You are an intelligent and friendly AI voice assistant that can communicate in multiple languages.

CRITICAL: Always respond in the SAME LANGUAGE that the user is using. If the user speaks in Urdu, respond in Urdu. If they speak in Hindi, respond in Hindi. If they speak in Arabic, respond in Arabic. Match the user's language exactly.

Key guidelines:
- Detect the user's language automatically and respond in that language
- Keep responses concise and natural for voice interaction (2-4 sentences typically)
- Be conversational and engaging, as if speaking to a friend
- Provide accurate and helpful information
- If unsure, acknowledge it honestly in the user's language
- For complex topics, break down information into digestible parts
- Use examples when helpful
- Be empathetic and understanding
- Adapt your tone to match the user's query (professional for serious topics, casual for general chat)
- For questions requiring real-time data (weather, news, stock prices), acknowledge that you may not have the latest information

Languages supported: English, Urdu (اردو), Hindi (हिन्दी), Arabic (العربية), and many more.`,
    };

    // Prepare messages
    const allMessages = [systemMessage, ...messages];

    // Call Groq API using fetch
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: allMessages,
        model: selectedModel,
        temperature: 0.8,
        max_tokens: 2048,
        top_p: 0.95,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Groq API error:", response.status, errorData);

      let errorMessage = "Failed to get response from AI";
      if (response.status === 429) {
        errorMessage =
          "Rate limit exceeded. Please wait a moment and try again.";
      } else if (response.status === 401) {
        errorMessage = "Authentication failed. Please check API key.";
      } else if (response.status === 400) {
        // Check if it's a model decommission error
        if (errorData.error?.code === "model_decommissioned") {
          errorMessage = `Model is no longer available. Using ${DEFAULT_MODEL} instead.`;
          console.error(`Decommissioned model detected: ${selectedModel}`);
        } else {
          errorMessage = "Invalid request. Please check your input.";
        }
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: errorData.error?.message || `Status: ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract response
    const responseMessage =
      data.choices?.[0]?.message?.content ||
      "I apologize, but I couldn't generate a response. Please try again.";

    // Format response
    const chatResponse: ChatResponse = {
      message: responseMessage,
      model: selectedModel,
      usage: {
        prompt_tokens: data.usage?.prompt_tokens || 0,
        completion_tokens: data.usage?.completion_tokens || 0,
        total_tokens: data.usage?.total_tokens || 0,
      },
    };

    return NextResponse.json(chatResponse, { status: 200 });
  } catch (error: any) {
    console.error("Error in chat API:", error);
    console.error("Error details:", error.message);

    let errorMessage = "Failed to process chat request";
    let statusCode = 500;

    // Handle network errors
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      errorMessage = "Network error. Please check your connection.";
      statusCode = 503;
    } else if (error.message?.includes("timeout")) {
      errorMessage = "Request timeout. Please try again.";
      statusCode = 504;
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error.message || "Unknown error",
      },
      { status: statusCode }
    );
  }
}
