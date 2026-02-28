import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Icon from "@/components/ui/Icon";

interface SignupStep1Props {
  onNext: (ageRange: string) => void;
  onSkip?: () => void;
  initialAge?: string;
}

const ageRanges = [
  { id: "13-17", label: "13 - 17", emoji: "🔞" },
  { id: "18-24", label: "18 - 24", emoji: "👨" },
  { id: "25-34", label: "25 - 34", emoji: "👨‍💼" },
  { id: "35-44", label: "35 - 44", emoji: "👨‍🏫" },
  { id: "45plus", label: "45 +", emoji: "👴" },
];

const SignupStep1 = ({ onNext, onSkip, initialAge = "25-34" }: SignupStep1Props) => {
  const [selectedAge, setSelectedAge] = React.useState<string>(
    ageRanges.find(range => range.id === initialAge)?.id || "25-34"
  );

  const handleSelect = (ageId: string) => {
    setSelectedAge(ageId);
  };

  const handleNext = () => {
    const selectedRange = ageRanges.find(range => range.id === selectedAge);
    if (selectedRange) {
      onNext(selectedRange.label);
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full max-w-md mx-auto">
      <div className="text-center mb-5">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10">
          <Icon name="cake" className="text-primary" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-white mb-3">
          What's your age ?
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
          We use this to understand our users better and tailor the experience to your needs.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {ageRanges.map((range) => (
          <button
            key={range.id}
            onClick={() => handleSelect(range.id)}
            className={cn(
              "group relative flex items-center justify-between p-4 rounded-xl transition-all duration-200",
              "border-2 hover:scale-[1.02] active:scale-[0.98]",
              selectedAge === range.id
                ? "bg-gradient-to-br from-primary/20 to-purple-500/20 border-primary shadow-lg shadow-primary/20"
                : "bg-slate-800/40 border-slate-700/50 hover:bg-slate-700/40 hover:border-slate-600"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{range.emoji}</span>
              <span className={cn(
                "font-medium text-sm",
                selectedAge === range.id ? "text-white" : "text-slate-300"
              )}>
                {range.label}
              </span>
            </div>
            
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center transition-all",
              selectedAge === range.id
                ? "bg-primary scale-110"
                : "border-2 border-slate-600 group-hover:border-slate-500"
            )}>
              {selectedAge === range.id && (
                <Icon name="check" className="text-sm text-white" />
              )}
            </div>

            {selectedAge === range.id && (
              <div className="absolute inset-0 rounded-xl bg-primary/5 animate-pulse"></div>
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 bg-slate-800/30 rounded-lg p-3 mb-6">
        <Icon name="info" className="text-slate-500 text-sm" />
        <p className="text-xs text-slate-500">
          This helps us provide age-appropriate content and features
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
      </div>
    </div>
  );
};

export default SignupStep1;