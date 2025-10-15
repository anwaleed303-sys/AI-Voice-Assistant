import React from "react";
import {
  Drawer,
  List,
  Button,
  Typography,
  Space,
  Empty,
  Popconfirm,
  Divider,
  Tag,
  Tooltip,
} from "antd";
import {
  DeleteOutlined,
  MessageOutlined,
  ClearOutlined,
  DownloadOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { Conversation } from "@/types";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const { Text, Title } = Typography;

interface ChatHistoryProps {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  onLoadConversation: (conversation: Conversation) => void;
  onDeleteConversation: (conversationId: string) => void;
  onNewConversation: () => void;
  onClearAllHistory: () => void;
  visible: boolean;
  onClose: () => void;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  conversations,
  currentConversation,
  onLoadConversation,
  onDeleteConversation,
  onClearAllHistory,
  visible,
  onClose,
}) => {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return new Date(date).toLocaleDateString();
  };

  const getLanguageName = (code?: string) => {
    const languages: Record<string, string> = {
      en: "English",
      ur: "Urdu",
      ar: "Arabic",
      pa: "Punjabi",
      zh: "Chinese",
      ja: "Japanese",
      ko: "Korean",
      ru: "Russian",
      es: "Spanish",
      fr: "French",
      de: "German",
    };
    return languages[code || "en"] || "English";
  };

  // Generate meaningful title from conversation content
  const getConversationTitle = (conversation: Conversation) => {
    // If custom title exists and is not default, use it
    if (conversation.title && conversation.title !== "New Conversation") {
      return truncateTitle(conversation.title);
    }

    // Generate from first AI response message
    const firstAIMessage = conversation.messages.find(
      (msg) => msg.role === "assistant"
    );
    if (firstAIMessage && firstAIMessage.content.trim()) {
      return truncateTitle(firstAIMessage.content);
    }

    // Fallback to first user message if no AI message found
    const firstUserMessage = conversation.messages.find(
      (msg) => msg.role === "user"
    );
    if (firstUserMessage && firstUserMessage.content.trim()) {
      return truncateTitle(firstUserMessage.content);
    }

    return "New Conversation";
  };

  // Truncate title to 5 words or 50 characters
  const truncateTitle = (text: string): string => {
    const words = text.trim().split(/\s+/);

    // Get first 5 words
    const fiveWords = words.slice(0, 5).join(" ");

    // If 5 words exceeds 50 characters, truncate to 50 chars
    if (fiveWords.length > 50) {
      return fiveWords.substring(0, 50) + "...";
    }

    // If original text is longer than 5 words, add ellipsis
    if (words.length > 5) {
      return fiveWords + "...";
    }

    return fiveWords;
  };

  // Group conversations by date
  const groupConversationsByDate = () => {
    const groups: Record<string, Conversation[]> = {
      Today: [],
      Yesterday: [],
      "This Week": [],
      "This Month": [],
      Older: [],
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    conversations.forEach((conv) => {
      const convDate = new Date(conv.updatedAt);
      const convDateOnly = new Date(
        convDate.getFullYear(),
        convDate.getMonth(),
        convDate.getDate()
      );

      if (convDateOnly.getTime() === today.getTime()) {
        groups.Today.push(conv);
      } else if (convDateOnly.getTime() === yesterday.getTime()) {
        groups.Yesterday.push(conv);
      } else if (convDate >= weekAgo) {
        groups["This Week"].push(conv);
      } else if (convDate >= monthAgo) {
        groups["This Month"].push(conv);
      } else {
        groups.Older.push(conv);
      }
    });

    return groups;
  };

  // Sanitize filename - remove special characters and keep it meaningful
  const sanitizeFilename = (title: string): string => {
    return title
      .replace(/\.\.\.$/, "")
      .replace(/[^a-z0-9\s-]/gi, "")
      .replace(/\s+/g, "_") // Replace spaces with underscores
      .toLowerCase()
      .substring(0, 50); // Limit length
  };

  const exportToPDF = async (
    conversation: Conversation,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    // DEBUG: Log all messages to console
    // console.log("=== PDF EXPORT DEBUG ===");
    // console.log("Total messages:", conversation.messages.length);
    // conversation.messages.forEach((msg, index) => {
    //   console.log(`Message ${index}:`, {
    //     role: msg.role,
    //     content: msg.content.substring(0, 50) + "...",
    //     timestamp: msg.timestamp,
    //   });
    // });
    // console.log("========================");

    // COUNT MESSAGE TYPES
    const userMessages = conversation.messages.filter((m) => m.role === "user");
    const assistantMessages = conversation.messages.filter(
      (m) => m.role === "assistant"
    );

    console.log("User messages:", userMessages.length);
    console.log("Assistant messages:", assistantMessages.length);

    // IF NO USER MESSAGES, SHOW ALERT
    if (userMessages.length === 0) {
      alert(
        "⚠️ No user messages found in this conversation. Only AI responses are stored. Please check your message storage."
      );
      return;
    }

    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.style.top = "0";
    tempContainer.style.width = "800px";
    tempContainer.style.padding = "40px";
    tempContainer.style.backgroundColor = "#ffffff";
    tempContainer.style.fontFamily = "Arial, sans-serif";
    document.body.appendChild(tempContainer);

    const pdfTitle = getConversationTitle(conversation);
    const createdDate = new Date(conversation.createdAt).toLocaleString();

    let htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #000;">
      <h1 style="color: #6366f1; margin-bottom: 10px; font-size: 24px;">${pdfTitle}</h1>
      <p style="color: #666; font-size: 12px; margin: 5px 0;">Date: ${createdDate}</p>
      <p style="color: #666; font-size: 12px; margin: 5px 0;">Language: ${getLanguageName(
        conversation.primaryLanguage
      )}</p>
      <p style="color: #666; font-size: 12px; margin: 5px 0 30px 0;">Messages: ${
        conversation.messages.length
      }</p>
      <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
  `;

    // RENDER ALL MESSAGES (BOTH USER AND AI) - sorted by timestamp
    const sortedMessages = [...conversation.messages].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    sortedMessages.forEach((message, index) => {
      const timestamp = new Date(message.timestamp).toLocaleString();
      const languageText = message.language
        ? getLanguageName(message.language)
        : "";

      const isRTL = ["ur", "ar"].includes(message.language || "");
      const directionStyle = isRTL ? "direction: rtl; text-align: right;" : "";

      if (message.role === "user") {
        htmlContent += `
      <div style="margin-bottom: 20px; page-break-inside: avoid;">
        <h3 style="color: #3b82f6; font-size: 14px; margin-bottom: 8px; font-weight: bold; ${directionStyle}">
          ❓ User Question:
        </h3>
        <p style="color: #000; font-size: 13px; line-height: 1.6; margin: 8px 0; white-space: pre-wrap; word-wrap: break-word; background-color: #f0f4ff; padding: 12px; border-radius: 6px; ${directionStyle}">
          ${message.content}
        </p>
        <p style="color: #999; font-size: 10px; margin-top: 5px; ${directionStyle}">
          ${timestamp} ${languageText ? `| ${languageText}` : ""}
        </p>
      </div>
    `;
      } else if (message.role === "assistant") {
        htmlContent += `
      <div style="margin-bottom: 25px; page-break-inside: avoid;">
        <h3 style="color: #8b5cf6; font-size: 14px; margin-bottom: 8px; font-weight: bold; ${directionStyle}">
          💬 AI Response:
        </h3>
        <p style="color: #000; font-size: 13px; line-height: 1.6; margin: 8px 0; white-space: pre-wrap; word-wrap: break-word; background-color: #f5f3ff; padding: 12px; border-radius: 6px; ${directionStyle}">
          ${message.content}
        </p>
        <p style="color: #999; font-size: 10px; margin-top: 5px; ${directionStyle}">
          ${timestamp} ${languageText ? `| ${languageText}` : ""}
        </p>
        <hr style="border: 0.5px solid #f3f4f6; margin-top: 15px;">
      </div>
    `;
      }
    });

    htmlContent += `</div>`;
    tempContainer.innerHTML = htmlContent;

    try {
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      document.body.removeChild(tempContainer);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const sanitizedTitle = sanitizeFilename(pdfTitle);
      const fileName = `${sanitizedTitle}_${Date.now()}_${conversation.id.substring(
        0,
        8
      )}.pdf`;

      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      if (tempContainer.parentNode) {
        document.body.removeChild(tempContainer);
      }
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const groupedConversations = groupConversationsByDate();

  return (
    <Drawer
      title={
        <Space direction="vertical" size={0} style={{ width: "100%" }}>
          <Title level={4} style={{ margin: 0, color: "#e0e7ff" }}>
            Conversation History
          </Title>
          <Text style={{ color: "#a5b4fc", fontSize: "13px" }}>
            {conversations.length} conversation
            {conversations.length !== 1 ? "s" : ""}
          </Text>
        </Space>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={400}
      styles={{
        header: {
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          borderBottom: "1px solid rgba(99, 102, 241, 0.2)",
        },
        body: {
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          padding: "16px",
        },
      }}
      extra={
        <Space>
          {conversations.length > 0 && (
            <Popconfirm
              title="Clear all history?"
              description="This will permanently delete all conversations."
              onConfirm={() => {
                onClearAllHistory();
                onClose();
              }}
              okText="Clear All"
              cancelText="Cancel"
              okButtonProps={{
                danger: true,
                style: {
                  background:
                    "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  border: "none",
                },
              }}
            >
              <Button
                type="text"
                icon={<ClearOutlined />}
                danger
                style={{
                  color: "#f87171",
                  borderRadius: "8px",
                }}
              >
                Clear
              </Button>
            </Popconfirm>
          )}
        </Space>
      }
    >
      {conversations.length === 0 ? (
        <Empty
          description={
            <Space direction="vertical" align="center">
              <Text style={{ color: "#a5b4fc" }}>No conversations yet</Text>
            </Space>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{
            marginTop: "60px",
          }}
        />
      ) : (
        <div>
          {Object.entries(groupedConversations).map(([dateGroup, convs]) => {
            if (convs.length === 0) return null;

            return (
              <div key={dateGroup} style={{ marginBottom: "24px" }}>
                <Divider
                  orientation="left"
                  style={{
                    borderColor: "rgba(99, 102, 241, 0.2)",
                    margin: "16px 0 12px 0",
                  }}
                >
                  <Text
                    style={{
                      color: "#818cf8",
                      fontSize: "12px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {dateGroup}
                  </Text>
                </Divider>

                <List
                  dataSource={convs}
                  renderItem={(conversation) => {
                    const isActive =
                      currentConversation?.id === conversation.id;
                    return (
                      <List.Item
                        style={{
                          padding: "16px",
                          marginBottom: "12px",
                          background: isActive
                            ? "linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)"
                            : "linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)",
                          border: isActive
                            ? "1px solid rgba(99, 102, 241, 0.4)"
                            : "1px solid rgba(99, 102, 241, 0.1)",
                          borderRadius: "12px",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          backdropFilter: "blur(12px)",
                        }}
                        className="conversation-item"
                        onClick={() => {
                          onLoadConversation(conversation);
                          onClose();
                        }}
                      >
                        <Space
                          direction="vertical"
                          style={{ width: "100%" }}
                          size="small"
                        >
                          <Space
                            style={{
                              width: "100%",
                              justifyContent: "space-between",
                            }}
                          >
                            <Space style={{ flex: 1, minWidth: 0 }}>
                              <MessageOutlined
                                style={{ color: "#818cf8", fontSize: "16px" }}
                              />
                              <Text
                                style={{
                                  color: "#e0e7ff",
                                  fontWeight: isActive ? 600 : 400,
                                  fontSize: "14px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {getConversationTitle(conversation)}
                              </Text>
                            </Space>
                            <Space>
                              <Tooltip
                                title="Export PDF"
                                placement="top"
                                color="#6366f1"
                              >
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<DownloadOutlined />}
                                  onClick={(e) => exportToPDF(conversation, e)}
                                  style={{
                                    color: "#818cf8",
                                  }}
                                />
                              </Tooltip>
                              <Popconfirm
                                title="Delete conversation?"
                                description="This action cannot be undone."
                                onConfirm={(e) => {
                                  e?.stopPropagation();
                                  onDeleteConversation(conversation.id);
                                }}
                                okText="Delete"
                                cancelText="Cancel"
                                okButtonProps={{
                                  danger: true,
                                  style: {
                                    background:
                                      "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                                    border: "none",
                                  },
                                }}
                              >
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<DeleteOutlined />}
                                  danger
                                  onClick={(e) => e.stopPropagation()}
                                  style={{
                                    color: "#f87171",
                                  }}
                                />
                              </Popconfirm>
                            </Space>
                          </Space>

                          <Space
                            style={{
                              width: "100%",
                              justifyContent: "space-between",
                              flexWrap: "wrap",
                            }}
                          >
                            <Space size="small">
                              <Text
                                style={{ color: "#a5b4fc", fontSize: "12px" }}
                              >
                                {conversation.messages.length} message
                                {conversation.messages.length !== 1 ? "s" : ""}
                              </Text>
                              {conversation.primaryLanguage && (
                                <Tag
                                  icon={<GlobalOutlined />}
                                  style={{
                                    background:
                                      "linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)",
                                    border: "1px solid rgba(99, 102, 241, 0.3)",
                                    color: "#a5b4fc",
                                    fontSize: "11px",
                                    padding: "0 6px",
                                  }}
                                >
                                  {getLanguageName(
                                    conversation.primaryLanguage
                                  )}
                                </Tag>
                              )}
                            </Space>
                            <Text
                              style={{ color: "#64748b", fontSize: "12px" }}
                            >
                              {formatDate(conversation.updatedAt)}
                            </Text>
                          </Space>
                        </Space>
                      </List.Item>
                    );
                  }}
                />
              </div>
            );
          })}
        </div>
      )}

      <style jsx global>{`
        .conversation-item:hover {
          background: linear-gradient(
            135deg,
            rgba(99, 102, 241, 0.15) 0%,
            rgba(139, 92, 246, 0.15) 100%
          ) !important;
          border-color: rgba(99, 102, 241, 0.3) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.15);
        }
      `}</style>
    </Drawer>
  );
};
