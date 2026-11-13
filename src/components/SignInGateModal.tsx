"use client";

import React, { useState } from "react";
import { Sparkles, Lock, ShieldCheck, X, Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

interface SignInGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  proofImageUrl?: string;
  bookTitle?: string;
  activeBookId?: string;
  reason?: string;
}

export default function SignInGateModal({
  isOpen,
  onClose,
  onSuccess,
  proofImageUrl,
  bookTitle,
  activeBookId,
  reason,
}: SignInGateModalProps) {
  const { signInWithGoogle } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const ok = await signInWithGoogle(activeBookId);
      if (ok) {
        onSuccess?.();
        onClose();
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-sky-300/20 bg-[#0f1524]/85 backdrop-blur-2xl p-6 text-slate-100 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          aria-label="Close sign in dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-sky-300 text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Save Your Master Proof</span>
        </div>

        <h2 className="text-xl font-bold text-white mb-2">
          {bookTitle ? `Save "${bookTitle}" & Unlock 5 Free Pages` : "Save Your Character & Claim 5 Free Pages"}
        </h2>

        <p className="text-sm text-slate-300 mb-4 leading-relaxed">
          {reason ||
            "Your Master Page 1 proof is ready! Connect your Google account in one click so your character anchor, spreads, and 5 free pages are saved across devices."}
        </p>

        {proofImageUrl && (
          <div className="mb-4 overflow-hidden rounded-xl border border-sky-300/20 bg-white/5 flex items-center gap-3 p-2.5">
            <img
              src={proofImageUrl}
              alt="Master Page 1 Proof"
              className="w-16 h-16 rounded-lg object-cover bg-white shrink-0"
            />
            <div className="text-xs text-slate-300">
              <div className="font-semibold text-white">Character Anchor Locked</div>
              <div className="text-slate-400 mt-0.5">
                Your progress stays right here — zero page reload.
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={isSigningIn}
          className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-white text-slate-900 font-semibold py-3 px-4 hover:bg-sky-50 active:scale-[0.99] transition-all disabled:opacity-60 shadow-lg"
        >
          {isSigningIn ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
              />
            </svg>
          )}
          <span>{isSigningIn ? "Connecting Google Account..." : "Continue with Google"}</span>
        </button>

        <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Protected by Google Cloud
          </span>
          <button
            onClick={onClose}
            className="hover:text-slate-200 underline underline-offset-2 flex items-center gap-1"
          >
            <Lock className="w-3 h-3" />
            Just preview for now
          </button>
        </div>
      </div>
    </div>
  );
}
