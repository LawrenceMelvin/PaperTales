"use client";

import React, { useEffect, useState, useRef } from "react";
import { Sparkles, BookOpen, Lock, Palette, CheckCircle, ArrowDown } from "lucide-react";

export default function ScrollOpeningBook() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0); // 0 (closed) to 1 (fully open)

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          
          // Calculate progress based on container position relative to viewport
          // Starts opening as it enters the viewport, fully open when centered
          const start = windowHeight * 0.85;
          const end = windowHeight * 0.15;
          const totalDistance = start - end;
          const currentPos = start - rect.top;
          
          const progress = Math.min(1, Math.max(0, currentPos / totalDistance));
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
  // Dynamic 3D lighting shadow based on angle
  const shadowIntensity = Math.sin(scrollProgress * Math.PI);
  // Spread width expands gracefully as it opens
  const spreadScale = 0.95 + scrollProgress * 0.05;

  return (
    <div
      ref={containerRef}
      className="relative w-full py-12 sm:py-20 flex flex-col items-center justify-center overflow-visible select-none"
    >
      {/* Scroll instruction indicator that fades as user scrolls */}
      <div
        className="mb-6 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 text-amber-300 text-xs font-semibold backdrop-blur-md shadow-md border border-amber-500/30 transition-all duration-300"
        style={{
          opacity: Math.max(0, 1 - scrollProgress * 3),
          transform: `translateY(${scrollProgress * 20}px)`,
        }}
      >
        <ArrowDown className="w-3.5 h-3.5 animate-bounce text-amber-400" />
        <span>Scroll down to open the storybook</span>
      </div>

      {/* 3D Scene Wrapper with Perspective */}
      <div
        className="relative mx-auto transition-transform duration-75 ease-out"
        style={{
          perspective: "1600px",
          transform: `scale(${spreadScale})`,
          width: "min(92vw, 760px)",
          height: "min(58vw, 460px)",
          minHeight: "340px",
          maxHeight: "480px",
        }}
      >
        {/* Soft Ambient Table / Backdrop Glow */}
        <div
          className="absolute inset-0 rounded-3xl transition-opacity duration-500 blur-2xl"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(59, 130, 246, 0.25) 0%, rgba(217, 119, 6, 0.15) 50%, transparent 80%)",
            opacity: 0.3 + scrollProgress * 0.7,
            transform: "translateY(20px) scale(1.1)",
          }}
        />

        {/* Ambient Drop Shadow of the open book */}
        <div
          className="absolute -bottom-8 inset-x-4 h-16 rounded-[50%] bg-black/25 blur-xl transition-all duration-300"
          style={{
            opacity: 0.2 + shadowIntensity * 0.4 + scrollProgress * 0.3,
            transform: `scaleX(${0.7 + scrollProgress * 0.35})`,
          }}
        />

        {/* ============================================================== */}
        {/* THE 2-PAGE SPREAD BASE (Base pages resting open on the desk)   */}
        {/* ============================================================== */}
        <div className="absolute inset-0 flex rounded-2xl shadow-2xl overflow-hidden border border-amber-900/20 bg-[#faf7f2]">
          {/* LEFT INSIDE PAGE (Appears as front cover flips open) */}
          <div className="w-1/2 h-full p-4 sm:p-7 flex flex-col justify-between border-r border-amber-200/60 bg-gradient-to-br from-[#fcfaf7] via-[#faf6f0] to-[#f4ece1] relative overflow-hidden">
            {/* Subtle paper grain & page curvature vignette */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-transparent to-amber-950/[0.08]" />

            <div>
              <div className="flex items-center justify-between border-b border-amber-900/15 pb-2.5 mb-3">
                <span className="text-[10px] sm:text-xs font-serif italic text-amber-900/70 tracking-widest uppercase">
                  Chapter 1 &bull; Bedtime Tale
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle className="w-2.5 h-2.5" />
                  Free Page 1
                </span>
              </div>

              <h3 className="font-serif text-base sm:text-2xl font-bold text-slate-900 leading-snug tracking-tight">
                Barnaby&apos;s Starlight Journey
              </h3>

              <p className="mt-2 text-[11px] sm:text-xs font-serif text-slate-700 leading-relaxed sm:leading-loose text-justify">
                Once upon a moonlit night, little Barnaby wrapped his favorite crimson scarf snugly around his neck. 
                With a curious wag of his golden tail, he stepped into the whispering forest where constellations danced like fireflies.
              </p>
            </div>

            {/* Character Anchor Badge */}
            <div className="mt-2 pt-2 border-t border-amber-900/10 flex flex-col gap-1.5">
              <div className="inline-flex items-center gap-1.5 text-[9px] sm:text-[11px] font-semibold text-blue-900 bg-blue-50/80 px-2.5 py-1 rounded-lg border border-blue-200 w-fit">
                <Lock className="w-3 h-3 text-blue-700" />
                <span>Character Anchor: <strong>Barnaby (Golden Fur, Red Scarf)</strong></span>
              </div>
              <div className="flex items-center justify-between text-[9px] text-slate-500 italic">
                <span>Prompted by Sarah (Mom) &amp; Leo (Age 6)</span>
                <span>Page 1</span>
              </div>
            </div>
          </div>

          {/* RIGHT INSIDE PAGE (Vector Coloring Outline) */}
          <div className="w-1/2 h-full p-4 sm:p-7 flex flex-col justify-between bg-gradient-to-bl from-[#fcfaf7] via-[#faf6f0] to-[#f4ece1] relative overflow-hidden">
            {/* Center spine gutter shadow */}
            <div className="absolute inset-y-0 left-0 w-8 pointer-events-none bg-gradient-to-r from-amber-950/[0.12] to-transparent" />

            {/* Coloring Page Header */}
            <div className="flex items-center justify-between border-b border-amber-900/15 pb-2 mb-2">
              <span className="text-[10px] sm:text-xs font-serif italic text-amber-900/70 tracking-wider">
                Interactive Coloring Page
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono font-bold text-slate-500">
                300 DPI Vector
              </span>
            </div>

            {/* Vector Line Art Illustration Container */}
            <div className="flex-1 flex items-center justify-center relative p-1 sm:p-2">
              <div className="w-full h-full max-h-[220px] rounded-xl border border-dashed border-slate-400/50 bg-white flex items-center justify-center p-2 relative shadow-inner">
                {/* SVG Vector Coloring Art of Barnaby Pup */}
                <svg
                  viewBox="0 0 200 200"
                  className="w-full h-full max-h-[190px] drop-shadow-xs"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* Crescent Moon */}
                  <path
                    d="M 140 30 A 60 60 0 1 0 170 120 A 45 45 0 0 1 140 30 Z"
                    fill="none"
                    stroke="#0f172a"
                    strokeWidth="2.5"
                  />
                  {/* Stars */}
                  <polygon points="50,40 53,47 60,48 55,53 56,60 50,56 44,60 45,53 40,48 47,47" fill="none" stroke="#0f172a" strokeWidth="1.5" />
                  <polygon points="170,80 172,85 177,86 173,90 174,95 170,92 166,95 167,90 163,86 168,85" fill="none" stroke="#0f172a" strokeWidth="1.5" />
                  <polygon points="85,25 87,29 91,30 88,33 89,37 85,35 81,37 82,33 79,30 83,29" fill="none" stroke="#0f172a" strokeWidth="1.5" />
                  
                  {/* Cloud under moon */}
                  <path
                    d="M 30 155 Q 30 140 45 140 Q 55 125 75 130 Q 90 120 105 135 Q 120 135 125 155 Z"
                    fill="none"
                    stroke="#334155"
                    strokeWidth="2"
                  />

                  {/* Puppy Body & Head */}
                  <circle cx="105" cy="85" r="28" stroke="#0f172a" strokeWidth="2.8" />
                  
                  {/* Puppy Floppy Ears */}
                  <path d="M 82 72 C 70 80, 68 105, 80 110 C 86 100, 86 85, 84 75" stroke="#0f172a" strokeWidth="2.5" />
                  <path d="M 128 72 C 140 80, 142 105, 130 110 C 124 100, 124 85, 126 75" stroke="#0f172a" strokeWidth="2.5" />

                  {/* Puppy Eyes */}
                  <circle cx="96" cy="82" r="3" fill="#0f172a" stroke="none" />
                  <circle cx="114" cy="82" r="3" fill="#0f172a" stroke="none" />

                  {/* Puppy Cute Nose & Smile */}
                  <ellipse cx="105" cy="92" rx="4" ry="2.5" fill="#0f172a" stroke="none" />
                  <path d="M 101 97 Q 105 101 109 97" stroke="#0f172a" strokeWidth="2" />

                  {/* Character Anchor: Red Scarf */}
                  <path
                    d="M 85 106 C 95 116, 115 116, 125 106 C 128 116, 124 122, 105 122 C 86 122, 82 116, 85 106 Z"
                    stroke="#dc2626"
                    strokeWidth="3"
                  />
                  <path d="M 115 116 L 122 138 L 132 135 L 124 116" stroke="#dc2626" strokeWidth="2.5" />

                  {/* Front Paws resting on cloud */}
                  <ellipse cx="94" cy="128" rx="7" ry="12" stroke="#0f172a" strokeWidth="2.5" />
                  <ellipse cx="114" cy="128" rx="7" ry="12" stroke="#0f172a" strokeWidth="2.5" />
                </svg>

                {/* Stamp overlay */}
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-amber-100/90 border border-amber-300 text-amber-900 text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wider shadow-xs flex items-center gap-1">
                  <Palette className="w-2.5 h-2.5 text-amber-700" />
                  Ready to Color
                </div>
              </div>
            </div>

            {/* Footer note on right page */}
            <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1.5 border-t border-amber-900/10">
              <span className="font-semibold text-blue-700">Lulu Print Bleed Tested &bull; 0.125&quot;</span>
              <span>Page 2</span>
            </div>
          </div>

          {/* Central Book Spine Crease & Ribbon Bookmark */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-4 pointer-events-none spine-gradient z-20 flex flex-col items-center">
            {/* Red Silk Ribbon Bookmark */}
            <div
              className="w-2.5 bg-gradient-to-r from-red-700 via-rose-600 to-red-800 shadow-md origin-top transition-transform duration-300"
              style={{
                height: `${75 + scrollProgress * 25}%`,
                clipPath: "polygon(0 0, 100% 0, 100% 90%, 50% 100%, 0 90%)",
                transform: `rotate(${(scrollProgress - 0.5) * 6}deg)`,
              }}
            />
          </div>
        </div>

        {/* ============================================================== */}
        {/* THE 3D FLIPPING FRONT COVER (Rotates around left spine)         */}
        {/* ============================================================== */}
        <div
          className="absolute inset-y-0 right-0 w-1/2 rounded-r-2xl origin-left z-30 transition-transform duration-75 ease-out"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateY(${coverAngle}deg)`,
            boxShadow:
              scrollProgress < 0.98
                ? `${-20 * (1 - scrollProgress)}px 25px 50px -10px rgba(0, 0, 0, 0.45)`
                : "none",
          }}
        >
          {/* FRONT COVER FACE (Visible when closed, rotateY = 0) */}
          <div
            className="absolute inset-0 rounded-r-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 p-5 sm:p-7 flex flex-col justify-between border-y-2 border-r-2 border-amber-400/50 text-white shadow-2xl overflow-hidden"
            style={{
              backfaceVisibility: "hidden",
            }}
          >
            {/* Embossed Leather & Gold Foil Frame */}
            <div className="absolute inset-2 sm:inset-3 rounded-r-xl border border-amber-400/30 pointer-events-none" />
            <div className="absolute inset-2.5 sm:inset-3.5 rounded-r-lg border border-dashed border-amber-300/20 pointer-events-none" />

            {/* Golden Starfield Shimmer */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(251,191,36,0.18)_0%,transparent_60%)] pointer-events-none" />

            {/* Cover Header */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-widest uppercase text-amber-300/80 font-mono">
                PayPal AI Hackathon 2026
              </span>
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            </div>

            {/* Book Title & Golden Crest */}
            <div className="relative z-10 text-center my-auto flex flex-col items-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-3 border-2 border-amber-200">
                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-950" />
              </div>

              <h2 className="font-serif text-xl sm:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300 drop-shadow-sm">
                PaperTales AI
              </h2>

              <p className="mt-1 text-[11px] sm:text-xs font-serif italic text-amber-200/90 max-w-[220px]">
                Co-Create Custom Storybooks &bull; First 5 Pages Free
              </p>

              <div className="mt-4 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/40 text-[10px] font-bold text-amber-300">
                Turn the page to see inside &rarr;
              </div>
            </div>

            {/* Cover Bottom Branding */}
            <div className="relative z-10 flex items-center justify-between text-[9px] text-amber-300/60 font-mono">
              <span>Lulu Print POD</span>
              <span>PayPal Smart Commerce</span>
            </div>
          </div>

          {/* BACK OF FRONT COVER (Inside Left Flyleaf, visible when open, rotateY = -180) */}
          <div
            className="absolute inset-0 rounded-l-2xl bg-gradient-to-br from-[#f5ede0] via-[#f9f3e9] to-[#eee2cf] p-5 sm:p-7 flex flex-col justify-between border-y-2 border-l-2 border-amber-900/20 text-slate-900 shadow-inner overflow-hidden"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            {/* Flyleaf marbling texture effect */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(217,119,6,0.08)_0%,transparent_70%)] pointer-events-none" />

            <div className="relative z-10">
              <span className="text-[10px] font-serif italic text-amber-900/60 uppercase tracking-widest block mb-1">
                Dedication &amp; Provenance
              </span>
              <h4 className="font-serif text-sm sm:text-base font-bold text-slate-800">
                Crafted for Young Dreamers
              </h4>
              <p className="mt-1 text-[10px] sm:text-[11px] text-slate-600 font-serif leading-relaxed">
                Every story in PaperTales AI is uniquely generated from a parent or child&apos;s imagination. 
                Zero preset avatars. 100% personalized adventures with locked character consistency.
              </p>
            </div>

            <div className="relative z-10 space-y-2">
              <div className="p-2.5 rounded-lg bg-amber-900/5 border border-amber-900/15 text-[10px] text-amber-950 font-serif">
                <strong>Our Publishing Guarantee:</strong>
                <ul className="list-disc list-inside text-[9px] text-amber-900/80 mt-1 space-y-0.5">
                  <li>First 5 pages 100% free to download</li>
                  <li>Real vector monochrome coloring linework</li>
                  <li>Printed &amp; shipped via Lulu POD</li>
                </ul>
              </div>

              <div className="text-right text-[9px] font-serif italic text-amber-800/70">
                Printed with love on PayPal Rails
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Cover Edge Shadow when opening */}
        {scrollProgress > 0.05 && scrollProgress < 0.95 && (
          <div
            className="absolute inset-y-0 w-8 pointer-events-none z-40 transition-opacity"
            style={{
              left: `${50 - Math.cos(scrollProgress * Math.PI) * 45}%`,
              background: `linear-gradient(to right, rgba(0,0,0,${shadowIntensity * 0.35}), transparent)`,
              opacity: shadowIntensity,
            }}
          />
        )}
      </div>

      {/* Floating Status Bar Under the Book */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600 font-medium z-10">
        <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 shadow-xs">
          <div
            className="w-2 h-2 rounded-full transition-colors duration-300"
            style={{
              backgroundColor: scrollProgress > 0.7 ? "#10b981" : "#3b82f6",
            }}
          />
          <span>
            {scrollProgress < 0.15
              ? "Book Closed (Scroll to open)"
              : scrollProgress > 0.85
              ? "Book Fully Open: 2-Page Spread Revealed"
              : `Book Opening (${Math.round(scrollProgress * 100)}%)`}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-slate-500 text-[11px]">
          <span>•</span>
          <span>300 DPI Vector PDF</span>
          <span>•</span>
          <span>Lulu Softcover Printing</span>
          <span>•</span>
          <span>62% Profit Margin Model</span>
        </div>
      </div>
    </div>
  );
}
