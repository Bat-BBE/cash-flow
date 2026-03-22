"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { BrandLogo } from "@/components/dashboard/brand-logo";
import PasswordInput from "./PasswordInput";
import { cn } from "@/lib/utils";

interface SignupFormProps {
  onSubmit?: (data: SignupFormData) => void;
  onLogin?: () => void;
}

export interface SignupFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
}

const SignupForm = ({ onSubmit, onLogin }: SignupFormProps) => {
  const [formData, setFormData] = useState<SignupFormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });

  const [errors, setErrors] = useState<Partial<SignupFormData>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof SignupFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, termsAccepted: checked }));
    if (errors.termsAccepted) {
      setErrors((prev) => ({ ...prev, termsAccepted: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<SignupFormData> = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      if (onSubmit) {
        onSubmit(formData);
      }
      console.log("Signup form submitted:", formData);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-2 bg-[#141824] border border-slate-800/50 shadow-2xl rounded-[24px]">
      <div className="w-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(109,91,255,0.3)] mx-auto p-2">
            <BrandLogo size="md" maxWidthClassName="max-w-[3.5rem]" />
          </div>
        </div>

        <div className="premium-card p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50"></div>
          
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
              Create Account
            </h1>
            <p className="text-slate-400 font-normal">
              Start your journey to better financial management
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label 
                htmlFor="username" 
                className="text-xs font-semibold text-slate-400 uppercase tracking-widest ml-1"
              >
                Username
              </Label>
              <div className="relative">
                <Icon
                  name="person"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]"
                />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="John"
                  value={formData.username}
                  onChange={handleChange}
                  className={cn(
                    "w-full h-[52px] pl-12 pr-4 bg-[#1E1E2E]/50 border border-slate-700/50 rounded-[14px] text-sm text-white placeholder-slate-500 transition-all focus:outline-none violet-glow-input",
                    errors.username && "border-red-500 focus:border-red-500"
                  )}
                />
              </div>
              {errors.username && (
                <p className="text-xs text-red-500 mt-1 ml-1">{errors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label 
                htmlFor="email" 
                className="text-xs font-semibold text-slate-400 uppercase tracking-widest ml-1"
              >
                Email Address
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
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={cn(
                    "w-full h-[52px] pl-12 pr-4 bg-[#1E1E2E]/50 border border-slate-700/50 rounded-[14px] text-sm text-white placeholder-slate-500 transition-all focus:outline-none violet-glow-input",
                    errors.email && "border-red-500 focus:border-red-500"
                  )}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1 ml-1">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label 
                htmlFor="password" 
                className="text-xs font-semibold text-slate-400 uppercase tracking-widest ml-1"
              >
                Password
              </Label>
              <PasswordInput
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <Label 
                htmlFor="confirmPassword" 
                className="text-xs font-semibold text-slate-400 uppercase tracking-widest ml-1"
              >
                Confirm Password
              </Label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                placeholder="••••••••"
                icon="lock_reset"
              />
            </div>

            <div className="flex items-start space-x-3 py-2 px-1">
              <Checkbox
                id="terms"
                checked={formData.termsAccepted}
                onCheckedChange={handleCheckboxChange}
                className={cn(
                  "w-4 h-4 rounded border-slate-700 bg-[#1E1E2E] text-primary focus:ring-primary focus:ring-offset-slate-900",
                  errors.termsAccepted && "border-red-500"
                )}
              />
              <Label
                htmlFor="terms"
                className="text-xs text-slate-400 leading-tight cursor-pointer"
              >
                I agree to the{" "}
                <Link href="#" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>
            {errors.termsAccepted && (
              <p className="text-xs text-red-500 mt-1 ml-1">{errors.termsAccepted}</p>
            )}

            <Button
              type="submit"
              className="w-full h-[52px] bg-gradient-to-r from-[#6D5BFF] to-[#8A5CFF] hover:from-[#5A4AE6] hover:to-[#7A4CE6] text-white font-semibold rounded-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 group shadow-lg hover:shadow-[0_0_20px_rgba(109,91,255,0.4)]"
            >
              <span>Sign Up</span>
              <Icon name="arrow_forward" className="text-[18px]" />
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800/50 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?
              <button
                onClick={onLogin}
                className="text-primary font-bold hover:underline ml-1"
              >
                Sign In
              </button>
            </p>
          </div>

          <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10"></div>
          <div className="absolute top-0 left-0 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl -z-10"></div>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;