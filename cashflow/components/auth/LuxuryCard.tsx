import React, { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LuxuryCardProps {
  children: ReactNode;
  className?: string;
}

const LuxuryCard = ({ children, className }: LuxuryCardProps) => {
  return (
    <Card
      className={cn(
        "relative overflow-hidden bg-[#141824] border border-slate-800/50 shadow-2xl rounded-[24px]",
        className
      )}
    >
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{
          padding: "1px",
          background: "linear-gradient(to bottom, rgba(255,255,255,0.12), transparent)",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      <CardContent className="p-5 ">{children}</CardContent>
    </Card>
  );
};

export default LuxuryCard;