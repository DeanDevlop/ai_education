"use client";

import { useState } from "react";
import { Star, Loader2, MessageSquare } from "lucide-react";
import { submitReview } from "@/app/actions/submit-review";
import toast from "react-hot-toast";

interface ReviewModalProps {
  courseId: string;
  existingReview?: { rating: number; comment: string | null } | null;
}

export default function ReviewForm({ courseId, existingReview }: ReviewModalProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Minimal kasih bintang 1 dong! ⭐");
      return;
    }

    setLoading(true);
    const result = await submitReview(courseId, rating, comment);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(existingReview ? "Ulasan diperbarui!" : "Terima kasih atas ulasannya! 🎉");
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mt-8">
      <h3 className="text-lg font-black uppercase italic tracking-tighter mb-4 flex items-center gap-2">
        <MessageSquare size={20} className="text-blue-500"/>
        {existingReview ? "Edit Ulasanmu" : "Tulis Ulasan"}
      </h3>

      {/* BINTANG INTERAKTIF */}
      <div className="flex items-center gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="transition-transform hover:scale-110 focus:outline-none"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(rating)}
          >
            <Star
              size={32}
              className={`transition-colors ${
                star <= (hover || rating)
                  ? "fill-amber-400 text-amber-400"
                  : "text-slate-200"
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm font-bold text-slate-400">
          {rating > 0 ? `${rating}/5` : "Pilih Bintang"}
        </span>
      </div>

      {/* INPUT KOMENTAR */}
      <textarea
        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all resize-none"
        rows={3}
        placeholder="Bagaimana pendapatmu tentang materi ini? (Opsional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      {/* TOMBOL SUBMIT */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-black text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          {loading ? "Menyimpan..." : "Kirim Ulasan"}
        </button>
      </div>
    </div>
  );
}