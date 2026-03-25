"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import CommunityCard from "@/components/CommunityCard";
import { Users, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Ambil data komunitas dari Supabase
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const { data, error } = await supabase
          .from("communities")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setCommunities(data || []);
      } catch (error) {
        console.error("Error fetching communities:", error);
        toast.error("Gagal memuat data komunitas");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-20 px-4 md:px-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-black tracking-tighter uppercase italic flex items-center gap-3">
            <Users size={32} /> Komunitas Belajar
          </h1>
          <p className="text-sm text-gray-500 font-medium italic mt-2">
            Gabung grup diskusi, cari partner, dan belajar bareng.
          </p>
        </div>
      </div>

      {/* GRID KARTU */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-slate-300" size={40} />
        </div>
      ) : communities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {communities.map((community) => (
            <CommunityCard key={community.id} data={community} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
          <Users size={48} className="text-slate-300 mb-4" />
          <p className="text-slate-500 font-bold">Belum ada komunitas yang terdaftar.</p>
        </div>
      )}
    </div>
  );
}