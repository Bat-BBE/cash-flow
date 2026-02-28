import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Icon from "@/components/ui/Icon";

interface SignupStep2Props {
  onNext: (gender: string) => void;
  onBack?: () => void;
  onSkip?: () => void;
  initialGender?: string;
}

const genderOptions = [
  { id: "male", label: "Male", icon: "male", emoji: "👨", description: "He/Him" },
  { id: "female", label: "Female", icon: "female", emoji: "👩", description: "She/Her" },
  { id: "other", label: "Other", icon: "transgender", emoji: "🧑", description: "They/Them" },
  { id: "prefer-not", label: "Prefer not to say", icon: "visibility_off", emoji: "🔒", description: "Keep private" },
];

const SignupStep2 = ({ onNext, onBack, onSkip, initialGender = "female" }: SignupStep2Props) => {
  const [selectedGender, setSelectedGender] = React.useState<string>(initialGender);
  const [isHovered, setIsHovered] = React.useState<string | null>(null);

  const handleSelect = (genderId: string) => {
    setSelectedGender(genderId);
  };

  const handleNext = () => {
    const selectedOption = genderOptions.find(opt => opt.id === selectedGender);
    if (selectedOption) {
      onNext(selectedOption.id);
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full max-w-md mx-auto">
      <div className="text-center mb-5">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10">
          <Icon name="wc" className="text-primary text-3xl" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-white mb-3">
          What's your gender ?
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
          This helps us personalize your experience and content recommendations.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {genderOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            onMouseEnter={() => setIsHovered(option.id)}
            onMouseLeave={() => setIsHovered(null)}
            className={cn(
              "group relative flex flex-col items-center p-5 rounded-2xl transition-all duration-300",
              "border-2 hover:scale-[1.02] active:scale-[0.98]",
              selectedGender === option.id
                ? "bg-gradient-to-br from-primary/20 to-purple-500/20 border-primary shadow-lg shadow-primary/20"
                : "bg-slate-800/40 border-slate-700/50 hover:bg-slate-700/40 hover:border-slate-600"
            )}
          >
            {selectedGender === option.id && (
              <div className="absolute top-3 right-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-pop">
                  <Icon name="check" className="text-white text-sm" />
                </div>
              </div>
            )}

            <div className={cn(
              "relative mb-3 transition-transform duration-300",
              isHovered === option.id && "scale-110"
            )}>
              <Icon
                name={option.icon}
                className={cn(
                  "text-4xl transition-all duration-300",
                  selectedGender === option.id 
                    ? "text-primary" 
                    : "text-slate-400 group-hover:text-slate-300"
                )}
              />

              <span className={cn(
                "absolute -top-6 -right-0 text-lg transition-all duration-300",
                isHovered === option.id ? "opacity-100 scale-100" : "opacity-0 scale-75"
              )}>
                {option.emoji}
              </span>
            </div>

            <span className={cn(
              "text-base font-semibold mb-1",
              selectedGender === option.id ? "text-white" : "text-slate-300"
            )}>
              {option.label}
            </span>
{/* 
            <span className="text-[10px] text-slate-500">
              {option.description}
            </span> */}

            {isHovered === option.id && (
              <div className="absolute inset-0 rounded-2xl bg-primary/5 animate-pulse"></div>
            )}
          </button>
        ))}
      </div>
      
      <div className="flex items-center gap-2 bg-slate-800/30 rounded-lg p-3 mb-6">
        <Icon name="info" className="text-slate-500 text-sm" />
        <p className="text-xs text-slate-500">
          You can change this later in your profile settings at any time
        </p>
      </div>

      <div className="space-y-3">
        <Button
          onClick={handleNext}
          className="w-full h-14 bg-gradient-to-r from-[#6D5BFF] to-[#8A5CFF] hover:from-[#5A4AE6] hover:to-[#7A4CE6] text-white font-semibold rounded-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 group shadow-lg hover:shadow-[0_0_20px_rgba(109,91,255,0.4)]"
        >
          <span>Continue</span>
          <Icon 
            name="arrow_right_alt" 
            className="text-xl group-hover:translate-x-1 transition-transform" 
          />
        </Button>
        
        <div className="flex justify-between items-center pt-2">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-slate-500 hover:text-primary transition-colors text-sm font-medium group"
            >
              <Icon 
                name="arrow_back" 
                className="text-lg group-hover:-translate-x-1 transition-transform" 
              />
              <span>Back</span>
            </button>
          )}
          
          {onSkip && (
            <button
              onClick={onSkip}
              className="flex items-center gap-1 text-slate-500 hover:text-primary transition-colors text-sm font-medium group ml-auto"
            >
              <span>Skip</span>
              <Icon 
                name="arrow_forward" 
                className="text-base opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" 
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignupStep2;