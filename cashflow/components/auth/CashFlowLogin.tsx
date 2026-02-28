"use client";

import React from "react";
import AuthLayout from "@/components/layouts/AuthLayout";
import LoginHeader from "./LoginHeader";
import LuxuryCard from "./LuxuryCard";
import LoginForm from "./LoginForm";
import Divider from "./Divider";
import SocialLogin from "./SocialLogin";
import LoginFooter from "./LoginFooter";

interface CashFlowLoginProps {
  onLogin?: (e: React.FormEvent) => void;
  onGoogleLogin?: () => void;
}

const CashFlowLogin = ({ onLogin, onGoogleLogin }: CashFlowLoginProps) => {
  return (
    <AuthLayout>
      <LuxuryCard>
        <LoginHeader />
          <LoginForm onSubmit={onLogin} />
          <Divider />
          <SocialLogin onGoogleClick={onGoogleLogin} />
        <LoginFooter />
      </LuxuryCard>
    </AuthLayout>
  );
};

export default CashFlowLogin;