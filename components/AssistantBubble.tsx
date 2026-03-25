"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, Mic, Volume2, StopCircle } from "lucide-react";
import { useRouter } from "next/navigation"; // 🔥 Untuk Navigasi Otomatis

type Message = {
  role: 'user' | 'ai';
  content: string;
};

export default function AssistantBubble() {
  const router = useRouter(); // Hook Navigasi
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false); // State Mic
  const [isSpeaking, setIsSpeaking] = useState(false);   // State AI Bicara

  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'Halo! Mau cari course atau cek progres belajar?' }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Ref untuk Speech Recognition
  const recognitionRef = useRef<any>(null);

  // Scroll otomatis
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // --- 🎤 1. SETUP SPEECH RECOGNITION (Input Suara) ---
  useEffect(() => {
    if (typeof window !== "undefined") {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.lang = "id-ID"; // Bahasa Indonesia
            
            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                handleSendMessage(transcript); // Langsung kirim setelah selesai ngomong
            };

            recognitionRef.current.onend = () => setIsListening(false);
        }
    }
  }, []);

  const toggleMic = () => {
    if (isListening) {
        recognitionRef.current?.stop();
    } else {
        recognitionRef.current?.start();
        setIsListening(true);
    }
  };

  // --- 🔊 2. SETUP TEXT TO SPEECH (AI Ngomong) ---
  const speak = (text: string) => {
      window.speechSynthesis.cancel(); // Stop suara sebelumnya
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "id-ID";
      utterance.rate = 1.1; // Sedikit lebih cepat biar natural
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
  };

  // --- 🚀 3. FUNGSI KIRIM PESAN & HANDLE ACTION ---
  const handleSendMessage = async (manualInput?: string) => {
    const textToSend = manualInput || input;
    if (!textToSend.trim()) return;

    // UI Update
    const newHistory = [...messages, { role: 'user', content: textToSend }];
    setMessages(newHistory as Message[]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: newHistory }),
      });

      const data = await response.json(); // Data formatnya: { reply, action, targetUrl }

      if (response.ok) {
        setMessages((prev) => [...prev, { role: 'ai', content: data.reply }]);
        
        // A. AI NGOMONG
        speak(data.reply);

        // B. AI MELAKUKAN AKSI (Navigasi)
        if (data.action === "NAVIGATE" && data.targetUrl) {
            console.log("AI Navigating to:", data.targetUrl);
            // Delay sedikit biar user dengar suara AI dulu
            setTimeout(() => {
                router.push(data.targetUrl);
            }, 1000);
        }

      } else {
        setMessages((prev) => [...prev, { role: 'ai', content: "Maaf, server error." }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'ai', content: "Gagal terhubung." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4">
      
      {/* WINDOW CHAT */}
      {isOpen && (
        <div className="w-[360px] h-[520px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="bg-black p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                    {/* Animasi kalau AI lagi ngomong */}
                    {isSpeaking ? <Volume2 size={18} className="animate-pulse" /> : <Bot size={18} />}
                </div>
                <div>
                    <h3 className="font-bold text-sm">AiEdu Assistant</h3>
                    <p className="text-[10px] text-gray-400">
                        {isSpeaking ? "Sedang berbicara..." : "Online"}
                    </p>
                </div>
            </div>
            <button onClick={() => setIsOpen(false)}><X size={20} /></button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-[85%] p-3 text-sm rounded-2xl shadow-sm ${
                  msg.role === 'user'
                    ? "bg-black text-white self-end rounded-tr-none"
                    : "bg-white border border-gray-200 text-gray-800 self-start rounded-tl-none"
                }`}
              >
                {msg.content}
              </div>
            ))}
            {isLoading && (
               <div className="self-start text-xs text-gray-400 italic">Sedang memproses...</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-gray-200 bg-white flex gap-2 items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Silakan bicara..." : "Ketik atau bicara..."}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-all"
              disabled={isLoading || isListening}
            />
            
            {/* Tombol Mic */}
            <button 
              onClick={toggleMic}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                 isListening ? "bg-red-500 text-white animate-pulse" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
               {isListening ? <StopCircle size={18} /> : <Mic size={18} />}
            </button>

            {/* Tombol Kirim */}
            <button 
              onClick={() => handleSendMessage()}
              disabled={isLoading || (!input.trim() && !isListening)}
              className="bg-black text-white w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-800 disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full bg-black text-white shadow-xl hover:scale-105 transition-all flex items-center justify-center"
      >
        {isOpen ? <X size={24} /> : <Bot size={24} />}
      </button>
    </div>
  );
}