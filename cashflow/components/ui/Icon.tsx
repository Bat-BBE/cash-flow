import React from "react";
import { cn } from "@/lib/utils";

interface IconProps {
  name: string;
  className?: string;
  onClick?: () => void;
}

const Icon = ({ name, className, onClick }: IconProps) => {
  return (
    <span
      className={cn("material-symbols-outlined select-none", className)}
      onClick={onClick}
    >
      {name}
    </span>
  );
};

export default Icon;