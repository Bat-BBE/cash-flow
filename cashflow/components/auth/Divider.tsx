"use client";

import React from "react";
import { useDashboard } from "@/components/providers/dashboard-provider";
import { useTranslation } from "@/lib/translations";

const Divider = () => {
  const { language } = useDashboard();
  const t = useTranslation(language);

  return (
    <div className="relative py-8">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-white/10"></div>
      </div>
      <div className="relative flex justify-center text-[11px] uppercase tracking-widest font-bold">
        <span className="px-4 bg-[#0E1729] text-slate-500">{t('loginDividerOr')}</span>
      </div>
    </div>
  );
};

export default Divider;