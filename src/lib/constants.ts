export interface GroqModel {
  id: string;
  name: string;
  description: string;
}

export const DEFAULT_MODEL = "llama3-8b-8192";

export const GROQ_MODELS: GroqModel[] = [
  {
    id: "llama3-8b-8192",
    name: "Llama 3 8B",
    description: "Fast and efficient 8B parameter model",
  },
  {
    id: "llama3-70b-8192",
    name: "Llama 3 70B",
    description: "High-quality 70B parameter model",
  },
  {
    id: "mixtral-8x7b-32768",
    name: "Mixtral 8x7B",
    description: "High-quality mixture of experts model",
  },
];

export const STORAGE_KEYS = {
  CONVERSATIONS: "ai-voice-conversations",
  CURRENT_CONVERSATION: "ai-voice-current-conversation",
};
