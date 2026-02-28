import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
}

const GlassPanel = ({ children, className }: GlassPanelProps) => {
  return (
    <div
      className={cn(
        "bg-[#0f0917]/80 backdrop-blur-md border border-primary/15 rounded-2xl p-8 md:p-12 shadow-[0_0_40px_rgba(127,6,249,0.08)] relative overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  );
};

export default GlassPanel;