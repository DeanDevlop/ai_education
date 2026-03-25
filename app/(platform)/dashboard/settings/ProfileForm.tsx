"use client";

import { useState, useTransition, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { updateProfileName, updatePassword } from "@/app/actions/profile"; 
import { Eye, EyeOff, Lock, Key, MapPin, Phone, Briefcase, FileText, User } from "lucide-react"; 

export function ProfileForm({ 
  initialName, 
  email,
  initialHeadline = "", 
  initialPhone = "",
  initialLocation = "",
  initialBio = ""
}: { 
  initialName: string; 
  email: string;
  initialHeadline?: string;
  initialPhone?: string;
  initialLocation?: string;
  initialBio?: string;
}) {
  const [isPending, startTransition] = useTransition();

  // --- STATE PASSWORD ---
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [strength, setStrength] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    symbol: false,
  });

  useEffect(() => {
    setStrength({
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[^A-Za-z0-9]/.test(password),
    });
  }, [password]);

  // Indikator Titik-Titik (Style Minimalis: Abu -> Hitam)
  const Requirement = ({ met, label }: { met: boolean; label: string }) => (
    <div className={`flex items-center gap-2 text-xs font-medium transition-colors ${met ? "text-black" : "text-gray-400"}`}>
      <div className={`h-1.5 w-1.5 rounded-full transition-colors ${met ? "bg-black" : "bg-gray-300"}`} />
      <span>{label}</span>
    </div>
  );

  const handleUpdateProfile = async (formData: FormData) => {
    startTransition(async () => {
      const result = await updateProfileName(formData);
      if (result.error) toast.error(result.error);
      else toast.success(result.success);
    });
  };

  const handleUpdatePassword = async (formData: FormData) => {
    if (!Object.values(strength).every(Boolean)) {
        toast.error("Password belum cukup kuat!");
        return;
    }

    startTransition(async () => {
      const result = await updatePassword(formData);
      if (result.error) toast.error(result.error);
      else {
        toast.success(result.success);
        setPassword("");
        (document.getElementById("passForm") as HTMLFormElement).reset();
      }
    });
  };

  // Helper Style untuk Input (Biar gak ngulang-ulang)
  const inputStyle = "w-full bg-white border border-gray-300 rounded-md p-2.5 text-sm text-slate-900 outline-none focus:border-black focus:ring-1 focus:ring-black transition placeholder:text-gray-400";
  const labelStyle = "block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5";
  const iconStyle = "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400";

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />

      {/* --- CARD 1: EDIT PROFIL (Light Mode) --- */}
      <div className="bg-white p-6 md:p-8 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
            <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
        </div>
        
        <form action={handleUpdateProfile} className="space-y-5">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Email */}
              <div>
                <label className={labelStyle}>Email Address</label>
                <input 
                    type="text" 
                    value={email} 
                    disabled 
                    className="w-full bg-gray-50 border border-gray-200 rounded-md p-2.5 text-gray-500 cursor-not-allowed text-sm"
                />
              </div>

              {/* Nama Lengkap */}
              <div>
                <label className={labelStyle}>Full Name</label>
                <div className="relative">
                    <User size={16} className={iconStyle} />
                    <input 
                        name="name"
                        defaultValue={initialName}
                        type="text" 
                        className={`${inputStyle} pl-10`}
                        placeholder="Your name"
                    />
                </div>
              </div>

              {/* Headline */}
              <div className="md:col-span-2">
                <label className={labelStyle}>Headline / Role</label>
                <div className="relative">
                    <Briefcase size={16} className={iconStyle} />
                    <input 
                        name="headline"
                        defaultValue={initialHeadline}
                        type="text" 
                        className={`${inputStyle} pl-10`}
                        placeholder="e.g. Senior Frontend Developer"
                    />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className={labelStyle}>Phone Number</label>
                <div className="relative">
                    <Phone size={16} className={iconStyle} />
                    <input 
                        name="phone"
                        defaultValue={initialPhone}
                        type="text" 
                        className={`${inputStyle} pl-10`}
                        placeholder="+62..."
                    />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className={labelStyle}>Location</label>
                <div className="relative">
                    <MapPin size={16} className={iconStyle} />
                    <input 
                        name="location"
                        defaultValue={initialLocation}
                        type="text" 
                        className={`${inputStyle} pl-10`}
                        placeholder="Jakarta, ID"
                    />
                </div>
              </div>

              {/* Bio */}
              <div className="md:col-span-2">
                <label className={labelStyle}>Bio</label>
                <div className="relative">
                    <FileText size={16} className="absolute left-3 top-3 text-gray-400" />
                    <textarea 
                        name="bio"
                        defaultValue={initialBio}
                        rows={4}
                        className={`${inputStyle} pl-10 resize-none`}
                        placeholder="Tell us a bit about yourself..."
                    />
                </div>
                <p className="text-xs text-gray-400 mt-1 text-right">Max 300 chars</p>
              </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button 
                disabled={isPending}
                className="px-6 py-2 bg-black text-white font-semibold rounded-md hover:bg-gray-800 transition disabled:opacity-50 text-sm"
            >
                {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* --- CARD 2: KEAMANAN (Light Mode) --- */}
      <div className="bg-white p-6 md:p-8 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-1 border-b border-gray-100 pb-4">Security</h2>
        
        <form id="passForm" action={handleUpdatePassword} className="mt-4 space-y-4">
          
          <div>
            <label className={labelStyle}>New Password</label>
            <div className="relative">
                <div className={iconStyle}>
                    <Key size={16} />
                </div>
                <input 
                    name="password"
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputStyle} pl-10 pr-10`}
                    placeholder="Min. 8 characters"
                />
                <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition"
                >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>

            {/* Indikator Kekuatan Password */}
            <div className={`mt-3 p-4 bg-gray-50 rounded-md border border-gray-100 space-y-2 transition-all duration-300 ${password ? "block opacity-100" : "hidden opacity-0"}`}>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password Strength:</p>
                <Requirement met={strength.length} label="Min 8 chars" />
                <Requirement met={strength.upper} label="Uppercase (A-Z)" />
                <Requirement met={strength.lower} label="Lowercase (a-z)" />
                <Requirement met={strength.number} label="Number (0-9)" />
                <Requirement met={strength.symbol} label="Symbol (!@#$)" />
            </div>
          </div>

          <div>
            <label className={labelStyle}>Confirm Password</label>
            <div className="relative">
                <div className={iconStyle}>
                    <Lock size={16} />
                </div>
                <input 
                    name="confirm"
                    type="password" 
                    className={`${inputStyle} pl-10`}
                    placeholder="Repeat new password"
                />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button 
                disabled={isPending}
                className="px-6 py-2 bg-black text-white font-semibold rounded-md hover:bg-gray-800 transition disabled:opacity-50 text-sm"
            >
                {isPending ? "Processing..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}