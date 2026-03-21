"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import PasswordInput from "./PasswordInput";

interface LoginFormProps {
  onSubmit?: (e: React.FormEvent) => void;
}

const LoginForm = ({ onSubmit }: LoginFormProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    } else {
      console.log("Login form submitted");
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label
          htmlFor="identity"
          className="text-[13px] font-medium text-white/72 ml-1"
        >
          E-mail
        </Label>
        <div className="relative">
          <Icon
            name="mail"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]"
          />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="test@gmail.com"
            required
            className="w-full h-12 pl-12 pr-4 bg-[#0B1324] border-slate-800 rounded-xl text-[15px] placeholder:text-slate-600 focus:border-[#6D5BFF]/50 focus:ring-2 focus:ring-[#6D5BFF]/30 transition-all"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center px-1">
          <Label
            htmlFor="password"
            className="text-[13px] font-medium text-white/72"
          >
            Password
          </Label>
          <Link
            href="#"
            className="text-[13px] font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Password forgot?
          </Link>
        </div>
        <PasswordInput />
      </div>

      <div className="flex items-center ml-1">
        <Checkbox
          id="remember"
          name="remember"
          className="border-slate-800 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
        <Label
          htmlFor="remember"
          className="ml-2.5 block text-[14px] text-white/72 cursor-pointer"
        >
          Remember me
        </Label>
      </div>

      <Button
        type="submit"
        className="w-full h-12 bg-gradient-to-r from-[#6D5BFF] to-[#8A5CFF] hover:from-[#5A4AE6] hover:to-[#7A4CE6] text-white font-semibold rounded-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 group shadow-lg hover:shadow-[0_0_20px_rgba(109,91,255,0.4)]"
      >
        Sign In
        <Icon
          name="arrow_forward"
          className="text-lg group-hover:translate-x-1 transition-transform"
        />
      </Button>
    </form>
  );
};

export default LoginForm;