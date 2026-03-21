import React from "react";

interface DividerProps {
  text?: string;
}

const Divider = ({ text = "or" }: DividerProps) => {
  return (
    <div className="relative py-8">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-white/10"></div>
      </div>
      <div className="relative flex justify-center text-[11px] uppercase tracking-widest font-bold">
        <span className="px-4 bg-[#0E1729] text-slate-500">{text}</span>
      </div>
    </div>
  );
};

export default Divider;