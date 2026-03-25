"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import toast from "react-hot-toast";

export default function SignOutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const loadingToast = toast.loading("Signing out...");

    try {
      const res = await fetch("/auth/signout", {
        method: "POST",
      });

      if (res.ok) {
        toast.dismiss(loadingToast);
        toast.success("Signed out");
        router.refresh();
        router.push("/login");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
    }
  };

  return (
    <button 
      onClick={handleLogout}
      className="text-gray-500 hover:text-red-600 transition flex items-center justify-center p-1"
      title="Sign Out"
    >
      <LogOut size={18} />
    </button>
  );
}