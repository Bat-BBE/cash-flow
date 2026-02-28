"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

interface PasswordInputProps {
  id?: string;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  icon?: string;
  className?: string;
}

const PasswordInput = ({
  id = "password",
  name = "password",
  value,
  onChange,
  placeholder = "••••••••",
  error,
  icon = "lock",
  className,
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1">
      <div className="relative">
        <Icon
          name={icon}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]"
        />
        <Input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={cn(
            "w-full h-[48px] pl-12 pr-12 bg-[#1E1E2E]/50 border border-slate-700/50 rounded-[14px] text-sm text-white placeholder-slate-500 transition-all focus:outline-none violet-glow-input",
            error && "border-red-500 focus:border-red-500",
            className
          )}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 w-8 h-8"
          onClick={() => setShowPassword(!showPassword)}
        >
          <Icon
            name={showPassword ? "visibility" : "visibility_off"}
            className="text-[20px]"
          />
        </Button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>}
    </div>
  );
};

export default PasswordInput;