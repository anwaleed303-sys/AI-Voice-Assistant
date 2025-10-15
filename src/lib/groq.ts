import Groq from "groq-sdk";

export const createGroqClient = (apiKey: string) => {
  return new Groq({
    apiKey: apiKey,
  });
};

export const formatMessagesForGroq = (
  messages: Array<{ role: string; content: string }>
) => {
  return messages.map((msg) => ({
    role: msg.role as "system" | "user" | "assistant",
    content: msg.content,
  }));
};
