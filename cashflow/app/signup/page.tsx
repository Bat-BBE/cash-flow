"use client";

import React from "react";
import { useRouter } from "next/navigation";
import SignupPage from "@/components/auth/SignupPage";

const SignupRoute = () => {
  const router = useRouter();

  const handleComplete = (data: { form: any; onboarding: any }) => {
    console.log("All steps completed:", data);    
    router.push("/home");
  };

  const handleLogin = () => {
    router.push("/");
  };

  return (
    <SignupPage
      onComplete={handleComplete}
      onLogin={handleLogin}
    />
  );
};

export default SignupRoute;