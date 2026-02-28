import React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface SocialLoginProps {
  onGoogleClick?: () => void;
}

const SocialLogin = ({ onGoogleClick }: SocialLoginProps) => {
  const handleGoogleClick = () => {
    if (onGoogleClick) {
      onGoogleClick();
    } else {
      console.log("Google login clicked");
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleClick}
      className="w-full h-12 flex items-center justify-center gap-3 bg-[#0B1324] border-slate-800 hover:bg-[#0B1324]/80 hover:border-slate-700 text-slate-200 font-medium rounded-xl transition-all"
    >
      <Image
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJg75LWB1zIJt1VTZO7O68yKciaDSkk3KMdw&s"
        alt="Google Logo"
        width={20}
        height={15}
        className="w-6 h-6 rounded-3xl"
        unoptimized
      />
        Sign in with Google
    </Button>
  );
};

export default SocialLogin;