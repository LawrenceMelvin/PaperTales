"use client";

import React, { useEffect, useState } from "react";

export default function BackgroundScrollBook() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Normalize scroll progress across the top 750px of page scroll
          const maxScroll = 750;
          const currentScroll = window.scrollY;
          const progress = Math.min(1, Math.max(0, currentScroll / maxScroll));
          setScrollProgress(progress);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cover angle: 0deg (closed) to -180deg (fully open)
  const coverAngle = -180 * scrollProgress;
  // Dynamic page fanning angles for realistic multi-page depth
  const pageFan1 = -160 * Math.min(1, scrollProgress * 1.05);
  const pageFan2 = -140 * Math.min(1, scrollProgress * 1.1);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden transition-opacity duration-700"
      style={{
        opacity: 0.85,
      }}
    >
      {/* Ambient Glacier Atmospheric Glow (Ice-Blue + Amethyst) */}
      <div
        className="absolute w-[900px] h-[600px] rounded-full blur-[100px] transition-transform duration-500 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(125, 211, 252, 0.14) 0%, rgba(200, 160, 240, 0.08) 45%, transparent 75%)",
          transform: `scale(${0.9 + scrollProgress * 0.25}) rotate(${scrollProgress * 12}deg)`,
        }}
      />

      {/* 3D Scene Viewport */}
      <div
        className="relative mx-auto transition-transform duration-100 ease-out"
        style={{
          perspective: "2000px",
          width: "min(92vw, 860px)",
          height: "min(60vw, 480px)",
          minHeight: "320px",
          maxHeight: "520px",
          transform: `translateY(${Math.min(40, scrollProgress * 50)}px) scale(${0.92 + scrollProgress * 0.08})`,
        }}
      >
        {/* Soft crystalline ground shadow that expands as the book opens */}
        <div
          className="absolute -bottom-10 inset-x-8 h-20 rounded-[50%] bg-[#001f2e]/40 blur-2xl transition-all duration-300"
          style={{
            transform: `scaleX(${0.6 + scrollProgress * 0.45})`,
            opacity: 0.3 + scrollProgress * 0.4,
          }}
        />

        {/* Vintage Illustrated Book Stack in Background (Glacier Tint) */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-500 ease-out z-10"
          style={{
            opacity: Math.max(0.12, 0.55 - scrollProgress * 0.4),
            transform: `translate(${scrollProgress * -130}px, ${scrollProgress * 30}px) scale(${0.85 - scrollProgress * 0.2}) rotate(${scrollProgress * -8}deg)`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/books-stack.png"
            alt="Illustrated Storybook Stack"
            className="w-56 sm:w-72 max-h-[380px] object-contain drop-shadow-2xl filter saturate-95 brightness-95"
          />
        </div>

        {/* ============================================================== */}
        {/* BASE 2-PAGE SPREAD (Glacier Frosted Glass Canvas)              */}
        {/* ============================================================== */}
        <div
          className="absolute inset-0 flex rounded-3xl overflow-hidden backdrop-blur-2xl border border-sky-400/20 shadow-[0_16px_50px_-10px_rgba(0,31,46,0.6)] transition-all duration-300"
          style={{
            background:
              "linear-gradient(135deg, rgba(15, 21, 36, 0.82) 0%, rgba(20, 28, 46, 0.72) 100%)",
          }}
        >
          {/* LEFT INSIDE PAGE (Glacier Story Spread) */}
          <div className="w-1/2 h-full p-6 sm:p-10 flex flex-col justify-between border-r border-sky-400/15 relative overflow-hidden">
            {/* Luminous page edge reflection */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-sky-400/[0.04] pointer-events-none" />

            {/* Subtle Watermarked Content in Glacier Palette */}
            <div className="relative z-10 opacity-60 select-none">
              <div className="flex items-center justify-between border-b border-sky-400/20 pb-2 mb-4">
                <span className="font-mono text-[10px] sm:text-[11px] text-sky-300 tracking-wider font-semibold">
                  Chapter I &bull; Starlight Journey
                </span>
                <span className="text-[10px] font-mono text-purple-300 font-bold bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-400/25">
                  Free Page 1
                </span>
              </div>

              <div className="h-4 w-3/4 bg-sky-400/25 rounded mb-3" />
              <div className="space-y-2">
                <div className="h-2.5 w-full bg-[#e0e8f0]/15 rounded" />
                <div className="h-2.5 w-11/12 bg-[#e0e8f0]/15 rounded" />
                <div className="h-2.5 w-4/5 bg-[#e0e8f0]/15 rounded" />
                <div className="h-2.5 w-5/6 bg-[#e0e8f0]/15 rounded" />
              </div>

              <div className="mt-8 space-y-2 hidden sm:block">
                <div className="h-2.5 w-full bg-[#e0e8f0]/15 rounded" />
                <div className="h-2.5 w-9/12 bg-[#e0e8f0]/15 rounded" />
                <div className="h-2.5 w-3/4 bg-[#e0e8f0]/15 rounded" />
              </div>
            </div>

            {/* Bottom watermark badge */}
            <div className="relative z-10 flex items-center justify-between opacity-50 text-[10px] font-mono text-sky-200">
              <span>Co-created with AI &bull; Character Anchor Locked</span>
              <span>pg. 1</span>
            </div>
          </div>

          {/* RIGHT INSIDE PAGE (Glacier Vector Line-Art Spread) */}
          <div className="w-1/2 h-full p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Center spine gutter reflection */}
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-sky-400/[0.08] to-transparent pointer-events-none" />

            <div className="flex items-center justify-between border-b border-sky-400/20 pb-2 opacity-60 select-none">
              <span className="font-mono text-[10px] sm:text-[11px] text-sky-300">
                Vector Coloring Linework
              </span>
              <span className="text-[10px] font-mono text-purple-300">
                300 DPI
              </span>
            </div>

            {/* Watermark Line Art of Puppy & Crescent Moon */}
            <div className="flex-1 flex items-center justify-center opacity-45 sm:opacity-55 select-none p-2">
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full max-h-[220px]"
                fill="none"
                stroke="#7dd3fc"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Crescent Moon */}
                <path d="M 140 30 A 60 60 0 1 0 170 120 A 45 45 0 0 1 140 30 Z" strokeWidth="2.2" stroke="#c8a0f0" />
                {/* Floating Stars */}
                <polygon points="50,40 53,47 60,48 55,53 56,60 50,56 44,60 45,53 40,48 47,47" strokeWidth="1.5" stroke="#7dd3fc" />
                <polygon points="165,75 167,80 172,81 168,85 169,90 165,87 161,90 162,85 158,81 163,80" strokeWidth="1.5" stroke="#7dd3fc" />
                <polygon points="85,25 87,29 91,30 88,33 89,37 85,35 81,37 82,33 79,30 83,29" strokeWidth="1.5" stroke="#c8a0f0" />
                {/* Cloud */}
                <path d="M 30 155 Q 30 140 45 140 Q 55 125 75 130 Q 90 120 105 135 Q 120 135 125 155 Z" strokeWidth="1.8" stroke="#88b4cc" />
                {/* Puppy Face & Ears */}
                <circle cx="105" cy="85" r="28" strokeWidth="2.4" stroke="#7dd3fc" />
                <path d="M 82 72 C 70 80, 68 105, 80 110 C 86 100, 86 85, 84 75" strokeWidth="2" stroke="#7dd3fc" />
                <path d="M 128 72 C 140 80, 142 105, 130 110 C 124 100, 124 85, 126 75" strokeWidth="2" stroke="#7dd3fc" />
                <circle cx="96" cy="82" r="3" fill="#7dd3fc" />
                <circle cx="114" cy="82" r="3" fill="#7dd3fc" />
                <ellipse cx="105" cy="92" rx="4" ry="2.5" fill="#7dd3fc" />
                <path d="M 101 97 Q 105 101 109 97" strokeWidth="1.8" stroke="#7dd3fc" />
                {/* Scarf */}
                <path d="M 85 106 C 95 116, 115 116, 125 106 C 128 116, 124 122, 105 122 C 86 122, 82 116, 85 106 Z" stroke="#c8a0f0" strokeWidth="2.5" />
                <path d="M 115 116 L 122 138 L 132 135 L 124 116" stroke="#c8a0f0" strokeWidth="2.2" />
                <ellipse cx="94" cy="128" rx="7" ry="12" strokeWidth="2" stroke="#7dd3fc" />
                <ellipse cx="114" cy="128" rx="7" ry="12" strokeWidth="2" stroke="#7dd3fc" />
              </svg>
            </div>

            <div className="relative z-10 flex items-center justify-between opacity-50 text-[10px] font-mono text-sky-200">
              <span>Lulu Print Softcover Ready</span>
              <span>pg. 2</span>
            </div>
          </div>

          {/* Central Book Spine Crease & Ribbon */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-3 pointer-events-none bg-gradient-to-r from-sky-900/20 via-sky-400/25 to-sky-900/20 z-20 flex flex-col items-center">
            {/* Luminous Ice-Blue Bookmark Ribbon */}
            <div
              className="w-2 bg-gradient-to-r from-sky-400 via-sky-300 to-blue-500 shadow-md origin-top transition-transform duration-300"
              style={{
                height: `${70 + scrollProgress * 30}%`,
                clipPath: "polygon(0 0, 100% 0, 100% 90%, 50% 100%, 0 90%)",
                transform: `rotate(${(scrollProgress - 0.5) * 8}deg)`,
              }}
            />
          </div>
        </div>

        {/* ============================================================== */}
        {/* FANNING INTERMEDIATE PAGES                                     */}
        {/* ============================================================== */}
        <div
          className="absolute inset-y-0 right-0 w-1/2 rounded-r-2xl origin-left pointer-events-none transition-transform duration-75 ease-out backdrop-blur-xl"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateY(${pageFan1}deg)`,
            background: "rgba(15, 21, 36, 0.5)",
            border: "1px solid rgba(125, 211, 252, 0.2)",
            opacity: scrollProgress > 0.05 && scrollProgress < 0.95 ? 0.75 : 0,
          }}
        />
        <div
          className="absolute inset-y-0 right-0 w-1/2 rounded-r-2xl origin-left pointer-events-none transition-transform duration-75 ease-out backdrop-blur-xl"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateY(${pageFan2}deg)`,
            background: "rgba(15, 21, 36, 0.4)",
            border: "1px solid rgba(125, 211, 252, 0.15)",
            opacity: scrollProgress > 0.1 && scrollProgress < 0.9 ? 0.55 : 0,
          }}
        />

        {/* ============================================================== */}
        {/* TRANSLUCENT 3D FRONT COVER (Glacier Glass)                     */}
        {/* ============================================================== */}
        <div
          className="absolute inset-y-0 right-0 w-1/2 rounded-r-3xl origin-left z-30 transition-transform duration-75 ease-out"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateY(${coverAngle}deg)`,
            boxShadow:
              scrollProgress < 0.98
                ? `${-25 * (1 - scrollProgress)}px 20px 45px -10px rgba(0, 31, 46, 0.5)`
                : "none",
          }}
        >
          {/* FRONT COVER FACE (Seen when closed, rotateY = 0) */}
          <div
            className="absolute inset-0 rounded-r-3xl backdrop-blur-2xl p-6 sm:p-10 flex flex-col justify-between border-y-2 border-r-2 border-sky-400/30 text-[#e0e8f0] shadow-2xl overflow-hidden select-none"
            style={{
              backfaceVisibility: "hidden",
              background:
                "linear-gradient(135deg, rgba(15, 21, 36, 0.88) 0%, rgba(20, 28, 46, 0.82) 50%, rgba(14, 77, 110, 0.35) 100%)",
            }}
          >
            {/* Crystalline Luminous Frame */}
            <div className="absolute inset-3 rounded-r-2xl border border-sky-400/20 pointer-events-none" />
            <div className="absolute inset-4 rounded-r-xl border border-dashed border-sky-300/15 pointer-events-none" />

            {/* Glowing Header */}
            <div className="relative z-10 flex items-center justify-between text-[10px] font-mono font-bold text-sky-300/70 uppercase tracking-widest">
              <span>PaperTales AI</span>
              <span>100% Free First 5 Pages</span>
            </div>

            <div className="relative z-10 text-center my-auto flex flex-col items-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-sky-400/20 to-purple-500/20 border border-sky-400/40 flex items-center justify-center mb-3 shadow-inner">
                <span className="text-2xl sm:text-3xl">📖</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-sm">
                PaperTales AI
              </h2>
              <p className="mt-1 text-xs text-sky-200/70 font-mono">
                Glacier Glassmorphism Studio
              </p>
            </div>

            <div className="relative z-10 flex items-center justify-between text-[9px] font-mono text-[#a0b4c4]">
              <span>PayPal AI Rails</span>
              <span>Lulu Print POD</span>
            </div>
          </div>

          {/* INSIDE OF FRONT COVER (Seen when open, rotateY = 180) */}
          <div
            className="absolute inset-0 rounded-l-3xl backdrop-blur-2xl p-6 sm:p-10 flex flex-col justify-between border-y-2 border-l-2 border-sky-400/25 text-[#e0e8f0] shadow-inner overflow-hidden select-none"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background:
                "linear-gradient(135deg, rgba(15, 21, 36, 0.85) 0%, rgba(20, 28, 46, 0.75) 100%)",
            }}
          >
            <div className="relative z-10 opacity-60">
              <span className="text-[10px] font-mono uppercase tracking-widest text-sky-300 block mb-1">
                Glacier Glass Edition
              </span>
              <p className="font-sans italic text-xs text-slate-300">
                &ldquo;Where Bedtime Stories Turn Into Real Books.&rdquo;
              </p>
            </div>

            <div className="relative z-10 opacity-40 text-[9px] font-mono text-sky-300 text-right">
              Powered by PayPal Smart Rails
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
