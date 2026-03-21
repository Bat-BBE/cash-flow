"use client";

import React, { useState } from "react";
import GlassPanel from "./GlassPanel";
import StepIndicator from "./StepIndicator";
import SignupStep1 from "./SignupStep1";
import SignupStep2 from "./SignupStep2";
import SignupStep3 from "./SignupStep3";
import Icon from "@/components/ui/Icon";

interface SignupFlowProps {
  onComplete?: (data: SignupData) => void;
  onLogin?: () => void;
  hideHeader?: boolean;
}

interface SignupData {
  ageRange?: string;
  gender?: string;
  profileImage?: File;
}

const steps = [
  { label: "AGE" },
  { label: "GENDER" },
  { label: "PHOTO" },
];

const SignupFlow = ({ onComplete, onLogin, hideHeader = false }: SignupFlowProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [signupData, setSignupData] = useState<SignupData>({});

  const handleNext = (stepData: any) => {
    const newData = { ...signupData };
    
    if (currentStep === 1) {
      newData.ageRange = stepData;
    } else if (currentStep === 2) {
      newData.gender = stepData;
    } else if (currentStep === 3) {
      newData.profileImage = stepData;
    }
    
    setSignupData(newData);

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      if (onComplete) {
        onComplete(newData);
      }
      console.log("Onboarding completed:", newData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep === 3) {
      handleNext(undefined);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <SignupStep1
            onNext={handleNext}
            onSkip={handleSkip}
          />
        );
      case 2:
        return (
          <SignupStep2
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkip}
          />
        );
      case 3:
        return (
          <SignupStep3
            onComplete={handleNext}
            onBack={handleBack}
            onSkip={handleSkip}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <GlassPanel>
        <StepIndicator currentStep={currentStep} steps={steps} />
        {renderStep()}
      </GlassPanel>
    </>
  );
};

export default SignupFlow;