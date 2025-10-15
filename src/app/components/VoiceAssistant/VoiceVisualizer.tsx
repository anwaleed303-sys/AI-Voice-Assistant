import React from "react";

interface VoiceVisualizerProps {
  isActive: boolean;
  isListening?: boolean;
  isSpeaking?: boolean;
  isProcessing?: boolean;
  size?: "small" | "medium" | "large";
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  isActive,
  isListening = false,
  isSpeaking = false,
  isProcessing = false,
  size = "medium",
}) => {
  const sizeMap = {
    small: { orb: 100, waves: 140 },
    medium: { orb: 160, waves: 220 },
    large: { orb: 220, waves: 300 },
  };

  const sizes = sizeMap[size];

  const getOrbStyle = () => {
    if (!isActive) {
      return {
        background:
          "radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%)",
        boxShadow:
          "0 0 60px rgba(99, 102, 241, 0.1), inset 0 0 40px rgba(99, 102, 241, 0.05)",
        border: "2px solid rgba(99, 102, 241, 0.2)",
      };
    }

    if (isProcessing) {
      return {
        background:
          "radial-gradient(circle at 30% 30%, rgba(168, 85, 247, 0.4) 0%, rgba(124, 58, 237, 0.2) 100%)",
        boxShadow:
          "0 0 80px rgba(168, 85, 247, 0.5), 0 0 120px rgba(124, 58, 237, 0.3), inset 0 0 60px rgba(168, 85, 247, 0.2)",
        border: "2px solid rgba(168, 85, 247, 0.6)",
      };
    }

    if (isSpeaking) {
      return {
        background:
          "radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.5) 0%, rgba(124, 58, 237, 0.3) 100%)",
        boxShadow:
          "0 0 80px rgba(139, 92, 246, 0.6), 0 0 120px rgba(139, 92, 246, 0.4), inset 0 0 60px rgba(139, 92, 246, 0.2)",
        border: "2px solid rgba(139, 92, 246, 0.7)",
      };
    }

    return {
      background:
        "radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.5) 0%, rgba(79, 70, 229, 0.3) 100%)",
      boxShadow:
        "0 0 80px rgba(99, 102, 241, 0.6), 0 0 120px rgba(99, 102, 241, 0.4), inset 0 0 60px rgba(99, 102, 241, 0.2)",
      border: "2px solid rgba(99, 102, 241, 0.7)",
    };
  };

  return (
    <div
      style={{
        position: "relative",
        width: sizes.waves,
        height: sizes.waves,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Animated Wave Circles */}
      {isActive && (
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
          }}
        >
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`wave-circle wave-${i}`}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: `${70 + i * 15}%`,
                height: `${70 + i * 15}%`,
                borderRadius: "50%",
                border: `2px solid ${
                  isProcessing
                    ? "rgba(168, 85, 247, 0.4)"
                    : isSpeaking
                    ? "rgba(139, 92, 246, 0.4)"
                    : "rgba(99, 102, 241, 0.4)"
                }`,
                opacity: 0,
                animation: `wave-expand 3s ease-out infinite ${i * 0.6}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Main AI Orb */}
      <div
        style={{
          position: "relative",
          width: sizes.orb,
          height: sizes.orb,
          borderRadius: "50%",
          ...getOrbStyle(),
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          animation: "none",
          overflow: "hidden",
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        className="ai-orb"
      >
        {/* Glass Shine Effect */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "10%",
            width: "40%",
            height: "40%",
            background:
              "radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(10px)",
            pointerEvents: "none",
          }}
        />

        {/* Animated Shimmer */}
        {(isListening || isSpeaking) && (
          <>
            <div
              style={{
                position: "absolute",
                top: "20%",
                left: "-100%",
                width: "200%",
                height: "25%",
                background:
                  "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)",
                animation: "shimmer-slide 3s ease-in-out infinite",
                transform: "rotate(-15deg)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "55%",
                left: "-100%",
                width: "200%",
                height: "20%",
                background:
                  "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
                animation: "shimmer-slide 3.5s ease-in-out infinite 0.5s",
                transform: "rotate(-15deg)",
              }}
            />
          </>
        )}

        {/* AI Robot Face */}
        <div
          className="ai-robot"
          style={{
            position: "relative",
            width: "70%",
            height: "70%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "15%",
          }}
        >
          {/* Eyes */}
          <div
            style={{
              display: "flex",
              gap: "25%",
              width: "100%",
              justifyContent: "center",
              position: "relative",
              zIndex: 3,
            }}
          >
            <div
              className="eye"
              style={{
                position: "relative",
                width: "20%",
                aspectRatio: "1",
                background:
                  "radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.95), rgba(200, 200, 255, 0.8))",
                borderRadius: "50%",
                border: "2px solid rgba(255, 255, 255, 0.9)",
                boxShadow:
                  "0 0 15px rgba(99, 102, 241, 0.6), inset 0 2px 8px rgba(255, 255, 255, 0.5)",
              }}
            >
              <div
                className="pupil"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  // transform: "translate(-50%, -50%)",
                  width: isListening ? "55%" : "45%",
                  height: isListening ? "55%" : "45%",
                  background:
                    "radial-gradient(circle at 30% 30%, #3730a3, #1e1b4b)",
                  borderRadius: "50%",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.4)",
                  animation: isProcessing
                    ? "pupil-think 2s ease-in-out infinite"
                    : isListening
                    ? "pupil-dilate 2s ease-in-out infinite"
                    : isSpeaking
                    ? "pupil-speaking 1s ease-in-out infinite"
                    : "idle-look 5s ease-in-out infinite",
                  transition: "width 0.3s, height 0.3s",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "25%",
                  left: "30%",
                  width: "25%",
                  height: "25%",
                  background: "rgba(255, 255, 255, 0.9)",
                  borderRadius: "50%",
                  filter: "blur(1px)",
                }}
              />
              {isListening && (
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "100%",
                    height: "100%",
                    border: "2px solid rgba(99, 102, 241, 0.6)",
                    borderRadius: "50%",
                    animation: "attention-pulse 1.5s ease-out infinite",
                  }}
                />
              )}
            </div>
            <div
              className="eye"
              style={{
                position: "relative",
                width: "20%",
                aspectRatio: "1",
                background:
                  "radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.95), rgba(200, 200, 255, 0.8))",
                borderRadius: "50%",
                border: "2px solid rgba(255, 255, 255, 0.9)",
                boxShadow:
                  "0 0 15px rgba(99, 102, 241, 0.6), inset 0 2px 8px rgba(255, 255, 255, 0.5)",
              }}
            >
              <div
                className="pupil"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: isListening ? "55%" : "45%",
                  height: isListening ? "55%" : "45%",
                  background:
                    "radial-gradient(circle at 30% 30%, #3730a3, #1e1b4b)",
                  borderRadius: "50%",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.4)",
                  animation: isProcessing
                    ? "pupil-think 2s ease-in-out infinite"
                    : isListening
                    ? "pupil-dilate 2s ease-in-out infinite"
                    : isSpeaking
                    ? "pupil-speaking 1s ease-in-out infinite"
                    : "idle-look 5s ease-in-out infinite",
                  transition: "width 0.3s, height 0.3s",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "25%",
                  left: "30%",
                  width: "25%",
                  height: "25%",
                  background: "rgba(255, 255, 255, 0.9)",
                  borderRadius: "50%",
                  filter: "blur(1px)",
                }}
              />
              {isListening && (
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "100%",
                    height: "100%",
                    border: "2px solid rgba(99, 102, 241, 0.6)",
                    borderRadius: "50%",
                    animation: "attention-pulse 1.5s ease-out infinite",
                  }}
                />
              )}
            </div>
            {!isActive && (
              <>
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "27.5%",
                    width: "20%",
                    aspectRatio: "1",
                    background:
                      "linear-gradient(to bottom, rgba(139, 92, 246, 0.3), transparent)",
                    borderRadius: "50% 50% 0 0",
                    transformOrigin: "bottom",
                    animation: "blink 4s ease-in-out infinite",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: "27.5%",
                    width: "20%",
                    aspectRatio: "1",
                    background:
                      "linear-gradient(to bottom, rgba(139, 92, 246, 0.3), transparent)",
                    borderRadius: "50% 50% 0 0",
                    transformOrigin: "bottom",
                    animation: "blink 4s ease-in-out infinite 0.1s",
                  }}
                />
              </>
            )}
          </div>

          {/* Mouth */}
          <div
            style={{
              position: "relative",
              width: isSpeaking ? "45%" : isProcessing ? "35%" : "40%",
              height: isSpeaking ? "15%" : "20%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: isSpeaking
                ? "mouth-speak 0.3s ease-in-out infinite"
                : "none",
            }}
          >
            {isSpeaking ? (
              <>
                <div
                  style={{
                    position: "absolute",
                    width: "80%",
                    height: "3px",
                    background: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "2px",
                    top: "30%",
                    animation: "mouth-top-move 0.4s ease-in-out infinite",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    width: "80%",
                    height: "3px",
                    background: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "2px",
                    bottom: "30%",
                    animation: "mouth-bottom-move 0.4s ease-in-out infinite",
                  }}
                />
              </>
            ) : isProcessing ? (
              <div
                style={{
                  width: "100%",
                  height: "3px",
                  background: "rgba(255, 255, 255, 0.7)",
                  borderRadius: "2px",
                  animation: "thinking-mouth 2s ease-in-out infinite",
                }}
              />
            ) : isListening ? (
              <div
                style={{
                  width: "50%",
                  height: "3px",
                  background: "rgba(255, 255, 255, 0.8)",
                  borderRadius: "2px 2px 10px 10px",
                }}
              />
            ) : (
              <svg
                viewBox="0 0 60 30"
                style={{
                  width: "100%",
                  height: "100%",
                  filter: "drop-shadow(0 0 4px rgba(99, 102, 241, 0.4))",
                }}
              >
                <path
                  d="M 10 15 Q 30 25, 50 15"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.8)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>

          {/* State Indicators */}
          {isProcessing && (
            <div
              style={{
                position: "absolute",
                top: "-20%",
                right: "-15%",
                display: "flex",
                gap: "6px",
              }}
            >
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: "8px",
                    height: "8px",
                    background: "rgba(168, 85, 247, 0.9)",
                    borderRadius: "50%",
                    animation: `thinking-dot-bounce 1.4s ease-in-out infinite ${
                      i * 0.2
                    }s`,
                    boxShadow: "0 0 10px rgba(168, 85, 247, 0.6)",
                  }}
                />
              ))}
            </div>
          )}

          {isListening && (
            <>
              <div
                style={{
                  position: "absolute",
                  left: "-40%",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "30%",
                  height: "60%",
                }}
              >
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "100%",
                      height: `${20 + i * 15}%`,
                      border: "2px solid rgba(99, 102, 241, 0.6)",
                      borderRight: "none",
                      borderRadius: "50% 0 0 50%",
                      animation: `wave-in 2s ease-out infinite ${i * 0.3}s`,
                    }}
                  />
                ))}
              </div>
              <div
                style={{ position: "absolute", width: "120%", height: "120%" }}
              >
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      width: "4px",
                      height: "4px",
                      background: "rgba(99, 102, 241, 0.8)",
                      borderRadius: "50%",
                      top: "50%",
                      left: "50%",
                      transform: `translate(-50%, -50%) rotate(${
                        i * 30
                      }deg) translateY(-60px)`,
                      animation: `particle-float 2s ease-in-out infinite ${
                        i * 0.15
                      }s`,
                      boxShadow: "0 0 8px rgba(99, 102, 241, 0.6)",
                    }}
                  />
                ))}
              </div>
            </>
          )}

          {isSpeaking && (
            <>
              <div
                style={{
                  position: "absolute",
                  right: "-40%",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "35%",
                  height: "100%",
                }}
              >
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "100%",
                      height: `${30 + i * 20}%`,
                      border: "2px solid rgba(139, 92, 246, 0.7)",
                      borderLeft: "none",
                      borderRadius: "0 50% 50% 0",
                      animation: `wave-out 1.5s ease-out infinite ${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: "-25%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  gap: "4px",
                  alignItems: "flex-end",
                  height: "20%",
                }}
              >
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: "4px",
                      height: "100%",
                      background:
                        "linear-gradient(to top, rgba(139, 92, 246, 0.6), rgba(255, 255, 255, 0.9))",
                      borderRadius: "2px",
                      animation: `voice-bar-bounce 0.6s ease-in-out infinite ${
                        i * 0.1
                      }s`,
                    }}
                  />
                ))}
              </div>
            </>
          )}

          {!isActive && (
            <div
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(99, 102, 241, 0.1), transparent 70%)",
                animation: "breathing 3s ease-in-out infinite",
              }}
            />
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes wave-expand {
          0% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.8;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0;
          }
        }

        @keyframes orb-float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        @keyframes shimmer-slide {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }

        @keyframes blink {
          0%,
          96%,
          100% {
            transform: scaleY(0);
          }
          98% {
            transform: scaleY(1);
          }
        }

        @keyframes idle-look {
          0%,
          100% {
            transform: translate(-50%, -50%);
          }
          25% {
            transform: translate(-40%, -50%);
          }
          50% {
            transform: translate(-50%, -55%);
          }
          75% {
            transform: translate(-60%, -50%);
          }
        }

        @keyframes breathing {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }

        @keyframes pupil-dilate {
          0%,
          100% {
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) scale(0.9);
          }
        }

        @keyframes attention-pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
        }

        @keyframes wave-in {
          0% {
            transform: translateY(-50%) translateX(-20px) scale(0.8);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(-50%) translateX(0) scale(1);
            opacity: 0;
          }
        }

        @keyframes particle-float {
          0%,
          100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes pupil-speaking {
          0%,
          100% {
            transform: translate(-50%, -50%);
          }
          50% {
            transform: translate(-45%, -50%);
          }
        }

        @keyframes mouth-speak {
          0%,
          100% {
            transform: scaleY(0.8);
          }
          50% {
            transform: scaleY(1.2);
          }
        }

        @keyframes mouth-top-move {
          0%,
          100% {
            transform: translateY(0) scaleX(1);
          }
          50% {
            transform: translateY(-2px) scaleX(0.9);
          }
        }

        @keyframes mouth-bottom-move {
          0%,
          100% {
            transform: translateY(0) scaleX(1);
          }
          50% {
            transform: translateY(2px) scaleX(0.9);
          }
        }

        @keyframes wave-out {
          0% {
            transform: translateY(-50%) translateX(0) scale(0.8);
            opacity: 1;
          }
          100% {
            transform: translateY(-50%) translateX(15px) scale(1);
            opacity: 0;
          }
        }

        @keyframes voice-bar-bounce {
          0%,
          100% {
            transform: scaleY(0.4);
          }
          50% {
            transform: scaleY(1);
          }
        }

        @keyframes pupil-think {
          0%,
          100% {
            transform: translate(-50%, -50%);
          }
          25% {
            transform: translate(-60%, -45%);
          }
          50% {
            transform: translate(-40%, -55%);
          }
          75% {
            transform: translate(-55%, -50%);
          }
        }

        @keyframes thinking-mouth {
          0%,
          100% {
            transform: translateX(-2px);
          }
          50% {
            transform: translateX(2px);
          }
        }

        @keyframes thinking-dot-bounce {
          0%,
          60%,
          100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
