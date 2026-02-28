"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/Icon";

interface PasswordInputProps {
  id?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const PasswordInput = ({
  id = "password",
  name = "password",
  placeholder = "••••••••",
  required = true,
  className = "",
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Icon
        name="lock"
        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]"
      />
      <Input
        id={id}
        name={name}
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        required={required}
        className={`w-full h-12 pl-12 pr-12 bg-[#0B1324] border-slate-800 rounded-xl text-[15px] placeholder:text-slate-600 focus:border-[#6D5BFF]/50 focus:ring-2 focus:ring-[#6D5BFF]/30 transition-all ${className}`}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors w-8 h-8"
        onClick={() => setShowPassword(!showPassword)}
      >
        <Icon
          name={showPassword ? "visibility" : "visibility_off"}
          className="text-[20px]"
        />
      </Button>
    </div>
  );
};

export default PasswordInput;