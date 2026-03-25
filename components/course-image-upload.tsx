"use client";

import { useState } from "react";
// Impor objek supabase langsung dari lib kamu
import { supabase as supabaseClient } from "@/lib/supabaseClient"; 
import { ImagePlus, Loader2, X } from "lucide-react";

interface CourseImageUploadProps {
  onChange: (url: string) => void;
  value: string;
}

export const CourseImageUpload = ({ onChange, value }: CourseImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);

      // 1. Buat nama file unik agar tidak bentrok di storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `course-thumbnails/${fileName}`;

      // 2. Upload ke bucket 'images' 
      // Gunakan supabaseClient (nama yang kita ubah saat import tadi)
      const { error: uploadError } = await supabaseClient.storage
        .from('project-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. Ambil Public URL
      const { data: { publicUrl } } = supabaseClient.storage
        .from('project-images')
        .getPublicUrl(filePath);

      // Kirim URL ke form utama
      onChange(publicUrl);
    } catch (error) {
      console.error("Error upload:", error);
      alert("Gagal upload gambar. Pastikan bucket 'images' sudah dibuat di Supabase.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4 w-full">
      {value ? (
        <div className="relative aspect-video w-full rounded-[2rem] overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <img 
            src={value} 
            alt="Thumbnail" 
            className="object-cover w-full h-full" 
          />
          <button 
            type="button" // Pastikan type="button" agar tidak men-submit form
            onClick={() => onChange("")}
            className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition shadow-lg"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center aspect-video w-full rounded-[2rem] border-4 border-dashed border-slate-200 bg-slate-50 cursor-pointer hover:border-black hover:bg-slate-100 transition-all group">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-10 w-10 text-black animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-black">Uploading...</p>
              </div>
            ) : (
              <>
                <ImagePlus className="h-10 w-10 text-slate-400 group-hover:text-black mb-2 transition-colors" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-black transition-colors">
                  Klik untuk Upload Thumbnail
                </p>
              </>
            )}
          </div>
          <input 
            type="file" 
            className="hidden" 
            onChange={onUpload} 
            disabled={isUploading} 
            accept="image/*" 
          />
        </label>
      )}
    </div>
  );
};