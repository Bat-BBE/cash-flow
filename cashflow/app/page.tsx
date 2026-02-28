"use client";

import React from "react";
import { useRouter } from "next/navigation";
import  CashFlowLogin  from "@/components/auth/CashFlowLogin";

const LoginPage = () => {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/home");
    console.log("Login submitted");
  };

  const handleGoogleLogin = () => {
    router.push("/home");
    console.log("Google login clicked");
  };

  return (
    <CashFlowLogin
      onLogin={handleLogin}
      onGoogleLogin={handleGoogleLogin}
    />
  );
};

export default LoginPage;