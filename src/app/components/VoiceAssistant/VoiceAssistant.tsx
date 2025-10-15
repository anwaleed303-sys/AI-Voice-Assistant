"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  message as antMessage,
  Typography,
  Button,
  Space,
  Layout,
  Flex,
  Tooltip,
} from "antd";
import {
  CloseOutlined,
  AudioOutlined,
  AudioMutedOutlined,
  HistoryOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { VoiceVisualizer } from "./VoiceVisualizer";
import { ChatHistory } from "./ChatHistory";

import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { DEFAULT_MODEL } from "@/lib/constants";
import axios from "axios";
import { Message, Conversation } from "@/types";
const { Text } = Typography;
const { Content } = Layout;

type Particle = {
  width: number;
  height: number;
  top: number;
  left: number;
  duration: number;
  delay: number;
};

export const VoiceAssistant: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [micPermissionGranted, setMicPermissionGranted] =
    useState<boolean>(false);
  const [permissionError, setPermissionError] = useState<string>("");
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [autoListenEnabled, setAutoListenEnabled] = useState<boolean>(false);
  const autoListenRef = useRef<boolean>(false);
  const {
    conversations,
    currentConversation,
    addMessageToCurrentConversation,
    createNewConversation,
    deleteConversation,

    clearAllConversations,
  } = useLocalStorage();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1024,
    height: typeof window !== "undefined" ? window.innerHeight : 768,
  });
  const {
    speak,
    cancel: cancelSpeech,
    isSpeaking,
  } = useSpeechSynthesis({
    language: "auto",
  });

  // Generate particles on client side only - FIXED
  useEffect(() => {
    setIsMounted(true);
    setParticles(
      [...Array(30)].map(() => ({
        width: Math.random() * 4 + 1,
        height: Math.random() * 4 + 1,
        top: Math.random() * 100,
        left: Math.random() * 100,
        duration: Math.random() * 15 + 15,
        delay: Math.random() * 5,
      }))
    );
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getVisualizerSize = () => {
    if (windowSize.width < 576) return "small";
    if (windowSize.width < 768) return "medium";
    return "large";
  };

  const handleVoiceResult = useCallback(
    async (transcript: string) => {
      if (!transcript.trim()) return;

      // console.log("🎤 Voice input received:", transcript);
      setIsProcessing(true);

      // Detect language from transcript
      const detectLanguage = (text: string): string => {
        if (/[\u0600-\u06FF]/.test(text)) {
          if (
            /[\u0679\u067E\u0686\u0688\u0691\u0698\u06A9\u06AF\u06BA\u06BE\u06CC]/.test(
              text
            )
          ) {
            return "ur"; // Urdu
          }
          return "ar"; // Arabic
        }
        if (/[\u0900-\u097F]/.test(text)) return "hi"; // Hindi
        if (/[\u0A00-\u0A7F]/.test(text)) return "pa"; // Punjabi
        if (/[\u4E00-\u9FFF]/.test(text)) return "zh"; // Chinese
        if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return "ja"; // Japanese
        if (/[\uAC00-\uD7AF]/.test(text)) return "ko"; // Korean
        return "en"; // Default English
      };

      // 1. CREATE USER MESSAGE
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: transcript,
        timestamp: new Date(),
        language: detectLanguage(transcript),
      };

      // 2. IMMEDIATELY ADD USER MESSAGE
      addMessageToCurrentConversation(userMessage);

      try {
        // 3. BUILD CONVERSATION HISTORY
        const conversationHistory = currentConversation?.messages || [];

        const messagesToSend = [
          ...conversationHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          { role: "user", content: transcript },
        ];

        // console.log("📤 Messages to API:", messagesToSend.length);

        // 4. CALL AI API
        const response = await axios.post("/api/chat", {
          messages: messagesToSend,
          model: DEFAULT_MODEL,
        });

        // 5. ADD SMALL DELAY TO LET USER MESSAGE SAVE
        await new Promise((resolve) => setTimeout(resolve, 100));

        // 6. CREATE ASSISTANT MESSAGE
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.data.message,
          timestamp: new Date(),
          language: detectLanguage(transcript),
        };

        // console.log("💾 Saving assistant message");

        // 7. SAVE ASSISTANT MESSAGE
        addMessageToCurrentConversation(assistantMessage);

        // 8. SPEAK THE RESPONSE
        await speak(response.data.message);

        // 9. AUTO-RESTART IF ENABLED
        // 9. AUTO-RESTART IF ENABLED
        if (autoListenRef.current && micPermissionGranted) {
          setTimeout(() => {
            startListening();
          }, 500);
        }
      } catch (error: any) {
        antMessage.error(
          error.response?.data?.error || "Failed to process your request"
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [
      currentConversation,
      addMessageToCurrentConversation,
      speak,
      autoListenEnabled,
      micPermissionGranted,
      // startListening,
    ]
  );
  const { isListening, startListening, stopListening } = useVoiceRecognition({
    onResult: handleVoiceResult,
    onError: (error) => {
      console.error("Voice recognition error:", error);
      if (error === "not-allowed" || error.includes("not-allowed")) {
        setPermissionError("Enable microphone access in Settings");
        setMicPermissionGranted(false);
      }
    },
    continuous: false,
    autoStop: true,
  });
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
      cancelSpeech();
    };
  }, [stopListening, cancelSpeech]);
  const handleMicrophoneClick = async () => {
    if (!micPermissionGranted) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        stream.getTracks().forEach((track) => track.stop());
        setMicPermissionGranted(true);
        setPermissionError("");

        // ✅ Set auto-listen FIRST, then start listening
        setAutoListenEnabled(true);
        autoListenRef.current = true;
        // ✅ Use setTimeout to ensure state updates before starting
        setTimeout(() => {
          startListening();
        }, 50);
      } catch (error) {
        console.error("Microphone permission denied:", error);
        setPermissionError("Enable microphone access in Settings");
        setMicPermissionGranted(false);
      }
    } else {
      // TOGGLE auto-listen mode
      if (isListening) {
        // Stop listening and disable auto-mode
        stopListening();
        setAutoListenEnabled(false);
        autoListenRef.current = false;
      } else {
        // Start listening and enable auto-mode
        setAutoListenEnabled(true);
        autoListenRef.current = true;

        // ✅ Use setTimeout to ensure state updates before starting
        setTimeout(() => {
          startListening();
        }, 50);
      }
    }
  };

  const handleClose = () => {
    stopListening();
    cancelSpeech();
    createNewConversation();
    setMicPermissionGranted(false);
    setAutoListenEnabled(false); // Disable auto-listening - session expired
    setPermissionError("");
  };

  const handleHistoryClick = () => {
    setShowHistory(true);
  };

  const handleLoadConversation = (conversation: Conversation) => {
    // loadConversation(conversation);
    setShowHistory(false);
  };

  const handleDeleteConversation = (conversationId: string) => {
    deleteConversation(conversationId);
  };

  const handleClearAllHistory = () => {
    clearAllConversations();
  };

  const isMobile = windowSize.width < 576;
  const buttonSize = isMobile ? 48 : 56;
  const buttonIconSize = isMobile ? "18px" : "20px";

  const totalMessages = conversations.reduce(
    (total, conv) => total + conv.messages.length,
    0
  );
  if (!isMounted) {
    return null;
  }

  return (
    <Layout
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated Background Pattern */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: 0.1,
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)",
          animation: "background-float 20s ease-in-out infinite",
        }}
      >
        {/* Only render particles after mount to avoid hydration mismatch */}
        {isMounted &&
          particles.map((particle, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: `${particle.width}px`,
                height: `${particle.height}px`,
                background: "rgba(99, 102, 241, 0.5)",
                borderRadius: "50%",
                top: `${particle.top}%`,
                left: `${particle.left}%`,
                animation: `particle-drift ${particle.duration}s linear infinite`,
                animationDelay: `${particle.delay}s`,
              }}
            />
          ))}
      </div>

      <Content>
        <Flex
          vertical
          justify="center"
          align="center"
          style={{
            minHeight: "100vh",
            padding: isMobile ? "20px 16px" : "40px 24px",
            position: "relative",
            zIndex: 1,
          }}
          suppressHydrationWarning
        >
          {/* Top Control Bar */}
          <div
            style={{
              position: "absolute",
              top: isMobile ? "20px" : "40px",
              left: 0,
              right: 0,
              paddingLeft: isMobile ? "16px" : "40px",
              paddingRight: isMobile ? "16px" : "40px",
              zIndex: 10,
            }}
            suppressHydrationWarning
          >
            <Flex justify="space-between" align="center">
              {/* Left Side - AI Voice Assistant Title */}
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
                  border: "1px solid rgba(99, 102, 241, 0.2)",
                  borderRadius: "20px",
                  padding: isMobile ? "8px 16px" : "10px 20px",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 4px 16px rgba(99, 102, 241, 0.1)",
                }}
                suppressHydrationWarning
              >
                <Space size="small" align="center">
                  <ThunderboltOutlined
                    style={{
                      color: "#818cf8",
                      fontSize: isMobile ? "16px" : "18px",
                    }}
                  />
                  <Text
                    style={{
                      color: "#e0e7ff",
                      fontSize: isMobile ? "13px" : "14px",
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                    }}
                  >
                    AI Voice Assistant
                  </Text>
                </Space>
              </div>

              {/* Right Side - History Button with Badge */}
              <Tooltip
                title="Conversation History"
                placement="bottom"
                styles={{
                  body: {
                    background:
                      "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                    color: "#ffffff",
                    border: "1px solid rgba(99, 102, 241, 0.5)",
                    boxShadow: "0 8px 24px rgba(99, 102, 241, 0.3)",
                    fontWeight: 600,
                  },
                }}
              >
                <Button
                  type="text"
                  icon={<HistoryOutlined />}
                  onClick={handleHistoryClick}
                  style={{
                    width: buttonSize,
                    height: buttonSize,
                    borderRadius: "16px",
                    background:
                      "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)",
                    border: "1px solid rgba(99, 102, 241, 0.3)",
                    color: "#a5b4fc",
                    fontSize: buttonIconSize,
                    backdropFilter: "blur(12px)",
                    boxShadow: "0 8px 24px rgba(99, 102, 241, 0.15)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative",
                  }}
                  className="control-button"
                >
                  {totalMessages > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "-6px",
                        right: "-6px",
                        background:
                          "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                        color: "#ffffff",
                        borderRadius: "50%",
                        minWidth: isMobile ? "20px" : "22px",
                        height: isMobile ? "20px" : "22px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: isMobile ? "10px" : "11px",
                        fontWeight: 700,
                        border: "2px solid #1a1a2e",
                        boxShadow: "0 2px 8px rgba(239, 68, 68, 0.5)",
                        padding: "0 4px",
                        animation:
                          totalMessages > 0
                            ? "badge-pop 0.3s ease-out"
                            : "none",
                      }}
                    >
                      {totalMessages > 99 ? "99+" : totalMessages}
                    </div>
                  )}
                </Button>
              </Tooltip>
            </Flex>
          </div>

          {/* Center - Voice Visualizer */}
          <Flex
            vertical
            align="center"
            justify="center"
            gap="large"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "100%",
              maxWidth: isMobile ? "90%" : "auto",
            }}
          >
            <VoiceVisualizer
              isActive={isListening || isSpeaking || isProcessing}
              size={getVisualizerSize()}
              isListening={isListening}
              isSpeaking={isSpeaking}
              isProcessing={isProcessing}
            />

            {/* Status Messages */}
            <Space direction="vertical" align="center" size="small">
              {permissionError && (
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)",
                    border: "1px solid rgba(239, 68, 68, 0.4)",
                    borderRadius: "12px",
                    padding: "10px 20px",
                    backdropFilter: "blur(12px)",
                    maxWidth: "300px",
                    textAlign: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#fecaca",
                      fontSize: isMobile ? "12px" : "14px",
                      fontWeight: 500,
                    }}
                  >
                    ⚠️ {permissionError}
                  </Text>
                </div>
              )}
            </Space>
          </Flex>

          {/* Bottom Control Buttons */}
          <Flex
            justify="center"
            align="center"
            gap="large"
            style={{
              position: "absolute",
              bottom: isMobile ? "20px" : "40px",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <Tooltip
              title={isListening ? "Stop Listening" : "Start Listening"}
              placement="bottom"
              styles={{
                body: {
                  background:
                    "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  color: "#ffffff",
                  border: "1px solid rgba(99, 102, 241, 0.5)",
                  boxShadow: "0 8px 24px rgba(99, 102, 241, 0.3)",
                  fontWeight: 600,
                },
              }}
            >
              <Button
                type="primary"
                size="large"
                icon={
                  !micPermissionGranted || !isListening ? (
                    <AudioMutedOutlined />
                  ) : (
                    <AudioOutlined />
                  )
                }
                onClick={handleMicrophoneClick}
                disabled={isProcessing || isSpeaking}
                style={{
                  width: buttonSize + 12,
                  height: buttonSize + 12,
                  borderRadius: "50%",
                  background: permissionError
                    ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                    : isListening
                    ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                    : "linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)",
                  border: permissionError
                    ? "2px solid rgba(239, 68, 68, 0.5)"
                    : isListening
                    ? "2px solid rgba(99, 102, 241, 0.6)"
                    : "2px solid rgba(99, 102, 241, 0.3)",
                  color: permissionError
                    ? "#ffffff"
                    : isListening
                    ? "#ffffff"
                    : "#a5b4fc",
                  fontSize: buttonIconSize,
                  backdropFilter: "blur(12px)",
                  boxShadow: isListening
                    ? "0 0 40px rgba(99, 102, 241, 0.6), 0 8px 24px rgba(99, 102, 241, 0.3)"
                    : "0 8px 24px rgba(99, 102, 241, 0.2)",
                  animation: isListening ? "mic-pulse 2s infinite" : "none",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                className="mic-button"
              />
            </Tooltip>

            <Tooltip
              title="New Conversation"
              placement="bottom"
              styles={{
                body: {
                  background:
                    "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  color: "#ffffff",
                  border: "1px solid rgba(99, 102, 241, 0.5)",
                  boxShadow: "0 8px 24px rgba(99, 102, 241, 0.3)",
                  fontWeight: 600,
                },
              }}
            >
              <Button
                type="text"
                size="large"
                icon={<CloseOutlined />}
                onClick={handleClose}
                style={{
                  width: buttonSize,
                  height: buttonSize,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)",
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                  color: "#a5b4fc",
                  fontSize: buttonIconSize,
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 8px 24px rgba(99, 102, 241, 0.15)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                className="control-button"
              />
            </Tooltip>
          </Flex>
        </Flex>
      </Content>

      <ChatHistory
        conversations={conversations}
        currentConversation={currentConversation}
        onLoadConversation={handleLoadConversation}
        onDeleteConversation={handleDeleteConversation}
        onNewConversation={() => {
          handleClose();
          setShowHistory(false);
        }}
        onClearAllHistory={handleClearAllHistory}
        visible={showHistory}
        onClose={() => setShowHistory(false)}
      />

      <style jsx>{`
        @keyframes mic-pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.6),
              0 8px 24px rgba(99, 102, 241, 0.3);
          }
          50% {
            box-shadow: 0 0 0 15px rgba(99, 102, 241, 0),
              0 8px 32px rgba(99, 102, 241, 0.4);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(99, 102, 241, 0),
              0 8px 24px rgba(99, 102, 241, 0.3);
          }
        }

        @keyframes status-pulse {
          0%,
          100% {
            opacity: 0.9;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.02);
          }
        }

        @keyframes badge-pop {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes background-float {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.1);
          }
        }

        @keyframes particle-drift {
          0% {
            transform: translate(0, 0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translate(100px, -100vh);
            opacity: 0;
          }
        }

        :global(.control-button:hover) {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 12px 32px rgba(99, 102, 241, 0.25) !important;
          border-color: rgba(99, 102, 241, 0.5) !important;
        }

        :global(.mic-button:hover:not(:disabled)) {
          transform: scale(1.08);
          box-shadow: 0 12px 40px rgba(99, 102, 241, 0.4) !important;
        }

        :global(.control-button:active),
        :global(.mic-button:active) {
          transform: scale(0.95);
        }

        :global(.mic-button:disabled) {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </Layout>
  );
};
