"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Send, Trash2, User } from "lucide-react";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { id as ind } from "date-fns/locale"; // Biar waktunya Bahasa Indonesia

export default function CommentSection({ projectId }: { projectId: string }) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // 1. Cek User & Ambil Komentar saat pertama buka
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    
    getUser();
    fetchComments();
  }, [projectId]);

  // Fungsi Ambil Komentar
  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        profiles ( name )
      `)
      .eq("project_id", projectId)
      .order("created_at", { ascending: false }); // Komentar baru di atas

    if (error) console.error("Gagal ambil komen:", error);
    else setComments(data || []);
  };

  // Fungsi Kirim Komentar
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!user) return toast.error("Login dulu untuk komentar!");

    setLoading(true);
    try {
      const { error } = await supabase.from("comments").insert({
        content: newComment,
        project_id: projectId,
        user_id: user.id,
      });

      if (error) throw error;

      setNewComment("");
      toast.success("Komentar terkirim!");
      fetchComments(); // Refresh list komentar
    } catch (error) {
      toast.error("Gagal mengirim komentar");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi Hapus Komentar
  const handleDelete = async (commentId: string) => {
    if (!confirm("Hapus komentar ini?")) return;

    const { error } = await supabase.from("comments").delete().eq("id", commentId);
    
    if (error) toast.error("Gagal hapus");
    else {
      toast.success("Dihapus");
      fetchComments();
    }
  };

  return (
    <div className="space-y-8 pt-10 border-t-2 border-slate-50">
      <h3 className="text-lg font-black uppercase italic tracking-widest flex items-center gap-2">
        Diskusi ({comments.length})
      </h3>

      {/* Form Input */}
      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Tulis pendapatmu..."
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-black outline-none transition-colors"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="bg-black text-white p-3 rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
      ) : (
        <div className="bg-slate-50 p-4 rounded-xl text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
          Login untuk bergabung dalam diskusi
        </div>
      )}

      {/* List Komentar */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-slate-400 text-xs italic">Belum ada komentar. Jadilah yang pertama!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 group">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <User size={14} />
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-slate-900">
                      {comment.profiles?.name || "Unknown User"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {/* Format waktu (misal: 5 menit yang lalu) */}
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ind })}
                    </span>
                  </div>
                  
                  {/* Tombol Hapus (Hanya muncul kalau ini komentar user sendiri) */}
                  {user && user.id === comment.user_id && (
                    <button 
                      onClick={() => handleDelete(comment.id)}
                      className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                
                <p className="text-sm text-slate-600 leading-relaxed">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}