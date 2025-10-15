import { useState, useEffect } from "react";
import { Conversation, Message } from "@/types";

// Language detection utility
const detectLanguage = (text: string): string => {
  const urduPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  const chinesePattern = /[\u4E00-\u9FFF]/;
  const japanesePattern = /[\u3040-\u309F\u30A0-\u30FF]/;
  const koreanPattern = /[\uAC00-\uD7AF]/;
  const russianPattern = /[\u0400-\u04FF]/;
  const arabicPattern = /[\u0600-\u06FF]/;

  if (urduPattern.test(text)) return "ur";
  if (arabicPattern.test(text)) return "ar";
  if (chinesePattern.test(text)) return "zh";
  if (japanesePattern.test(text)) return "ja";
  if (koreanPattern.test(text)) return "ko";
  if (russianPattern.test(text)) return "ru";

  return "en";
};

// Generate title from text (max 4 words)
const generateTitle = (text: string): string => {
  const words = text.trim().split(/\s+/);
  if (words.length <= 4) {
    return text.length > 50 ? text.substring(0, 50) + "..." : text;
  }
  return words.slice(0, 4).join(" ") + "...";
};

export const useLocalStorage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);

  useEffect(() => {
    const storedConversations = localStorage.getItem(
      "voice-assistant-conversations"
    );
    const storedCurrent = localStorage.getItem("voice-assistant-current");

    if (storedConversations) {
      try {
        const parsed = JSON.parse(storedConversations);
        const conversationsWithDates = parsed.map(
          (conv: Record<string, unknown>) => ({
            ...conv,

            createdAt: conv.createdAt
              ? new Date(conv.createdAt as string | number | Date)
              : conv.date
              ? new Date(conv.date as string | number | Date)
              : new Date(),
            updatedAt: conv.updatedAt
              ? new Date(conv.updatedAt as string | number | Date)
              : conv.date
              ? new Date(conv.date as string | number | Date)
              : new Date(),
            messages: Array.isArray(conv.messages)
              ? conv.messages.map((msg: Message) => ({
                  ...msg,
                  timestamp: msg.timestamp
                    ? new Date(msg.timestamp)
                    : new Date(),
                }))
              : [],
          })
        );
        setConversations(conversationsWithDates);
      } catch (error) {
        console.error("Error loading conversations:", error);
        localStorage.removeItem("voice-assistant-conversations");
        setConversations([]);
      }
    }

    if (storedCurrent) {
      try {
        const parsed = JSON.parse(storedCurrent);
        if (parsed) {
          const currentWithDates = {
            ...parsed,
            createdAt: parsed.createdAt
              ? new Date(parsed.createdAt as string | number | Date)
              : parsed.date
              ? new Date(parsed.date as string | number | Date)
              : new Date(),
            updatedAt: parsed.updatedAt
              ? new Date(parsed.updatedAt as string | number | Date)
              : parsed.date
              ? new Date(parsed.date as string | number | Date)
              : new Date(),
            messages: parsed.messages
              ? parsed.messages.map((msg: Message) => ({
                  ...msg,
                  timestamp: msg.timestamp
                    ? new Date(msg.timestamp)
                    : new Date(),
                }))
              : [],
          };
          setCurrentConversation(currentWithDates);
        } else {
          setCurrentConversation(null);
        }
      } catch (error) {
        console.error("Error loading current conversation:", error);
        localStorage.removeItem("voice-assistant-current");
        setCurrentConversation(null);
      }
    }
  }, []);

  const saveConversations = (newConversations: Conversation[]) => {
    setConversations(newConversations);
    localStorage.setItem(
      "voice-assistant-conversations",
      JSON.stringify(newConversations)
    );
  };

  const saveCurrentConversation = (conversation: Conversation | null) => {
    setCurrentConversation(conversation);
    localStorage.setItem(
      "voice-assistant-current",
      JSON.stringify(conversation)
    );
  };

  const createNewConversation = () => {
    const now = new Date();
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: "New Conversation",
      messages: [],
      createdAt: now,
      updatedAt: now,
    };
    saveCurrentConversation(newConversation);
    return newConversation;
  };

  //   const detectedLanguage = detectLanguage(message.content);
  //   const messageWithLanguage = { ...message, language: detectedLanguage };

  //   if (!currentConversation) {
  //     const newConv = createNewConversation();
  //     newConv.messages.push(messageWithLanguage);
  //     newConv.updatedAt = new Date();

  //     // Set primary language and title from first user message
  //     if (message.role === "user") {
  //       newConv.primaryLanguage = detectedLanguage;
  //       newConv.title = generateTitle(message.content);
  //     }

  //     saveCurrentConversation(newConv);

  //     const existingIndex = conversations.findIndex(
  //       (conv) => conv.id === newConv.id
  //     );
  //     if (existingIndex === -1) {
  //       saveConversations([newConv, ...conversations]);
  //     } else {
  //       const updated = [...conversations];
  //       updated[existingIndex] = newConv;
  //       saveConversations(updated);
  //     }
  //   } else {
  //     const updatedConversation = {
  //       ...currentConversation,
  //       messages: [...currentConversation.messages, messageWithLanguage],
  //       updatedAt: new Date(),
  //     };

  //     // Set primary language from first user message if not already set
  //     if (!updatedConversation.primaryLanguage && message.role === "user") {
  //       updatedConversation.primaryLanguage = detectedLanguage;
  //     }

  //     // FIXED: Only update title if it's still "New Conversation" and this is the FIRST user message
  //     if (
  //       updatedConversation.title === "New Conversation" &&
  //       message.role === "user"
  //     ) {
  //       // Find if this is truly the first user message
  //       const userMessages = updatedConversation.messages.filter(
  //         (m) => m.role === "user"
  //       );
  //       if (userMessages.length === 1) {
  //         // This is the first user message
  //         updatedConversation.title = generateTitle(message.content);
  //       }
  //     }

  //     saveCurrentConversation(updatedConversation);

  //     const existingIndex = conversations.findIndex(
  //       (conv) => conv.id === currentConversation.id
  //     );

  //     if (existingIndex !== -1) {
  //       const updatedConversations = [...conversations];
  //       updatedConversations[existingIndex] = updatedConversation;
  //       updatedConversations.sort(
  //         (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  //       );
  //       saveConversations(updatedConversations);
  //     } else {
  //       saveConversations([updatedConversation, ...conversations]);
  //     }
  //   }
  // };

  // REPLACE addMessageToCurrentConversation in useLocalStorage.ts
  // FIXED: Use functional setState to avoid race conditions

  const addMessageToCurrentConversation = (message: Message) => {
    const detectedLanguage = detectLanguage(message.content);
    const messageWithLanguage = { ...message, language: detectedLanguage };

    setCurrentConversation((prevConversation) => {
      if (!prevConversation) {
        // Create new conversation
        const now = new Date();
        const newConv: Conversation = {
          id: Date.now().toString(),
          title: "New Conversation",
          messages: [messageWithLanguage],
          createdAt: now,
          updatedAt: now,
        };

        if (message.role === "user") {
          newConv.primaryLanguage = detectedLanguage;
          newConv.title = generateTitle(message.content);
        }

        // Save to localStorage
        localStorage.setItem(
          "voice-assistant-current",
          JSON.stringify(newConv)
        );

        // Update conversations list
        setConversations((prevConversations) => {
          const existingIndex = prevConversations.findIndex(
            (conv) => conv.id === newConv.id
          );

          let updatedConversations;
          if (existingIndex === -1) {
            updatedConversations = [newConv, ...prevConversations];
          } else {
            updatedConversations = [...prevConversations];
            updatedConversations[existingIndex] = newConv;
          }

          localStorage.setItem(
            "voice-assistant-conversations",
            JSON.stringify(updatedConversations)
          );

          return updatedConversations;
        });

        return newConv;
      } else {
        // Update existing conversation
        const updatedConversation: Conversation = {
          ...prevConversation,
          messages: [...prevConversation.messages, messageWithLanguage],
          updatedAt: new Date(),
        };

        // Set primary language from first user message if not already set
        if (!updatedConversation.primaryLanguage && message.role === "user") {
          updatedConversation.primaryLanguage = detectedLanguage;
        }

        // Only update title if it's still "New Conversation" and this is the FIRST user message
        if (
          updatedConversation.title === "New Conversation" &&
          message.role === "user"
        ) {
          const userMessages = updatedConversation.messages.filter(
            (m) => m.role === "user"
          );
          if (userMessages.length === 1) {
            updatedConversation.title = generateTitle(message.content);
          }
        }

        // Save to localStorage
        localStorage.setItem(
          "voice-assistant-current",
          JSON.stringify(updatedConversation)
        );

        // Update conversations list
        setConversations((prevConversations) => {
          const existingIndex = prevConversations.findIndex(
            (conv) => conv.id === prevConversation.id
          );

          let updatedConversations;
          if (existingIndex !== -1) {
            updatedConversations = [...prevConversations];
            updatedConversations[existingIndex] = updatedConversation;
            updatedConversations.sort(
              (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
            );
          } else {
            updatedConversations = [updatedConversation, ...prevConversations];
          }

          localStorage.setItem(
            "voice-assistant-conversations",
            JSON.stringify(updatedConversations)
          );

          return updatedConversations;
        });

        return updatedConversation;
      }
    });
  };
  const loadConversation = (conversationId: string) => {
    const conversation = conversations.find(
      (conv) => conv.id === conversationId
    );
    if (conversation) {
      saveCurrentConversation(conversation);
    }
  };

  const deleteConversation = (conversationId: string) => {
    const updatedConversations = conversations.filter(
      (conv) => conv.id !== conversationId
    );
    saveConversations(updatedConversations);

    if (currentConversation?.id === conversationId) {
      saveCurrentConversation(null);
    }
  };

  const clearAllConversations = () => {
    saveConversations([]);
    saveCurrentConversation(null);
  };

  return {
    conversations,
    currentConversation,
    addMessageToCurrentConversation,
    createNewConversation,
    loadConversation,
    deleteConversation,
    clearAllConversations,
  };
};
