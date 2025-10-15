import React from "react";
import { ConfigProvider } from "antd";

// Suppress React 19 compatibility warnings
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  if (typeof args[0] === "string" && args[0].includes("antd: compatible")) {
    return;
  }
  originalConsoleError.apply(console, args);
};

export const AntdCompatibilityProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1677ff",
          borderRadius: 8,
        },
      }}
      // Additional compatibility props
      wave={{ disabled: true }} // Disable wave effect that causes warnings
    >
      {children}
    </ConfigProvider>
  );
};
