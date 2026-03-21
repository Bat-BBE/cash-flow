import React from "react";
import Link from "next/link";

interface LoginFooterProps {
  text?: string;
  linkText?: string;
  linkHref?: string;
}

const LoginFooter = ({
  text = "Haven't got an account?",
  linkText = "Sign Up",
  linkHref = "/signup",
}: LoginFooterProps) => {
  return (
    <div className="mt-10 text-center text-[14px] text-white/72">
      {text}
      <Link
        href={linkHref}
        className="font-bold text-white hover:text-primary transition-colors ml-1.5"
      >
        {linkText}
      </Link>
    </div>
  );
};

export default LoginFooter;