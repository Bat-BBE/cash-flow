import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/Icon";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface SignupStep3Props {
  onComplete: (image?: File) => void;
  onBack?: () => void;
  onSkip?: () => void;
}

const SignupStep3 = ({ onComplete, onBack, onSkip }: SignupStep3Props) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleComplete = () => {
    onComplete(selectedFile || undefined);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-3">
          <Icon name="portrait" className="text-primary text-2xl" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Profile <span className="text-primary">Picture</span>
        </h1>
        <p className="text-sm text-slate-400 max-w-[280px] mx-auto">
          Choose a photo that best represents you
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center mb-6">
        <div className="relative w-full max-w-[200px] mx-auto">
          {previewUrl ? (
            <div className="relative group">
              <div className="aspect-square rounded-full border-3 border-primary/20 overflow-hidden shadow-xl">
                <Image
                  src={previewUrl}
                  alt="Profile"
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Icon name="edit" className="text-white text-lg" />
                </button>
                <button
                  onClick={handleRemoveImage}
                  className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Icon name="delete" className="text-white text-lg" />
                </button>
              </div>

              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center border-2 border-[#141824]">
                <Icon name="check" className="text-white text-sm" />
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn(
                "aspect-square rounded-full border-2 border-dashed transition-all cursor-pointer",
                "flex flex-col items-center justify-center text-center",
                isDragging
                  ? "border-primary bg-primary/10 scale-105"
                  : "border-slate-700 bg-slate-800/30 hover:bg-slate-800/50 hover:border-primary/50"
              )}
            >
              <div className={cn(
                "w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3 transition-transform",
                isDragging && "scale-110"
              )}>
                <Icon 
                  name={isDragging ? "cloud_upload" : "add_a_photo"} 
                  className={cn(
                    "text-3xl",
                    isDragging ? "text-primary" : "text-primary"
                  )} 
                />
              </div>
              
              <p className="text-sm font-medium text-slate-300 mb-1">
                {isDragging ? "Drop to upload" : "Upload photo"}
              </p>
              <p className="text-xs text-slate-500">
                Click or drag & drop
              </p>
              <p className="text-[10px] text-slate-600 mt-2">
                JPG, PNG • Max 5MB
              </p>
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex items-center gap-2 bg-slate-800/30 rounded-lg p-3 mb-6">
        <Icon name="info" className="text-slate-500 text-sm shrink-0" />
        <p className="text-xs text-slate-500">
          Your photo helps others recognize you. You can change it later.
        </p>
      </div>

      <div className="space-y-4">
        <Button
          onClick={handleComplete}
          className={cn(
            "w-full h-12 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all",
            previewUrl
              ? "bg-gradient-to-r from-[#6D5BFF] to-[#8A5CFF] hover:from-[#5A4AE6] hover:to-[#7A4CE6] shadow-lg shadow-primary/25"
              : "bg-gradient-to-r from-[#6D5BFF] to-[#8A5CFF] hover:from-[#5A4AE6] hover:to-[#7A4CE6] shadow-lg shadow-primary/25"
          )}
        >
          <span>{previewUrl ? "Continue" : "Skip for now"}</span>
          <Icon name="arrow_forward" className="text-lg" />
        </Button>

        <div className="flex justify-between items-center">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-primary transition-colors group"
            >
              <Icon name="arrow_back" className="text-lg group-hover:-translate-x-1 transition-transform" />
              <span>Back</span>
            </button>
          )}
          
          {onSkip && !previewUrl && (
            <button
              onClick={onSkip}
              className="text-sm text-slate-500 hover:text-primary transition-colors ml-auto"
            >
              Skip
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignupStep3;