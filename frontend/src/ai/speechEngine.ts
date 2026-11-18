/**
 * @file speechEngine.ts
 * @description Native In-Browser Speech & Voice AI Engine (Role #25: Audio & Speech AI Engineer).
 * Implements bidirectional Voice-to-Text (STT) and Text-to-Speech (TTS)
 * running 100% natively in the browser via standard Web Speech APIs.
 */

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
}

export class SpeechEngine {
  private static instance: SpeechEngine;
  private recognition: any = null;
  private isListening: boolean = false;
  private synthesisVoice: SpeechSynthesisVoice | null = null;

  private constructor() {
    this.initRecognition();
    this.initSynthesis();
  }

  public static getInstance(): SpeechEngine {
    if (!SpeechEngine.instance) {
      SpeechEngine.instance = new SpeechEngine();
    }
    return SpeechEngine.instance;
  }

  private initRecognition(): void {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
    }
  }

  private initSynthesis(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.onvoiceschanged = () => {
      const voices = window.speechSynthesis.getVoices();
      this.synthesisVoice = voices.find((v) => v.lang.startsWith('en') && v.name.includes('Natural')) || voices[0] || null;
    };
  }

  /**
   * Starts listening to user voice speech.
   */
  public startListening(
    onResult: (result: SpeechRecognitionResult) => void,
    onError: (error: string) => void
  ): boolean {
    if (!this.recognition) {
      onError('SpeechRecognition API is not supported in this browser environment.');
      return false;
    }

    if (this.isListening) {
      this.recognition.stop();
    }

    this.recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      const isFinal = event.results[current].isFinal;
      const confidence = event.results[current][0].confidence || 0.95;

      onResult({ transcript, isFinal, confidence });
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (err: any) {
      onError(err.message);
      return false;
    }
  }

  /**
   * Stops listening.
   */
  public stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Synthesizes text to audio speech using Web Speech API.
   */
  public speak(text: string, onEnd?: () => void): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    if (this.synthesisVoice) {
      utterance.voice = this.synthesisVoice;
    }
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    if (onEnd) {
      utterance.onend = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  }

  /**
   * Stops ongoing audio speech playback.
   */
  public stopSpeaking(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const speechEngine = SpeechEngine.getInstance();
