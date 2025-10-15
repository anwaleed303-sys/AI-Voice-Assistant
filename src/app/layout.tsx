import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { AntdCompatibilityProvider } from "@/lib/antd-compatibility";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Voice Assistant - Seamless Voice Interactions",
  description:
    "Experience seamless AI-powered voice interactions with automatic speech recognition, conversation history, and multilingual support",
  keywords:
    "AI, voice assistant, speech recognition, multilingual, Groq, LLM, conversation history",
  authors: [{ name: "AI Voice Assistant" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AntdRegistry>
          <AntdCompatibilityProvider>{children}</AntdCompatibilityProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
