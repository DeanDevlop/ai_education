// app/checkout/[slug]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CreditCard } from "lucide-react";
// Pastikan file ini sudah kamu buat di folder components
import CheckoutButton from "../../../components/CheckoutButton"; 

// --- Data Dummy (Disamakan dengan halaman detail) ---
const COURSES_DB = [
  {
    slug: "react-basic",
    title: "Mastering React.js: Dari Pemula Jadi Expert",
    price: 299000,
    image: "https://placehold.co/600x400/png?text=React+Course",
  },
  {
    slug: "nextjs-mastery",
    title: "Next.js 15 App Router Fullstack",
    price: 450000,
    image: "https://placehold.co/600x400/png?text=NextJS+Course",
  },
];

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CheckoutPage({ params }: PageProps) {
  const { slug } = await params;
  const course = COURSES_DB.find((c) => c.slug === slug);

  if (!course) notFound();

  // Format Rupiah
  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(course.price);

  // Biaya Admin (Simulasi)
  const adminFee = 5000;
  const total = course.price + adminFee;
  const formattedTotal = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(total);

  return (
    <div className="min-h-screen bg-gray-50 py-10 font-sans">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header Back */}
        <Link href={`/course/${slug}`} className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition">
          <ArrowLeft size={20} className="mr-2" /> Kembali ke Detail Kursus
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* KOLOM KIRI: FORM DATA DIRI */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Box 1: Info User */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                1. Informasi Pembeli
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                  <input type="text" placeholder="Contoh: Budi Santoso" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input type="email" placeholder="budi@example.com" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
                  <p className="text-xs text-gray-500 mt-1">Akses kelas akan dikirim ke email ini.</p>
                </div>
              </div>
            </div>

            {/* Box 2: Metode Bayar */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                2. Metode Pembayaran
              </h2>
              <div className="grid gap-3">
                {/* Opsi Transfer */}
                <label className="flex items-center justify-between border p-4 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition">
                  <div className="flex items-center gap-3">
                    <input type="radio" name="payment" className="w-4 h-4 text-blue-600" defaultChecked />
                    <span className="font-medium">Transfer Bank (BCA/Mandiri)</span>
                  </div>
                  <CreditCard size={20} className="text-gray-400" />
                </label>

                {/* Opsi E-Wallet */}
                <label className="flex items-center justify-between border p-4 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition">
                  <div className="flex items-center gap-3">
                    <input type="radio" name="payment" className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">GoPay / OVO / Dana</span>
                  </div>
                </label>
              </div>
            </div>

          </div>

          {/* KOLOM KANAN: RINGKASAN ORDER */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-6">
              <h3 className="font-bold text-gray-900 mb-4">Ringkasan Pesanan</h3>
              
              <div className="flex gap-3 mb-4">
                <img src={course.image} alt="Course" className="w-16 h-16 object-cover rounded-md bg-gray-200" />
                <div>
                  <p className="text-sm font-semibold line-clamp-2">{course.title}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 py-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Harga Kelas</span>
                  <span>{formattedPrice}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Biaya Admin</span>
                  <span>Rp 5.000</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Kode Unik</span>
                  <span>Rp 123</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between font-bold text-lg text-gray-900">
                  <span>Total</span>
                  <span>{formattedTotal}</span>
                </div>
              </div>

             <CheckoutButton 
  courseId={course.slug}
  courseName={course.title}
  price={total}
/>
              
              <p className="text-xs text-center text-gray-400 mt-3">
                Transaksi aman & terenkripsi.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}