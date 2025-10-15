export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  language?: string;
}

export interface ChatRequest {
  messages: Array<{ role: string; content: string }>;
  model: string;
}

export interface ChatResponse {
  message: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface GroqModel {
  id: string;
  name: string;
  description: string;
}

export interface Conversation {
  id: string;
  // date: Date;
  messages: Message[];
  title: string;
  updatedAt: Date;
  createdAt: Date;
  primaryLanguage?: string;
}
