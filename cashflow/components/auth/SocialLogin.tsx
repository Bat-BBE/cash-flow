"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useDashboard } from "@/components/providers/dashboard-provider";
import { useTranslation } from "@/lib/translations";

interface SocialLoginProps {
  onGoogleClick?: () => void;
}

const SocialLogin = ({ onGoogleClick }: SocialLoginProps) => {
  const { language } = useDashboard();
  const t = useTranslation(language);

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
        alt={t('loginGoogleLogoAlt')}
        width={20}
        height={15}
        className="w-6 h-6 rounded-3xl"
        unoptimized
      />
        {t('loginGoogle')}
    </Button>
  );
};

export default SocialLogin;