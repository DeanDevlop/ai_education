"use client";

import { useState } from "react";
import { CheckCircle2, ChevronRight, Trophy, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

interface Question {
  id: string;
  text: string;
  options: string[];
  answer: string;
}

export default function QuizComponent({ questions }: { questions: Question[] }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const handleNext = () => {
    if (!selectedOption) {
      toast.error("Pilih salah satu jawaban!");
      return;
    }

    // Cek Jawaban
    if (selectedOption === questions[currentStep].answer) {
      setScore((prev) => prev + 1);
    }

    if (currentStep + 1 < questions.length) {
      setCurrentStep(currentStep + 1);
      setSelectedOption(null);
    } else {
      setShowResult(true);
    }
  };

  if (showResult) {
    const finalScore = Math.round((score / questions.length) * 100);
    const passed = finalScore >= 70;

    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center space-y-6 shadow-sm">
        <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center ${passed ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
          {passed ? <Trophy size={40} /> : <AlertCircle size={40} />}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{passed ? "Selamat! Kamu Lulus" : "Yah, Belum Lulus"}</h2>
          <p className="text-gray-500 mt-2">Skor kamu: <span className="font-bold text-black">{finalScore}</span> / 100</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition"
        >
          {passed ? "Lanjut ke Sertifikat" : "Coba Lagi"}
        </button>
      </div>
    );
  }

  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
          <span>Pertanyaan {currentStep + 1} dari {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-black transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 mb-6 leading-relaxed">
          {questions[currentStep].text}
        </h3>

        <div className="space-y-3">
          {questions[currentStep].options.map((option) => (
            <button
              key={option}
              onClick={() => setSelectedOption(option)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center group
                ${selectedOption === option 
                  ? "border-black bg-gray-50 text-black shadow-sm" 
                  : "border-gray-100 hover:border-gray-300 text-gray-600"}`}
            >
              <span className="text-sm font-medium">{option}</span>
              {selectedOption === option && <CheckCircle2 size={18} className="text-black" />}
            </button>
          ))}
        </div>

        <button 
          onClick={handleNext}
          className="w-full mt-8 py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2 group"
        >
          {currentStep + 1 === questions.length ? "Selesaikan Quiz" : "Lanjut"}
          <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}