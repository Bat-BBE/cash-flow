import React from "react";
import Icon from "@/components/ui/Icon";

interface LoginHeaderProps {
  title?: string;
  subtitle?: string;
}

const LoginHeader = ({ 
  title = "Login", 
  subtitle = "Welcome back! Please enter your details to sign in." 
}: LoginHeaderProps) => {
  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(109,91,255,0.3)] mx-auto">
          <img src="/logo.png" alt="CashFlow Logo" className="relative w-12 h-12 rounded-xl" /> 
        </div>
      </div>
      <div className="mb-2 text-center">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
          {title}
        </h1>
        <p className="text-slate-400 font-normal">
          {subtitle}
        </p>
      </div>
    </div>
  );
};

export default LoginHeader;