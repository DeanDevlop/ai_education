"use client";

import { useState } from "react";
import { ThumbsUp } from "lucide-react";
import { toggleUpvote } from "@/app/actions/vote";
import toast from "react-hot-toast";

export default function VoteButton({ 
  projectId, 
  userId, 
  initialCount, 
  hasVoted 
}: { 
  projectId: string; 
  userId: string; 
  initialCount: number; 
  hasVoted: boolean;
}) {
  const [voted, setVoted] = useState(hasVoted);
  const [count, setCount] = useState(initialCount);

  const handleVote = async () => {
    if (!userId) return toast.error("Silakan login untuk mendukung!");
    
    // Optimistic Update (Biar terasa instan)
    setVoted(!voted);
    setCount(voted ? count - 1 : count + 1);

    const res = await toggleUpvote(projectId, userId);
    if (res.error) {
      // Rollback kalau gagal
      setVoted(voted);
      setCount(count);
      toast.error(res.error);
    }
  };

  return (
    <button 
      onClick={handleVote}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border
        ${voted 
          ? "bg-black text-white border-black shadow-md" 
          : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"}`}
    >
      <ThumbsUp size={14} className={voted ? "fill-white" : ""} />
      {count} Dukungan
    </button>
  );
}