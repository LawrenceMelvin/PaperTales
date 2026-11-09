import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
  iconOnly?: boolean;
  className?: string;
}

export default function Logo({
  size = "md",
  showSubtitle = true,
  iconOnly = false,
  className = "",
}: LogoProps) {
  // Dimension tokens based on size prop
  const iconDimensions = {
    sm: "w-8 h-8",
    md: "w-9 h-9",
    lg: "w-11 h-11",
  }[size];

  const textSize = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  }[size];

  return (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      {/* Visual Logo Mark Icon */}
      <div
        className={`${iconDimensions} rounded-xl p-1.5 bg-gradient-to-br from-amber-400/20 via-amber-100/40 to-orange-400/20 border border-amber-500/30 group-hover:border-amber-500/60 transition-all duration-300 flex items-center justify-center shadow-md shadow-amber-500/10 group-hover:shadow-amber-500/25 group-hover:scale-105 shrink-0`}
      >
        <svg
          viewBox="0 0 40 40"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logoPageLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="logoPageRight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FCD34D" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
            <linearGradient id="logoStar" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF" />
              <stop offset="100%" stopColor="#FEF3C7" />
            </linearGradient>
          </defs>

          {/* Left Book Page (Story Wing) */}
          <path
            d="M20 28 C15 26 9 26 5 28 C4.5 20 4.5 15 5 12 C9 10.5 15 11 20 14 Z"
            fill="url(#logoPageLeft)"
          />
          <path
            d="M6 13 C10 11.5 15 12 19 14.5"
            stroke="#FEF3C7"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* Right Book Page (Coloring Wing) */}
          <path
            d="M20 28 C25 26 31 26 35 28 C35.5 20 35.5 15 35 12 C31 10.5 25 11 20 14 Z"
            fill="url(#logoPageRight)"
          />
          <path
            d="M34 13 C30 11.5 25 12 21 14.5"
            stroke="#FEF3C7"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* Spine Center Fold */}
          <path
            d="M20 14 L20 28"
            stroke="#ffffff"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* Sparkle Star Rising from Spine */}
          <path
            d="M20 3 C20.7 6.5 22 7.8 25.5 8.5 C22 9.2 20.7 10.5 20 14 C19.3 10.5 18 9.2 14.5 8.5 C18 7.8 19.3 6.5 20 3 Z"
            fill="url(#logoStar)"
          />
          <circle cx="20" cy="8.5" r="1" fill="#ffffff" />
        </svg>
      </div>

      {/* Wordmark Typography (optional for iconOnly mode) */}
      {!iconOnly && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`${textSize} font-extrabold tracking-tight text-[#1E2530] group-hover:text-amber-700 transition-colors font-serif`}
            >
              Paper<span className="text-amber-600">Tales</span>
            </span>
            <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300 tracking-wider uppercase shadow-sm">
              AI
            </span>
          </div>

          {showSubtitle && (
            <p className="text-[10px] text-slate-500 font-medium tracking-wide mt-0.5 hidden sm:block">
              Personal Story &amp; Coloring Atelier
            </p>
          )}
        </div>
      )}
    </div>
  );
}
