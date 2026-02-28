"use client";

import React from "react";
import { useRouter } from "next/navigation";
import CashFlowLogin from "@/components/auth/CashFlowLogin";

const LoginPage = () => {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login submitted");
    
    router.push("/");
  };

  const handleGoogleLogin = () => {
    console.log("Google login clicked");
    
    router.push("/");
  };

  return (
    <CashFlowLogin
      onLogin={handleLogin}
      onGoogleLogin={handleGoogleLogin}
    />
  );
};

export default LoginPage;