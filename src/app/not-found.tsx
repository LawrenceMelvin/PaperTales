import React from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0e1a] text-[#e0e8f0] px-4 text-center">
      <div className="p-3 rounded-2xl bg-sky-400/10 border border-sky-400/30 text-sky-300 mb-6 glacier-glow">
        <Sparkles className="w-8 h-8 animate-pulse" />
      </div>
      <h1 className="text-7xl font-black text-white font-mono tracking-tight mb-3">404</h1>
      <h2 className="text-2xl font-bold text-sky-200 mb-3">Page Not Found</h2>
      <p className="text-sm text-[#a0b4c4] max-w-md mb-8 leading-relaxed">
        The manuscript or route you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="glacier-btn inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs shadow-lg"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Studio Home</span>
      </Link>
    </div>
  );
}
