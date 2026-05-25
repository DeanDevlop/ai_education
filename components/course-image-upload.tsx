Untuk mengatasi kerentanan ini, Anda perlu membuat API route sisi server untuk menangani unggahan gambar dan melakukan validasi yang ketat. Kemudian, komponen `CourseImageUpload` akan memanggil API route ini alih-alih mengunggah langsung ke Supabase.

**1. Buat API Route Baru (`/app/api/upload-image/route.ts`):**
typescript
// File: /app/api/upload-image/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return new NextResponse("No file uploaded", { status: 400 });
  }

  // --- PATCH: Server-side validation ---
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxFileSize = 5 * 1024 * 1024; // 5MB

  if (!allowedMimeTypes.includes(file.type)) {
    return new NextResponse("Invalid file type. Only images (JPEG, PNG, GIF, WEBP) are allowed.", { status: 400 });
  }

  if (file.size > maxFileSize) {
    return new NextResponse(`File size exceeds the limit of ${maxFileSize / (1024 * 1024)}MB.`, { status: 400 });
  }
  // --- AKHIR PATCH ---

  const filePath = `${user.id}/${Date.now()}-${file.name}`; // Contoh path unik

  const { data, error } = await supabase.storage
    .from('project-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error("Supabase upload error:", error);
    return new NextResponse("Failed to upload image", { status: 500 });
  }

  // Dapatkan URL publik
  const { data: publicUrlData } = supabase.storage
    .from('project-images')
    .getPublicUrl(filePath);

  return NextResponse.json({ url: publicUrlData.publicUrl });
}


**2. Modifikasi Komponen `CourseImageUpload` (`/components/course-image-upload.tsx`):**
typescript
// File: /components/course-image-upload.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface CourseImageUploadProps {
  onUploadSuccess: (url: string) => void;
}

const CourseImageUpload = ({ onUploadSuccess }: CourseImageUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Pilih file gambar terlebih dahulu.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      // --- PATCH: Panggil API route untuk upload ---
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal mengunggah gambar.");
      }

      const data = await response.json();
      onUploadSuccess(data.url);
      toast.success("Gambar berhasil diunggah!");
      setFile(null); // Reset file input
      // --- AKHIR PATCH ---

    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Terjadi kesalahan saat mengunggah gambar.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Input
        type="file"
        accept="image/*" // Client-side hint, server-side validation is crucial
        onChange={handleFileChange}
        disabled={isUploading}
      />
      <Button onClick={handleUpload} disabled={!file || isUploading}>
        {isUploading ? "Mengunggah..." : "Unggah Gambar"}
      </Button>
    </div>
  );
};

export default CourseImageUpload;
