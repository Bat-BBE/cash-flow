"use client";

import React from "react";
import { BrandLogo } from "@/components/dashboard/brand-logo";
import { useDashboard } from "@/components/providers/dashboard-provider";
import { useTranslation } from "@/lib/translations";

const LoginHeader = () => {
  const { language } = useDashboard();
  const t = useTranslation(language);

  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(109,91,255,0.3)] mx-auto p-2">
          <BrandLogo size="md" maxWidthClassName="max-w-[3.5rem]" />
        </div>
      </div>
      <div className="mb-2 text-center">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
          {t('loginTitle')}
        </h1>
        <p className="text-slate-400 font-normal">
          {t('loginSubtitle')}
        </p>
      </div>
    </div>
  );
};

export default LoginHeader;