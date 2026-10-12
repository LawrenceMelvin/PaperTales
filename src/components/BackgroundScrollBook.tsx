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
        // Smoothly adjust opacity so it's a dreamy ambient background that never distracts
        opacity: 0.85,
      }}
    >
      {/* Ambient background aura / cosmic glow */}
      <div
        className="absolute w-[800px] h-[550px] rounded-full blur-3xl transition-transform duration-300"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(59, 130, 246, 0.12) 0%, rgba(245, 158, 11, 0.08) 45%, transparent 75%)",
          transform: `scale(${0.9 + scrollProgress * 0.3}) rotate(${scrollProgress * 15}deg)`,
        }}
      />

      {/* 3D Scene Viewport */}
      <div
        className="relative mx-auto transition-transform duration-100 ease-out"
        style={{
          perspective: "2000px",
          width: "min(92vw, 840px)",
          height: "min(60vw, 480px)",
          minHeight: "320px",
          maxHeight: "520px",
          transform: `translateY(${Math.min(40, scrollProgress * 50)}px) scale(${0.92 + scrollProgress * 0.08})`,
        }}
      >
        {/* Soft ground shadow that expands as the book opens */}
        <div
          className="absolute -bottom-10 inset-x-8 h-20 rounded-[50%] bg-blue-950/10 blur-2xl transition-all duration-300"
          style={{
            transform: `scaleX(${0.6 + scrollProgress * 0.45})`,
            opacity: 0.3 + scrollProgress * 0.4,
          }}
        />

        {/* ============================================================== */}
        {/* BASE 2-PAGE SPREAD (Resting open in the background)             */}
        {/* ============================================================== */}
        <div
          className="absolute inset-0 flex rounded-3xl overflow-hidden backdrop-blur-[3px] border border-blue-400/25 shadow-[0_12px_45px_-10px_rgba(30,58,138,0.08)] transition-all duration-300"
          style={{
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.55) 0%, rgba(248, 250, 252, 0.45) 50%, rgba(241, 245, 249, 0.4) 100%)",
          }}
        >
          {/* LEFT INSIDE PAGE (Translucent Watermark Story Spread) */}
          <div className="w-1/2 h-full p-6 sm:p-10 flex flex-col justify-between border-r border-blue-200/30 relative overflow-hidden">
            {/* Soft inner page curve shading */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-950/[0.04] pointer-events-none" />

            {/* Subtle Watermarked Content */}
            <div className="relative z-10 opacity-40 select-none">
              <div className="flex items-center justify-between border-b border-blue-300/30 pb-2 mb-4">
                <span className="font-serif italic text-[11px] sm:text-xs text-blue-900 tracking-wider">
                  Chapter I &bull; Starlight Tale
                </span>
                <span className="text-[10px] font-mono text-blue-800 font-bold">
                  Free Page 1
                </span>
              </div>

              <div className="h-4 w-3/4 bg-blue-900/15 rounded mb-3" />
              <div className="space-y-2">
                <div className="h-2.5 w-full bg-slate-900/10 rounded" />
                <div className="h-2.5 w-11/12 bg-slate-900/10 rounded" />
                <div className="h-2.5 w-4/5 bg-slate-900/10 rounded" />
                <div className="h-2.5 w-5/6 bg-slate-900/10 rounded" />
              </div>

              <div className="mt-8 space-y-2 hidden sm:block">
                <div className="h-2.5 w-full bg-slate-900/10 rounded" />
                <div className="h-2.5 w-9/12 bg-slate-900/10 rounded" />
                <div className="h-2.5 w-3/4 bg-slate-900/10 rounded" />
              </div>
            </div>

            {/* Bottom watermark badge */}
            <div className="relative z-10 flex items-center justify-between opacity-30 text-[10px] font-serif text-blue-950">
              <span>Co-created with AI &bull; Character Anchor Locked</span>
              <span>pg. 1</span>
            </div>
          </div>

          {/* RIGHT INSIDE PAGE (Translucent Coloring Line-Art Watermark) */}
          <div className="w-1/2 h-full p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Center spine shadow */}
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-blue-950/[0.06] to-transparent pointer-events-none" />

            <div className="flex items-center justify-between border-b border-blue-300/30 pb-2 opacity-40 select-none">
              <span className="font-serif italic text-[11px] sm:text-xs text-blue-900">
                Vector Coloring Illustration
              </span>
              <span className="text-[10px] font-mono text-blue-800">
                300 DPI
              </span>
            </div>

            {/* Watermark Line Art of Puppy & Crescent Moon */}
            <div className="flex-1 flex items-center justify-center opacity-30 sm:opacity-35 select-none p-2">
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full max-h-[220px]"
                fill="none"
                stroke="#1e3a8a"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Crescent Moon */}
                <path d="M 140 30 A 60 60 0 1 0 170 120 A 45 45 0 0 1 140 30 Z" strokeWidth="2.2" />
                {/* Floating Stars */}
                <polygon points="50,40 53,47 60,48 55,53 56,60 50,56 44,60 45,53 40,48 47,47" strokeWidth="1.5" />
                <polygon points="165,75 167,80 172,81 168,85 169,90 165,87 161,90 162,85 158,81 163,80" strokeWidth="1.5" />
                <polygon points="85,25 87,29 91,30 88,33 89,37 85,35 81,37 82,33 79,30 83,29" strokeWidth="1.5" />
                {/* Cloud */}
                <path d="M 30 155 Q 30 140 45 140 Q 55 125 75 130 Q 90 120 105 135 Q 120 135 125 155 Z" strokeWidth="1.8" />
                {/* Puppy Face & Ears */}
                <circle cx="105" cy="85" r="28" strokeWidth="2.4" />
                <path d="M 82 72 C 70 80, 68 105, 80 110 C 86 100, 86 85, 84 75" strokeWidth="2" />
                <path d="M 128 72 C 140 80, 142 105, 130 110 C 124 100, 124 85, 126 75" strokeWidth="2" />
                <circle cx="96" cy="82" r="3" fill="#1e3a8a" />
                <circle cx="114" cy="82" r="3" fill="#1e3a8a" />
                <ellipse cx="105" cy="92" rx="4" ry="2.5" fill="#1e3a8a" />
                <path d="M 101 97 Q 105 101 109 97" strokeWidth="1.8" />
                {/* Scarf */}
                <path d="M 85 106 C 95 116, 115 116, 125 106 C 128 116, 124 122, 105 122 C 86 122, 82 116, 85 106 Z" stroke="#ef4444" strokeWidth="2.5" />
                <path d="M 115 116 L 122 138 L 132 135 L 124 116" stroke="#ef4444" strokeWidth="2.2" />
                <ellipse cx="94" cy="128" rx="7" ry="12" strokeWidth="2" />
                <ellipse cx="114" cy="128" rx="7" ry="12" strokeWidth="2" />
              </svg>
            </div>

            <div className="relative z-10 flex items-center justify-between opacity-30 text-[10px] font-serif text-blue-950">
              <span>Lulu Print Softcover Ready</span>
              <span>pg. 2</span>
            </div>
          </div>

          {/* Central Book Spine Crease & Ribbon */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-3 pointer-events-none bg-gradient-to-r from-blue-900/10 via-amber-900/15 to-blue-900/10 z-20 flex flex-col items-center">
            {/* Translucent Crimson Bookmark Ribbon */}
            <div
              className="w-2 bg-gradient-to-r from-red-500/60 to-rose-600/60 shadow-sm origin-top transition-transform duration-300"
              style={{
                height: `${70 + scrollProgress * 30}%`,
                clipPath: "polygon(0 0, 100% 0, 100% 90%, 50% 100%, 0 90%)",
                transform: `rotate(${(scrollProgress - 0.5) * 8}deg)`,
              }}
            />
          </div>
        </div>

        {/* ============================================================== */}
        {/* FANNING INTERMEDIATE PAGES (Adds layered depth as it opens)    */}
        {/* ============================================================== */}
        <div
          className="absolute inset-y-0 right-0 w-1/2 rounded-r-2xl origin-left pointer-events-none transition-transform duration-75 ease-out backdrop-blur-[2px]"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateY(${pageFan1}deg)`,
            background: "rgba(255, 255, 255, 0.25)",
            border: "1px solid rgba(191, 219, 254, 0.3)",
            opacity: scrollProgress > 0.05 && scrollProgress < 0.95 ? 0.7 : 0,
          }}
        />
        <div
          className="absolute inset-y-0 right-0 w-1/2 rounded-r-2xl origin-left pointer-events-none transition-transform duration-75 ease-out backdrop-blur-[2px]"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateY(${pageFan2}deg)`,
            background: "rgba(255, 255, 255, 0.2)",
            border: "1px solid rgba(191, 219, 254, 0.2)",
            opacity: scrollProgress > 0.1 && scrollProgress < 0.9 ? 0.5 : 0,
          }}
        />

        {/* ============================================================== */}
        {/* TRANSLUCENT 3D FRONT COVER (Flips from right to left as scroll)*/}
        {/* ============================================================== */}
        <div
          className="absolute inset-y-0 right-0 w-1/2 rounded-r-3xl origin-left z-30 transition-transform duration-75 ease-out"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateY(${coverAngle}deg)`,
            boxShadow:
              scrollProgress < 0.98
                ? `${-25 * (1 - scrollProgress)}px 20px 40px -10px rgba(30, 58, 138, 0.15)`
                : "none",
          }}
        >
          {/* FRONT COVER FACE (Seen when closed, rotateY = 0) */}
          <div
            className="absolute inset-0 rounded-r-3xl backdrop-blur-md p-6 sm:p-10 flex flex-col justify-between border-y-2 border-r-2 border-blue-400/40 text-blue-950 shadow-xl overflow-hidden select-none"
            style={{
              backfaceVisibility: "hidden",
              background:
                "linear-gradient(135deg, rgba(238, 242, 255, 0.75) 0%, rgba(224, 231, 255, 0.6) 50%, rgba(219, 234, 254, 0.55) 100%)",
            }}
          >
            {/* Elegant Translucent Embossed Frame */}
            <div className="absolute inset-3 rounded-r-2xl border border-blue-500/20 pointer-events-none" />
            <div className="absolute inset-4 rounded-r-xl border border-dashed border-amber-500/25 pointer-events-none" />

            {/* Glowing Golden Crest in Center */}
            <div className="relative z-10 flex items-center justify-between text-[10px] font-mono font-bold text-blue-900/60 uppercase tracking-widest">
              <span>PaperTales AI</span>
              <span>100% Free First 5 Pages</span>
            </div>

            <div className="relative z-10 text-center my-auto flex flex-col items-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-amber-500/20 border border-blue-400/40 flex items-center justify-center mb-3 shadow-inner">
                <span className="text-2xl sm:text-3xl">📖</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-black tracking-tight text-blue-950/80">
                PaperTales AI
              </h2>
              <p className="mt-1 text-xs font-serif italic text-blue-900/60">
                Where Bedtime Stories Come Alive
              </p>
            </div>

            <div className="relative z-10 flex items-center justify-between text-[9px] font-mono text-blue-900/50">
              <span>PayPal AI Rails</span>
              <span>Lulu Print POD</span>
            </div>
          </div>

          {/* INSIDE OF FRONT COVER (Seen when open, rotateY = 180) */}
          <div
            className="absolute inset-0 rounded-l-3xl backdrop-blur-md p-6 sm:p-10 flex flex-col justify-between border-y-2 border-l-2 border-blue-400/30 text-blue-950 shadow-inner overflow-hidden select-none"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background:
                "linear-gradient(135deg, rgba(248, 250, 252, 0.7) 0%, rgba(241, 245, 249, 0.6) 100%)",
            }}
          >
            <div className="relative z-10 opacity-40">
              <span className="text-[10px] font-serif uppercase tracking-widest text-blue-900 block mb-1">
                Dedication
              </span>
              <p className="font-serif italic text-xs text-slate-800">
                &ldquo;To the young storytellers who dream beyond limits.&rdquo;
              </p>
            </div>

            <div className="relative z-10 opacity-30 text-[9px] font-mono text-blue-900 text-right">
              Crafted on PayPal Smart Rails
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
