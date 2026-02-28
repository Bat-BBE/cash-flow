import React from "react";
import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  steps: Array<{ 
    label: string;
    icon?: string;
    description?: string;
  }>;
  variant?: "default" | "compact" | "detailed";
  onStepClick?: (step: number) => void;
}

const StepIndicator = ({ 
  currentStep, 
  steps, 
  variant = "default",
  onStepClick 
}: StepIndicatorProps) => {
  
  const getStepColor = (stepNumber: number) => {
    if (stepNumber < currentStep) return "completed";
    if (stepNumber === currentStep) return "active";
    return "pending";
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "completed":
        return {
          bg: "bg-gradient-to-r from-green-500 to-emerald-400",
          text: "text-green-400",
          border: "border-green-500/30",
          shadow: "shadow-[0_0_20px_rgba(34,197,94,0.5)]",
          line: "bg-gradient-to-r from-green-500 to-emerald-400"
        };
      case "active":
        return {
          bg: "bg-gradient-to-r from-primary to-purple-500",
          text: "text-primary",
          border: "border-primary/50",
          shadow: "shadow-[0_0_20px_rgba(109,91,255,0.5)]",
          line: "bg-gradient-to-r from-primary to-purple-500"
        };
      default:
        return {
          bg: "bg-slate-700",
          text: "text-slate-500",
          border: "border-slate-700",
          shadow: "",
          line: "bg-slate-700"
        };
    }
  };

  const variantStyles = {
    default: {
      container: "mb-7",
      stepWidth: "w-[90px] md:w-[120px]",
      dotSize: "w-[30px] h-[30px]",
      iconSize: "text-[18px]",
      labelSize: "text-[10px]",
    },
    compact: {
      container: "mb-7",
      stepWidth: "w-[60px] md:w-[80px]",
      dotSize: "w-[24px] h-[24px]",
      iconSize: "text-[14px]",
      labelSize: "text-[8px]",
    },
    detailed: {
      container: "mb-7",
      stepWidth: "w-[120px] md:w-[160px]",
      dotSize: "w-[36px] h-[36px]",
      iconSize: "text-[20px]",
      labelSize: "text-[11px]",
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className={cn("relative", styles.container)}>
      <div className="absolute top-[15px] left-0 w-full h-0.5 bg-slate-800/50 -z-10"></div>

      <div className="flex items-center justify-center">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const status = getStepColor(stepNumber);
          const colors = getStatusColor(status);
          
          const isCompleted = status === "completed";
          const isActive = status === "active";
          const isClickable = onStepClick && (isCompleted || isActive);

          return (
            <React.Fragment key={step.label}>
              <div className="flex flex-col items-center relative group">
                <button
                  onClick={() => isClickable && onStepClick(stepNumber)}
                  disabled={!isClickable}
                  className={cn(
                    styles.dotSize,
                    "rounded-full flex items-center justify-center text-white z-10 shrink-0",
                    "transition-all duration-500 ease-out",
                    "border-2 backdrop-blur-sm",
                    colors.bg,
                    colors.border,
                    isActive && colors.shadow,
                    isActive && "ring-4 ring-primary/20",
                    isCompleted && "hover:scale-110 cursor-pointer",
                    isClickable && "cursor-pointer hover:ring-4 hover:ring-green-500/20"
                  )}
                >
                  {isCompleted ? (
                    <Icon 
                      name="check" 
                      className={cn(styles.iconSize, "font-bold animate-pop")} 
                    />
                  ) : step.icon ? (
                    <Icon 
                      name={step.icon} 
                      className={cn(styles.iconSize, isActive && "animate-pulse")} 
                    />
                  ) : (
                    <span className={cn("font-bold", styles.iconSize)}>
                      {stepNumber}
                    </span>
                  )}
                </button>

                <div className="absolute top-10 text-center">
                  <span
                    className={cn(
                      "block whitespace-nowrap font-bold uppercase tracking-wider transition-all duration-300",
                      styles.labelSize,
                      colors.text,
                      isActive && "scale-105"
                    )}
                  >
                    {step.label}
                  </span>

                  {variant === "detailed" && step.description && (
                    <span className="block text-[8px] text-slate-500 mt-0.5">
                      {step.description}
                    </span>
                  )}
                </div>

                {variant === "compact" && (
                  <div className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[8px] bg-slate-800 px-2 py-1 rounded-full whitespace-nowrap text-slate-400">
                    {step.label}
                  </div>
                )}
              </div>

              {index < steps.length - 1 && (
                <div
                  className={cn(
                    styles.stepWidth,
                    "h-1 rounded-full relative overflow-hidden",
                    "transition-all duration-700 ease-out"
                  )}
                >
                  <div className="absolute inset-0 bg-slate-800"></div>
                  
                  <div 
                    className={cn(
                      "absolute inset-y-0 left-0 transition-all duration-700 ease-out",
                      stepNumber < currentStep ? colors.line : "w-0"
                    )}
                    style={{ 
                      width: stepNumber < currentStep ? '100%' : 
                             stepNumber === currentStep ? '50%' : '0%' 
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {steps[currentStep - 1]?.description && (
        <div className="text-center mt-8 text-sm text-slate-400 animate-fadeIn">
          <p>{steps[currentStep - 1].description}</p>
        </div>
      )}
    </div>
  );
};

export default StepIndicator;