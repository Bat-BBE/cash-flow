"use client";

import React from "react";
import Link from "next/link";
import { useDashboard } from "@/components/providers/dashboard-provider";
import { useTranslation } from "@/lib/translations";

interface LoginFooterProps {
  linkHref?: string;
}

const LoginFooter = ({ linkHref = "/signup" }: LoginFooterProps) => {
  const { language } = useDashboard();
  const t = useTranslation(language);

  return (
    <div className="mt-10 text-center text-[14px] text-white/72">
      {t('loginFooterNoAccount')}
      <Link
        href={linkHref}
        className="font-bold text-white hover:text-primary transition-colors ml-1.5"
      >
        {t('loginFooterSignUp')}
      </Link>
    </div>
  );
};

export default LoginFooter;