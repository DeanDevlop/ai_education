"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, Square, Loader2, Volume2, VolumeX } from "lucide-react";
import toast from "react-hot-toast";

interface VoiceChatProps {
  onSendMessage: (message: string) => Promise<string>; // Fungsi untuk kirim ke Gemini
}

export default function VoiceChat({ onSendMessage }: VoiceChatProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Ref untuk menyimpan instance SpeechRecognition
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Cek apakah browser support
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false; // Stop otomatis setelah ngomong
        recognitionRef.current.lang = "id-ID"; // Bahasa Indonesia
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onresult = async (event: any) => {
          const transcript = event.results[0][0].transcript;
          console.log("Kamu ngomong:", transcript);
          setIsListening(false);
          
          // Kirim ke Gemini
          await handleSendVoice(transcript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Error voice:", event.error);
          setIsListening(false);
          toast.error("Gagal mendengar suara. Coba lagi.");
        };
        
        recognitionRef.current.onend = () => {
             setIsListening(false);
        };
      }
    }
  }, []);

  const handleSendVoice = async (text: string) => {
    try {
      setLoading(true);
      // 1. Kirim teks hasil suara ke Gemini (lewat props)
      // Fungsi ini harus me-return TEXT jawaban dari AI
      const aiResponseText = await onSendMessage(text);
      
      setLoading(false);

      // 2. Suruh Browser Ngomong (TTS)
      speak(aiResponseText);

    } catch (error) {
      setLoading(false);
      toast.error("AI Gagal merespon.");
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Stop kalau ada suara sebelumnya
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "id-ID"; // Set Bahasa Indonesia
      utterance.rate = 1; // Kecepatan bicara (1 = normal)
      utterance.pitch = 1; // Nada bicara

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("Browser kamu tidak mendukung suara AI.");
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
      window.speechSynthesis.cancel(); // Stop AI ngomong kalau kita mau ngomong
    }
  };

  const stopSpeaking = () => {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
  }

  if (!recognitionRef.current) {
      return null; // Sembunyikan kalau browser gak support
  }

  return (
    <div className="fixed bottom-24 right-6 flex flex-col items-end gap-2 z-50">
      
      {/* Indikator AI Sedang Ngomong */}
      {isSpeaking && (
          <button 
            onClick={stopSpeaking}
            className="bg-red-500 text-white p-3 rounded-full shadow-lg animate-pulse hover:bg-red-600 transition"
            title="Stop AI Bicara"
          >
             <VolumeX size={24} />
          </button>
      )}

      {/* Tombol Mic Utama */}
      <button
        onClick={toggleListening}
        disabled={loading}
        className={`p-4 rounded-full shadow-xl transition-all duration-300 flex items-center justify-center
          ${isListening 
            ? "bg-red-500 text-white scale-110 ring-4 ring-red-200 animate-pulse" 
            : "bg-black text-white hover:bg-zinc-800 hover:scale-105"
          }
        `}
      >
        {loading ? (
          <Loader2 size={24} className="animate-spin" />
        ) : isListening ? (
          <Square size={24} fill="currentColor" />
        ) : (
          <Mic size={24} />
        )}
      </button>
      
      {/* Label Kecil */}
      {isListening && (
          <span className="bg-black text-white text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-widest">
              Mendengarkan...
          </span>
      )}
    </div>
  );
}