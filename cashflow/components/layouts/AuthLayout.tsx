import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  children: ReactNode;
  className?: string;
}

const AuthLayout = ({ children, className }: AuthLayoutProps) => {
  return (
    <div
      className={cn(
        "min-h-screen bg-[#070B14] flex items-center justify-center p-6 relative overflow-hidden",
        className
      )}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at center, rgba(109, 91, 255, 0.22) 0%, transparent 60%),
            radial-gradient(circle at center, transparent 30%, rgba(0, 0, 0, 0.5) 100%)
          `,
        }}
      />
      <div className="w-full max-w-[480px] z-10">{children}</div>
    </div>
  );
};

export default AuthLayout;