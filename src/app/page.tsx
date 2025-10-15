"use client";
import React, { useState, useEffect } from "react";
import { Layout, ConfigProvider } from "antd";
import { VoiceAssistant } from "./components/VoiceAssistant/VoiceAssistant";

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [particles, setParticles] = useState<any[]>([]);

  // Generate particles only on client side to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    setParticles(
      Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: 15 + Math.random() * 15,
        delay: Math.random() * 5,
        size: 2 + Math.random() * 3,
      }))
    );
  }, []);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#6366f1",
          borderRadius: 12,
          colorBgElevated: "rgba(17, 24, 39, 0.98)",
          colorText: "rgba(255, 255, 255, 0.95)",
          colorTextBase: "rgba(255, 255, 255, 0.95)",
          colorBgContainer: "rgba(31, 41, 55, 0.85)",
          colorBorder: "rgba(139, 92, 246, 0.2)",
        },
        components: {
          Drawer: {
            colorBgElevated: "rgba(17, 24, 39, 0.98)",
            colorBgMask: "rgba(0, 0, 0, 0.7)",
          },
          Select: {
            optionSelectedBg: "rgba(99, 102, 241, 0.15)",
            colorBgContainer: "rgba(31, 41, 55, 0.95)",
          },
          Button: {
            defaultBg: "rgba(99, 102, 241, 0.1)",
            defaultBorderColor: "rgba(99, 102, 241, 0.3)",
            defaultColor: "rgba(255, 255, 255, 0.9)",
          },
          Input: {
            colorBgContainer: "rgba(31, 41, 55, 0.8)",
          },
          DatePicker: {
            colorBgContainer: "rgba(31, 41, 55, 0.8)",
          },
        },
      }}
    >
      <Layout
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* AI Animated Background */}
        <div className="ai-background">
          {/* Gradient Mesh */}
          <div className="gradient-mesh">
            <div className="gradient-orb gradient-orb-1" />
            <div className="gradient-orb gradient-orb-2" />
            <div className="gradient-orb gradient-orb-3" />
            <div className="gradient-orb gradient-orb-4" />
          </div>

          {/* Grid Pattern */}
          <div className="grid-pattern" />

          {/* Neural Network Lines */}
          <svg className="neural-lines" width="100%" height="100%">
            <defs>
              <linearGradient
                id="lineGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="rgba(99, 102, 241, 0.6)" />
                <stop offset="100%" stopColor="rgba(139, 92, 246, 0.6)" />
              </linearGradient>
            </defs>
            <line
              className="neural-line"
              x1="10%"
              y1="20%"
              x2="30%"
              y2="80%"
              style={{ "--line-index": 0 } as React.CSSProperties}
            />
            <line
              className="neural-line"
              x1="25%"
              y1="10%"
              x2="45%"
              y2="60%"
              style={{ "--line-index": 1 } as React.CSSProperties}
            />
            <line
              className="neural-line"
              x1="40%"
              y1="30%"
              x2="60%"
              y2="70%"
              style={{ "--line-index": 2 } as React.CSSProperties}
            />
            <line
              className="neural-line"
              x1="55%"
              y1="15%"
              x2="75%"
              y2="55%"
              style={{ "--line-index": 3 } as React.CSSProperties}
            />
            <line
              className="neural-line"
              x1="70%"
              y1="25%"
              x2="90%"
              y2="75%"
              style={{ "--line-index": 4 } as React.CSSProperties}
            />
            <line
              className="neural-line"
              x1="15%"
              y1="60%"
              x2="35%"
              y2="90%"
              style={{ "--line-index": 5 } as React.CSSProperties}
            />
            <line
              className="neural-line"
              x1="30%"
              y1="50%"
              x2="50%"
              y2="95%"
              style={{ "--line-index": 6 } as React.CSSProperties}
            />
            <line
              className="neural-line"
              x1="45%"
              y1="65%"
              x2="65%"
              y2="85%"
              style={{ "--line-index": 7 } as React.CSSProperties}
            />
            <line
              className="neural-line"
              x1="60%"
              y1="55%"
              x2="80%"
              y2="90%"
              style={{ "--line-index": 8 } as React.CSSProperties}
            />
            <line
              className="neural-line"
              x1="75%"
              y1="45%"
              x2="95%"
              y2="95%"
              style={{ "--line-index": 9 } as React.CSSProperties}
            />
            <line
              className="neural-line"
              x1="20%"
              y1="40%"
              x2="50%"
              y2="45%"
              style={{ "--line-index": 10 } as React.CSSProperties}
            />
            <line
              className="neural-line"
              x1="50%"
              y1="35%"
              x2="85%"
              y2="40%"
              style={{ "--line-index": 11 } as React.CSSProperties}
            />
          </svg>

          {/* Floating Particles */}
          <div className="particle-field">
            {isMounted &&
              particles.map((particle) => (
                <div
                  key={particle.id}
                  className="particle"
                  style={
                    {
                      "--x": `${particle.x}%`,
                      "--y": `${particle.y}%`,
                      "--duration": `${particle.duration}s`,
                      "--delay": `${particle.delay}s`,
                      "--size": `${particle.size}px`,
                    } as React.CSSProperties
                  }
                />
              ))}
          </div>

          {/* Data Streams */}
          <div className="data-streams">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="data-stream"
                style={
                  {
                    "--stream-index": i,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
        </div>

        <VoiceAssistant />

        <style jsx>{`
          .ai-background {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(
                ellipse at top,
                rgba(99, 102, 241, 0.15) 0%,
                transparent 50%
              ),
              radial-gradient(
                ellipse at bottom,
                rgba(139, 92, 246, 0.15) 0%,
                transparent 50%
              ),
              #0a0e1a;
            overflow: hidden;
            z-index: 0;
          }

          /* Gradient Mesh Background */
          .gradient-mesh {
            position: absolute;
            width: 100%;
            height: 100%;
            filter: blur(100px);
            opacity: 0.7;
          }

          .gradient-orb {
            position: absolute;
            border-radius: 50%;
            animation: orb-float 20s ease-in-out infinite;
          }

          .gradient-orb-1 {
            width: 600px;
            height: 600px;
            background: radial-gradient(
              circle,
              rgba(99, 102, 241, 0.4) 0%,
              transparent 70%
            );
            top: -10%;
            left: -10%;
            animation-delay: 0s;
          }

          .gradient-orb-2 {
            width: 500px;
            height: 500px;
            background: radial-gradient(
              circle,
              rgba(139, 92, 246, 0.3) 0%,
              transparent 70%
            );
            bottom: -15%;
            right: -10%;
            animation-delay: 5s;
          }

          .gradient-orb-3 {
            width: 400px;
            height: 400px;
            background: radial-gradient(
              circle,
              rgba(168, 85, 247, 0.25) 0%,
              transparent 70%
            );
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            animation-delay: 10s;
          }

          .gradient-orb-4 {
            width: 350px;
            height: 350px;
            background: radial-gradient(
              circle,
              rgba(124, 58, 237, 0.2) 0%,
              transparent 70%
            );
            top: 30%;
            right: 20%;
            animation-delay: 15s;
          }

          /* Grid Pattern */
          .grid-pattern {
            position: absolute;
            width: 100%;
            height: 100%;
            background-image: linear-gradient(
                rgba(99, 102, 241, 0.1) 1px,
                transparent 1px
              ),
              linear-gradient(
                90deg,
                rgba(99, 102, 241, 0.1) 1px,
                transparent 1px
              );
            background-size: 50px 50px;
            opacity: 0.3;
            animation: grid-drift 30s linear infinite;
          }

          /* Neural Network Lines */
          .neural-lines {
            position: absolute;
            top: 0;
            left: 0;
            pointer-events: none;
            opacity: 0.4;
          }

          .neural-line {
            stroke: url(#lineGradient);
            stroke-width: 1;
            fill: none;
            animation: line-pulse 3s ease-in-out infinite;
            animation-delay: calc(var(--line-index) * 0.25s);
          }

          /* Floating Particles */
          .particle-field {
            position: absolute;
            width: 100%;
            height: 100%;
          }

          .particle {
            position: absolute;
            width: var(--size);
            height: var(--size);
            background: radial-gradient(
              circle,
              rgba(99, 102, 241, 0.8) 0%,
              rgba(139, 92, 246, 0.4) 100%
            );
            border-radius: 50%;
            top: var(--y);
            left: var(--x);
            animation: particle-float var(--duration) ease-in-out var(--delay)
              infinite;
            box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
          }

          /* Data Streams */
          .data-streams {
            position: absolute;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }

          .data-stream {
            position: absolute;
            width: 2px;
            height: 150px;
            background: linear-gradient(
              to bottom,
              transparent,
              rgba(99, 102, 241, 0.6),
              rgba(139, 92, 246, 0.6),
              transparent
            );
            left: calc(10% + var(--stream-index) * 15%);
            animation: stream-fall 8s linear infinite;
            animation-delay: calc(var(--stream-index) * 1.3s);
            opacity: 0.6;
            filter: blur(1px);
          }

          /* Animations */
          @keyframes orb-float {
            0%,
            100% {
              transform: translate(0, 0) scale(1);
            }
            33% {
              transform: translate(30px, -30px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
          }

          @keyframes grid-drift {
            0% {
              transform: translate(0, 0);
            }
            100% {
              transform: translate(50px, 50px);
            }
          }

          @keyframes line-pulse {
            0%,
            100% {
              opacity: 0.3;
              stroke-width: 1;
            }
            50% {
              opacity: 0.8;
              stroke-width: 2;
            }
          }

          @keyframes particle-float {
            0%,
            100% {
              transform: translate(0, 0) scale(1);
              opacity: 0.6;
            }
            25% {
              transform: translate(30px, -40px) scale(1.3);
              opacity: 1;
            }
            50% {
              transform: translate(-25px, 30px) scale(0.8);
              opacity: 0.4;
            }
            75% {
              transform: translate(20px, 20px) scale(1.2);
              opacity: 0.9;
            }
          }

          @keyframes stream-fall {
            0% {
              transform: translateY(-150px);
              opacity: 0;
            }
            10% {
              opacity: 0.6;
            }
            90% {
              opacity: 0.6;
            }
            100% {
              transform: translateY(100vh);
              opacity: 0;
            }
          }

          /* Responsive */
          @media (max-width: 768px) {
            .gradient-orb {
              filter: blur(80px);
            }

            .grid-pattern {
              background-size: 40px 40px;
              opacity: 0.2;
            }

            .particle {
              display: none;
            }

            .data-stream {
              width: 1px;
            }
          }

          @media (max-width: 480px) {
            .gradient-mesh {
              filter: blur(60px);
            }

            .neural-lines {
              display: none;
            }

            .data-streams {
              opacity: 0.4;
            }
          }
        `}</style>
      </Layout>
    </ConfigProvider>
  );
}
