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
        className={`${iconDimensions} rounded-xl p-1.5 bg-gradient-to-br from-sky-400/15 via-slate-900/60 to-purple-500/15 border border-sky-400/30 group-hover:border-sky-400/60 transition-all duration-300 flex items-center justify-center shadow-lg shadow-sky-500/10 group-hover:shadow-sky-400/20 group-hover:scale-105 shrink-0`}
      >
        <svg
          viewBox="0 0 40 40"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logoPageLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="logoPageRight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
            <linearGradient id="logoStar" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#67e8f9" />
            </linearGradient>
          </defs>

          {/* Left Book Page (Story Wing) */}
          <path
            d="M20 28 C15 26 9 26 5 28 C4.5 20 4.5 15 5 12 C9 10.5 15 11 20 14 Z"
            fill="url(#logoPageLeft)"
          />
          <path
            d="M6 13 C10 11.5 15 12 19 14.5"
            stroke="#bae6fd"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Right Book Page (Coloring Wing) */}
          <path
            d="M20 28 C25 26 31 26 35 28 C35.5 20 35.5 15 35 12 C31 10.5 25 11 20 14 Z"
            fill="url(#logoPageRight)"
          />
          <path
            d="M34 13 C30 11.5 25 12 21 14.5"
            stroke="#f3e8ff"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Spine Center Fold */}
          <path
            d="M20 14 L20 28"
            stroke="#ffffff"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.8"
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
              className={`${textSize} font-extrabold tracking-tight text-white group-hover:text-sky-200 transition-colors`}
            >
              Paper<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-300">Tales</span>
            </span>
            <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded-md bg-gradient-to-r from-sky-500/20 to-purple-500/20 text-sky-300 border border-sky-400/35 tracking-wider uppercase shadow-sm">
              AI
            </span>
          </div>

          {showSubtitle && (
            <p className="text-[10px] text-[#a0b4c4] font-medium tracking-wide mt-0.5 hidden sm:block">
              Story &amp; Coloring Studio
            </p>
          )}
        </div>
      )}
    </div>
  );
}
