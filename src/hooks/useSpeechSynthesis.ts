// useSpeechSynthesis.ts
import { useState, useEffect, useCallback, useRef } from "react";

interface UseSpeechSynthesisProps {
  language?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export const useSpeechSynthesis = ({
  language = "auto",
  rate = 1,
  pitch = 1,
  volume = 1,
}: UseSpeechSynthesisProps = {}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load available voices
  useEffect(() => {
    if (!window.speechSynthesis) {
      setIsSupported(false);
      return;
    }

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();

    // Chrome needs this event listener
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Detect language from text
  const detectLanguage = useCallback((text: string): string => {
    // Urdu/Arabic detection
    if (/[\u0600-\u06FF]/.test(text)) {
      // More specific: check for Urdu-specific characters
      if (
        /[\u0679\u067E\u0686\u0688\u0691\u0698\u06A9\u06AF\u06BA\u06BE\u06CC]/.test(
          text
        )
      ) {
        return "ur-PK";
      }
      return "ar-SA";
    }

    // Hindi detection
    if (/[\u0900-\u097F]/.test(text)) {
      return "hi-IN";
    }

    // Chinese detection
    if (/[\u4E00-\u9FFF]/.test(text)) {
      return "zh-CN";
    }

    // Japanese detection
    if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) {
      return "ja-JP";
    }

    // Korean detection
    if (/[\uAC00-\uD7AF]/.test(text)) {
      return "ko-KR";
    }

    // Default to English or browser language
    return navigator.language || "en-US";
  }, []);

  // Find best voice for language
  const findVoiceForLanguage = useCallback(
    (lang: string): SpeechSynthesisVoice | null => {
      if (voices.length === 0) return null;

      // Extract language code (e.g., 'ur' from 'ur-PK')
      const langCode = lang.split("-")[0];

      // Try exact match first
      let voice = voices.find((v) => v.lang === lang);

      // Try language code match
      if (!voice) {
        voice = voices.find((v) => v.lang.startsWith(langCode));
      }

      // Try to find native voice
      if (!voice) {
        voice = voices.find(
          (v) => v.lang.startsWith(langCode) && v.localService
        );
      }

      // Fallback to any voice for that language
      if (!voice) {
        voice = voices.find((v) => v.lang.includes(langCode));
      }

      return voice || null;
    },
    [voices]
  );

  const speak = useCallback(
    (
      text: string,
      options?: {
        language?: string;
        rate?: number;
        pitch?: number;
        volume?: number;
        onEnd?: () => void;
        onError?: (error: SpeechSynthesisErrorEvent) => void;
      }
    ): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (!isSupported || !text.trim()) {
          console.warn("Speech synthesis not supported or empty text");
          resolve();
          return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Detect language if auto
        const targetLanguage = options?.language || language;
        const detectedLang =
          targetLanguage === "auto" ? detectLanguage(text) : targetLanguage;

        // Find appropriate voice
        const voice = findVoiceForLanguage(detectedLang);
        if (voice) {
          utterance.voice = voice;
          utterance.lang = voice.lang;
        } else {
          utterance.lang = detectedLang;
        }

        // Set speech parameters
        utterance.rate = options?.rate || rate;
        utterance.pitch = options?.pitch || pitch;
        utterance.volume = options?.volume || volume;

        // Event handlers
        utterance.onstart = () => {
          setIsSpeaking(true);
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          options?.onEnd?.();
          resolve(); // Resolve promise when speech ends
        };

        utterance.onerror = (error: SpeechSynthesisErrorEvent) => {
          console.error("Speech synthesis error:", error);
          setIsSpeaking(false);
          options?.onError?.(error);
          reject(error); // Reject promise on error
        };

        utteranceRef.current = utterance;

        // Small delay to ensure proper initialization
        setTimeout(() => {
          window.speechSynthesis.speak(utterance);
        }, 100);
      });
    },
    [
      isSupported,
      language,
      rate,
      pitch,
      volume,
      detectLanguage,
      findVoiceForLanguage,
    ]
  );

  const cancel = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const pause = useCallback(() => {
    if (window.speechSynthesis && isSpeaking) {
      window.speechSynthesis.pause();
    }
  }, [isSpeaking]);

  const resume = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.resume();
    }
  }, []);

  return {
    speak,
    cancel,
    pause,
    resume,
    isSpeaking,
    isSupported,
    voices,
  };
};
