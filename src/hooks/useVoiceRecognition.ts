// useVoiceRecognition.ts - FIXED VERSION
import { useState, useRef, useCallback } from "react";

// Add Web Speech API type declarations
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface UseVoiceRecognitionProps {
  language?: string;
  onResult: (transcript: string) => void;
  onError?: (error: string | Event) => void;
  continuous?: boolean;
  autoStop?: boolean;
}
interface UseVoiceRecognitionProps {
  language?: string;
  onResult: (transcript: string) => void;
  onError?: (error: string | Event) => void;
  continuous?: boolean;
  autoStop?: boolean;
}

export const useVoiceRecognition = ({
  language = "en-US",
  onResult,
  onError,
  continuous = false,
  autoStop = true,
}: UseVoiceRecognitionProps) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpeechTimeRef = useRef<number>(Date.now());
  const finalTranscriptRef = useRef<string>("");
  const isStopping = useRef<boolean>(false);

  const handleResult = useCallback(
    (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (final) {
        finalTranscriptRef.current += final + " ";
        setTranscript(finalTranscriptRef.current);
        setInterimTranscript("");
      } else {
        setInterimTranscript(interim);
      }

      // Reset silence timer when speech is detected
      lastSpeechTimeRef.current = Date.now();
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      // FIXED: Only set silence timer if NOT in continuous mode
      // In continuous mode, keep listening without stopping
      if (autoStop && !continuous) {
        silenceTimerRef.current = setTimeout(() => {
          const timeSinceLastSpeech = Date.now() - lastSpeechTimeRef.current;
          if (timeSinceLastSpeech >= 2000 && isListening) {
            if (finalTranscriptRef.current.trim()) {
              onResult(finalTranscriptRef.current.trim());
              finalTranscriptRef.current = ""; // Reset for next input
              setTranscript("");
            }
          }
        }, 2000);
      } else if (autoStop && continuous && final) {
        // FIXED: In continuous mode with autoStop, stop after detecting final speech
        // but keep listening for next input after result is sent
        silenceTimerRef.current = setTimeout(() => {
          const timeSinceLastSpeech = Date.now() - lastSpeechTimeRef.current;
          if (
            timeSinceLastSpeech >= 1500 &&
            isListening &&
            finalTranscriptRef.current.trim()
          ) {
            // Send result
            onResult(finalTranscriptRef.current.trim());
            finalTranscriptRef.current = ""; // Reset for next input
            setTranscript("");
            setInterimTranscript("");
          }
        }, 1500);
      }
    },
    [onResult, isListening, autoStop, continuous]
  );

  const handleEnd = useCallback(() => {
    if (isStopping.current) {
      isStopping.current = false;
      setIsListening(false);
      return;
    }

    setIsListening(false);
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    if (finalTranscriptRef.current.trim()) {
      onResult(finalTranscriptRef.current.trim());
      finalTranscriptRef.current = "";
      setTranscript("");
    }
  }, [onResult]);

  const handleError = useCallback(
    (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      onError?.(event.error);
    },
    [onError]
  );

  const startListening = useCallback(() => {
    if (
      typeof window === "undefined" ||
      !("webkitSpeechRecognition" in window)
    ) {
      onError?.("Speech recognition not supported");
      return;
    }

    if (isListening) {
      console.log("Already listening");
      return;
    }

    // @ts-ignore
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onresult = handleResult;
    recognition.onend = handleEnd;
    recognition.onerror = handleError;

    recognitionRef.current = recognition;
    setIsListening(true);
    setTranscript("");
    setInterimTranscript("");
    finalTranscriptRef.current = "";
    lastSpeechTimeRef.current = Date.now();
    isStopping.current = false;

    try {
      recognition.start();
    } catch (error) {
      console.error("Error starting recognition:", error);
      onError?.(error instanceof Error ? error.message : "Unknown error");
    }
  }, [
    language,
    handleResult,
    handleEnd,
    handleError,
    continuous,
    onError,
    isListening,
  ]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      isStopping.current = true;
      recognitionRef.current.stop();
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    setIsListening(false);
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
  };
};
