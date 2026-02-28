"use client";

import React, { useState } from "react";
import AuthLayout from "@/components/layouts/AuthLayout";
import SignupForm, { SignupFormData } from "./signup/SignupForm";
import SignupFlow from "./signup/SignupFlow";
import Icon from "../ui/Icon";

interface SignupPageProps {
  onComplete?: (data: { form: SignupFormData; onboarding: any }) => void;
  onLogin?: () => void;
}

const SignupPage = ({ onComplete, onLogin }: SignupPageProps) => {
  const [step, setStep] = useState<"form" | "onboarding">("form");
  const [formData, setFormData] = useState<SignupFormData | null>(null);

  const handleFormSubmit = (data: SignupFormData) => {
    console.log("Step 1 - Form completed:", data);
    setFormData(data);
    setStep("onboarding");
  };

  const handleOnboardingComplete = (onboardingData: any) => {
    console.log("Step 2 - Onboarding completed:", onboardingData);
    
    if (onComplete && formData) {
      onComplete({
        form: formData,
        onboarding: onboardingData
      });
    }

    console.log("All steps completed! Redirecting to dashboard...");
  };

  const handleLogin = () => {
    if (onLogin) {
      onLogin();
    } else {
      console.log("Navigate to login page");
    }
  };

  // const handleBackToForm = () => {
  //   setStep("form");
  // };

  return (
    <AuthLayout>
      {step === "form" ? (
        <SignupForm onSubmit={handleFormSubmit} onLogin={handleLogin} />
      ) : (
        <div>
          <div className="mt-0">
            {/* <button
              onClick={handleBackToForm}
              className="mb-4 px-3 py-1.5 bg-slate-800/30 hover:bg-slate-700/40 rounded-lg text-sm text-slate-400 hover:text-primary transition-all duration-200 flex items-center gap-1.5 border border-slate-700/50 hover:border-primary/30 w-fit"
            >
              <Icon name="arrow_back" className="text-lg" />
              <span>Back</span>
            </button> */}
            <SignupFlow 
              onComplete={handleOnboardingComplete} 
              onLogin={handleLogin} 
            />
          </div>
        </div>
      )}
    </AuthLayout>
  );
};

export default SignupPage;