"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  BookOpen,
  BookX,
  ChefHat,
  Palette,
  Compass,
  PenTool,
  ArrowRight,
  Printer,
  CheckCircle2,
} from "lucide-react";

type BookKey = "recipe" | "coloring" | "fishing" | "journal";

interface BookData {
  key: BookKey;
  label: string;
  icon: React.ReactNode;
  themeColor: string;
  accentBg: string;
  coverImage: string;
  coverTitle: string;
  coverSubtitle: string;
  coverBadge: string;
  authorLabel: string;
  leftPageTitle: string;
  leftPageTag: string;
  leftPageContent: React.ReactNode;
  rightPageTitle: string;
  rightPageTag: string;
  rightPageContent: React.ReactNode;
}

const BOOKS: Record<BookKey, BookData> = {
  recipe: {
    key: "recipe",
    label: "Family Recipe Book",
    icon: <ChefHat className="w-4 h-4" />,
    themeColor: "#f59e0b",
    accentBg: "from-amber-950/80 via-slate-900/90 to-amber-900/50",
    coverImage: "/covers/cover-recipe.png",
    coverTitle: "Rosa's Sunday Kitchen",
    coverSubtitle: "Twelve Generational Recipes & Sunday Gravy Traditions",
    coverBadge: "Heirloom Edition",
    authorLabel: "Compiled with PaperTales AI • Archival Satin Paper",
    leftPageTitle: "Sunday Braised Short Ribs",
    leftPageTag: "Family Secret • pg. 12",
    leftPageContent: (
      <div className="space-y-3 text-[11px] leading-relaxed text-[#1E2530]">
        <p className="italic text-amber-900 font-serif">
          &ldquo;Never rush the braise. Let the garlic caramelize until golden sweet.&rdquo;
        </p>
        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200/80 space-y-1">
          <span className="font-bold text-amber-900 uppercase tracking-wider text-[9px] block">
            Ingredients Checklist:
          </span>
          <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-700">
            <span>• 3 lbs bone-in ribs</span>
            <span>• 6 cloves garlic</span>
            <span>• 1 cup dry red wine</span>
            <span>• Fresh rosemary &amp; thyme</span>
          </div>
        </div>
        <p className="text-[10px] text-slate-600">
          Brown ribs in Dutch oven for 8 mins. Simmer low and slow at 300°F for 3.5 hours.
        </p>
      </div>
    ),
    rightPageTitle: "Hand-Drawn Kitchen Motifs",
    rightPageTag: "300 DPI Vector Linework",
    rightPageContent: (
      <div className="h-full flex flex-col items-center justify-center p-2">
        <svg viewBox="0 0 160 160" className="w-28 h-28 text-slate-900" fill="none" stroke="currentColor">
          {/* Vintage Dutch Oven & Herbs */}
          <ellipse cx="80" cy="95" rx="50" ry="25" strokeWidth="2.5" />
          <path d="M30 95 C30 120 130 120 130 95" strokeWidth="2.5" />
          <path d="M22 92 C15 92 15 100 22 100" strokeWidth="2" />
          <path d="M138 92 C145 92 145 100 138 100" strokeWidth="2" />
          <circle cx="80" cy="72" r="5" strokeWidth="2" />
          <path d="M45 85 Q80 70 115 85" strokeWidth="2" />
          {/* Steam & Rosemary */}
          <path d="M70 60 Q65 45 75 35" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M85 58 Q90 42 82 32" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M120 40 L135 65 M125 45 L132 48 M128 52 L137 54" strokeWidth="1.8" />
        </svg>
        <span className="text-[10px] font-mono text-slate-600 mt-2 text-center">
          Printed on 80# archival stain-resistant stock
        </span>
      </div>
    ),
  },
  coloring: {
    key: "coloring",
    label: "Custom Coloring Book",
    icon: <Palette className="w-4 h-4" />,
    themeColor: "#38bdf8",
    accentBg: "from-sky-950/80 via-slate-900/90 to-cyan-950/60",
    coverImage: "/covers/cover-coloring.png",
    coverTitle: "Captain Barnaby's Cosmos",
    coverSubtitle: "Starlight Rovers & Planetary Coloring Quests",
    coverBadge: "Coloring Studio",
    authorLabel: "Co-Created for Maya • 300 DPI Vector Linework",
    leftPageTitle: "Mission to the Rings of Vega",
    leftPageTag: "Chapter 1 • pg. 4",
    leftPageContent: (
      <div className="space-y-3 text-[11px] leading-relaxed text-[#1E2530]">
        <p className="font-sans text-slate-700">
          Captain Barnaby adjusted his glass helmet as the star-glider entered Vega’s orbit. The rings sparkled in neon blues and purples.
        </p>
        <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/60 space-y-1">
          <span className="font-bold text-amber-900 uppercase tracking-wider text-[9px] block">
            Coloring Palette Suggestion:
          </span>
          <div className="flex items-center gap-2 pt-0.5">
            <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 border border-slate-300" title="Celestial Cyan" />
            <span className="w-3.5 h-3.5 rounded-full bg-purple-400 border border-slate-300" title="Nebula Violet" />
            <span className="w-3.5 h-3.5 rounded-full bg-amber-300 border border-slate-300" title="Solar Gold" />
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 border border-slate-300" title="Alien Flora" />
            <span className="text-[10px] text-amber-800 font-mono">+ Channel3 Markers</span>
          </div>
        </div>
        <p className="text-[10px] text-slate-600 italic">
          &ldquo;Hold on tight, rover team! Next stop: the Crystal Moon crater.&rdquo;
        </p>
      </div>
    ),
    rightPageTitle: "Vector Line Art Ready to Color",
    rightPageTag: "No Marker Bleed-Through",
    rightPageContent: (
      <div className="h-full flex flex-col items-center justify-center p-2">
        <svg viewBox="0 0 160 160" className="w-28 h-28 text-slate-900" fill="none" stroke="currentColor">
          {/* Astronaut Puppy & Rocket */}
          <circle cx="80" cy="70" r="28" strokeWidth="2.5" />
          <path d="M60 55 C52 62 50 80 60 85" strokeWidth="2" />
          <path d="M100 55 C108 62 110 80 100 85" strokeWidth="2" />
          <circle cx="73" cy="68" r="3" fill="#1E2530" />
          <circle cx="87" cy="68" r="3" fill="#1E2530" />
          <ellipse cx="80" cy="75" rx="3.5" ry="2" fill="#1E2530" />
          <path d="M77 79 Q80 82 83 79" strokeWidth="1.5" />
          {/* Space Helmet Ring */}
          <ellipse cx="80" cy="70" rx="35" ry="32" strokeWidth="1.8" strokeDasharray="6 2" />
          {/* Stars & Saturn Rings */}
          <ellipse cx="125" cy="40" rx="14" ry="5" strokeWidth="1.8" transform="rotate(-20 125 40)" />
          <circle cx="125" cy="40" r="7" strokeWidth="2" />
          <polygon points="35,35 37,40 42,41 38,44 39,49 35,46 31,49 32,44 28,41 33,40" strokeWidth="1.5" />
        </svg>
        <span className="text-[10px] font-mono text-slate-600 mt-2 text-center">
          Character Anchor Locked: Consistent in every spread
        </span>
      </div>
    ),
  },
  fishing: {
    key: "fishing",
    label: "Dad's Fishing Guide",
    icon: <Compass className="w-4 h-4" />,
    themeColor: "#10b981",
    accentBg: "from-emerald-950/80 via-slate-900/90 to-teal-950/60",
    coverImage: "/covers/cover-fishing.png",
    coverTitle: "The Lakefront Journal",
    coverSubtitle: "Dad's Field Notes on Knots, Lures & Camping Traditions",
    coverBadge: "Mentor Guide",
    authorLabel: "Dedicated to Leo &bull; Lulu Square Edition",
    leftPageTitle: "The Improved Clinch Knot",
    leftPageTag: "Core Survival Skill • pg. 8",
    leftPageContent: (
      <div className="space-y-3 text-[11px] leading-relaxed text-[#1E2530]">
        <p className="font-serif italic text-emerald-900">
          &ldquo;If your knot doesn&apos;t hold, the biggest fish of your life becomes just a story.&rdquo;
        </p>
        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 space-y-1">
          <span className="font-bold text-emerald-900 uppercase tracking-wider text-[9px] block">
            Step-by-Step Instructions:
          </span>
          <div className="text-[10px] space-y-0.5 text-slate-700">
            <p>1. Thread eye of hook with 6 inches of line.</p>
            <p>2. Wrap tag end around standing line 5-7 times.</p>
            <p>3. Moisten line and pull firmly until snug.</p>
          </div>
        </div>
        <p className="text-[10px] text-slate-600">
          Best with 8-12 lb monofilament for freshwater largemouth bass.
        </p>
      </div>
    ),
    rightPageTitle: "Illustrated Lures & Hooks",
    rightPageTag: "Field Reference Diagram",
    rightPageContent: (
      <div className="h-full flex flex-col items-center justify-center p-2">
        <svg viewBox="0 0 160 160" className="w-28 h-28 text-slate-900" fill="none" stroke="currentColor">
          {/* Fish & Hook */}
          <path d="M30 80 Q70 45 125 75 Q100 85 85 95 Q60 105 30 80 Z" strokeWidth="2.5" />
          <path d="M125 75 L145 60 L140 80 L145 100 Z" strokeWidth="2.2" />
          <circle cx="55" cy="72" r="3" fill="#1E2530" />
          {/* Hook & Line */}
          <path d="M75 35 L75 60 C75 75 90 75 90 65" strokeWidth="2" />
          <path d="M90 65 L86 69" strokeWidth="2" />
          <circle cx="75" cy="35" r="3" strokeWidth="1.8" />
        </svg>
        <span className="text-[10px] font-mono text-slate-600 mt-2 text-center">
          Hand-illustrated step-by-step layout
        </span>
      </div>
    ),
  },
  journal: {
    key: "journal",
    label: "Bespoke Daily Journal",
    icon: <PenTool className="w-4 h-4" />,
    themeColor: "#c084fc",
    accentBg: "from-purple-950/80 via-slate-900/90 to-indigo-950/60",
    coverImage: "/covers/cover-journal.png",
    coverTitle: "90 Days of Clarity",
    coverSubtitle: "A Guided Morning Routine & Mindfulness Companion",
    coverBadge: "Personal Edition",
    authorLabel: "Custom Ruled Grids &bull; Velvet Matte Laminate",
    leftPageTitle: "Morning Focus & Gratitude",
    leftPageTag: "Daily Practice • Day 28",
    leftPageContent: (
      <div className="space-y-3 text-[11px] leading-relaxed text-[#1E2530]">
        <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200 space-y-2">
          <span className="font-bold text-purple-950 uppercase tracking-wider text-[9px] block">
            Three Things I Am Grateful For:
          </span>
          <div className="space-y-1 font-mono text-[10px] text-slate-700 border-l-2 border-purple-300 pl-2">
            <div>1. Morning stillness before the house wakes up</div>
            <div>2. Progress on creative writing projects</div>
            <div>3. Warm coffee &amp; clear autumn air</div>
          </div>
        </div>
        <div className="flex justify-between items-center text-[10px] text-slate-600 pt-1">
          <span>Intention: Focus over speed</span>
          <span className="font-mono text-amber-600">★ ★ ★ ★ ★</span>
        </div>
      </div>
    ),
    rightPageTitle: "Habit Matrix & Reflections",
    rightPageTag: "Custom Formatted Grid",
    rightPageContent: (
      <div className="h-full flex flex-col items-center justify-center p-2">
        <div className="w-full max-w-[130px] space-y-1.5 font-mono text-[9px]">
          <div className="flex justify-between items-center text-purple-950 border-b border-purple-200 pb-1">
            <span>HABIT</span>
            <span>M T W T F</span>
          </div>
          <div className="flex justify-between text-slate-700">
            <span>30m Read</span>
            <span className="text-amber-600">● ● ● ● ○</span>
          </div>
          <div className="flex justify-between text-slate-700">
            <span>Hydrate 2L</span>
            <span className="text-amber-600">● ● ● ● ●</span>
          </div>
          <div className="flex justify-between text-slate-700">
            <span>Mindful Walk</span>
            <span className="text-amber-600">● ○ ● ● ○</span>
          </div>
        </div>
        <span className="text-[10px] font-mono text-slate-600 mt-3 text-center">
          Tailored to your personal daily flow
        </span>
      </div>
    ),
  },
};

export default function Interactive3DBook() {
  const [activeBookKey, setActiveBookKey] = useState<BookKey>("recipe");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [rotateX, setRotateX] = useState<number>(0);
  const [rotateY, setRotateY] = useState<number>(0);
  const [glarePos, setGlarePos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const activeBook = BOOKS[activeBookKey];

  // Mouse tilt tracking with smooth damping
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normalizedX = (x / rect.width) * 2 - 1; // -1 to 1
    const normalizedY = (y / rect.height) * 2 - 1; // -1 to 1

    // Tilt angle max: ±14 deg
    const targetRotateY = normalizedX * 14;
    const targetRotateX = -normalizedY * 12;

    setRotateX(targetRotateX);
    setRotateY(targetRotateY);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  }, []);

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Smooth reset
    setRotateX(0);
    setRotateY(0);
    setGlarePos({ x: 50, y: 50 });
  };

  // Subtle ambient breathing float when not hovered
  useEffect(() => {
    if (isHovered) return;
    let frameId: number;
    let startTime = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      // Gentle subtle 3D oscillation
      setRotateY(Math.sin(elapsed * 0.8) * 3);
      setRotateX(Math.cos(elapsed * 0.6) * 2);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isHovered]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Top Controls Header: Book Type Selector */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-300/40 text-amber-900 text-xs font-semibold mb-3 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Tactile 3D Keepsake Inspector</span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-black font-serif text-[#1E2530] tracking-tight">
          Hold, Tilt &amp; Open Your Future Book in 3D
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1.5 max-w-xl">
          Move your cursor to inspect realistic 8.5&quot; &times; 8.5&quot; cover gloss, or click to open the interior pages.
        </p>

        {/* 4-Tab Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6 p-1.5 rounded-2xl bg-[#FAF6EE] border border-[#E8DFD3] shadow-sm">
          {(Object.keys(BOOKS) as BookKey[]).map((key) => {
            const b = BOOKS[key];
            const isActive = activeBookKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setActiveBookKey(key);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/20 scale-102"
                    : "text-[#1E2530]/75 hover:text-[#1E2530] hover:bg-white/80"
                }`}
              >
                {b.icon}
                <span>{b.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3D Viewport Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative mx-auto flex items-center justify-center py-6 select-none cursor-grab active:cursor-grabbing"
        style={{
          perspective: "1400px",
          minHeight: "440px",
        }}
      >
        {/* Soft crystalline floor shadow */}
        <div
          className="absolute -bottom-4 w-[340px] sm:w-[460px] h-14 rounded-[50%] bg-amber-950/20 blur-2xl transition-all duration-300 pointer-events-none"
          style={{
            transform: `scale(${isOpen ? 1.3 : 1}) translateY(${rotateX * -1.5}px)`,
            opacity: isOpen ? 0.6 : 0.45,
          }}
        />

        {/* 3D BOOK RIG */}
        <div
          className="relative transition-transform duration-150 ease-out"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY + (isOpen ? -15 : 0)}deg) translateZ(0px)`,
            width: "min(88vw, 380px)",
            height: "min(88vw, 380px)",
          }}
        >
          {/* ========================================================== */}
          {/* BASE 2-PAGE SPREAD (Visible inside when open)              */}
          {/* ========================================================== */}
          <div
            className={`absolute inset-0 rounded-2xl overflow-hidden border border-[#E8DFD3] shadow-2xl transition-all duration-500 flex ${
              isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
            }`}
            style={{
              background: "#FFFDF8",
              transformStyle: "preserve-3d",
            }}
          >
            {/* Left Page */}
            <div className="w-1/2 h-full p-5 sm:p-7 flex flex-col justify-between border-r border-[#E8DFD3] relative overflow-hidden bg-[#FFFDF8]">
              <div className="flex items-center justify-between border-b border-[#E8DFD3] pb-2 mb-2">
                <span className="font-mono text-[9px] text-amber-800 font-bold uppercase tracking-wider">
                  {activeBook.leftPageTag}
                </span>
                <span className="text-[9px] font-mono text-slate-500">PaperTales POD</span>
              </div>

              <h4 className="text-sm font-bold font-serif text-[#1E2530] mb-2 leading-tight">
                {activeBook.leftPageTitle}
              </h4>

              <div className="flex-1 overflow-hidden">{activeBook.leftPageContent}</div>

              <div className="pt-2 border-t border-[#E8DFD3] flex items-center justify-between text-[8px] font-mono text-slate-500">
                <span>Lulu Archival 80# Satin</span>
                <span>pg. 1</span>
              </div>
            </div>

            {/* Right Page */}
            <div className="w-1/2 h-full p-5 sm:p-7 flex flex-col justify-between relative overflow-hidden bg-[#FAF6EE]">
              <div className="flex items-center justify-between border-b border-[#E8DFD3] pb-2 mb-2">
                <span className="font-mono text-[9px] text-amber-800 font-bold uppercase tracking-wider">
                  {activeBook.rightPageTag}
                </span>
                <span className="text-[9px] font-mono text-slate-500">300 DPI Vector</span>
              </div>

              <h4 className="text-sm font-bold font-serif text-[#1E2530] mb-2 leading-tight">
                {activeBook.rightPageTitle}
              </h4>

              <div className="flex-1 flex items-center justify-center overflow-hidden">
                {activeBook.rightPageContent}
              </div>

              <div className="pt-2 border-t border-[#E8DFD3] flex items-center justify-between text-[8px] font-mono text-slate-500">
                <span>No Marker Bleed</span>
                <span>pg. 2</span>
              </div>
            </div>

            {/* Central Book Spine Crease Shadow */}
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-4 pointer-events-none bg-gradient-to-r from-black/15 via-amber-950/10 to-black/15 z-20" />
          </div>

          {/* ========================================================== */}
          {/* 3D BOOK COVER HINGE (Rotates open/closed)                  */}
          {/* ========================================================== */}
          <div
            className="absolute inset-0 rounded-2xl origin-left transition-transform duration-700 ease-in-out"
            style={{
              transformStyle: "preserve-3d",
              transform: isOpen ? "rotateY(-165deg)" : "rotateY(0deg)",
              boxShadow: isOpen
                ? "none"
                : "-18px 24px 45px -10px rgba(30, 20, 10, 0.4), 0 0 35px -5px rgba(217, 119, 6, 0.2)",
            }}
          >
            {/* FRONT COVER FACE (Seen when closed, rotateY = 0) */}
            <div
              className={`absolute inset-0 rounded-2xl p-6 sm:p-8 flex flex-col justify-between border-2 border-amber-300/40 text-white overflow-hidden shadow-2xl bg-gradient-to-br ${activeBook.accentBg}`}
              style={{
                backfaceVisibility: "hidden",
              }}
            >
              {/* Full-Bleed AI Generated Cover Artwork */}
              <div className="absolute inset-0 pointer-events-none">
                <Image
                  src={activeBook.coverImage}
                  alt={activeBook.coverTitle}
                  fill
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="object-cover object-center filter brightness-[0.88] contrast-[1.08] transition-transform duration-700 hover:scale-105"
                  priority
                />
                {/* Vignette & Soft Gradient for Luxury Foil Feel and Typography Contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-slate-950/75" />
              </div>

              {/* Dynamic Specular Glare Layer that tracks mouse */}
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-10"
                style={{
                  background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0) 55%)`,
                  opacity: isHovered ? 0.95 : 0.35,
                }}
              />

              {/* Decorative Luxury Gold/Amber Foil Frame */}
              <div className="absolute inset-3 rounded-xl border border-amber-300/40 pointer-events-none z-10 shadow-[inset_0_0_12px_rgba(245,158,11,0.2)]" />
              <div className="absolute inset-4 rounded-lg border border-dashed border-amber-200/30 pointer-events-none z-10" />

              {/* Left Spine Book Texture / Crease simulation */}
              <div className="absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-black/70 via-black/20 to-transparent pointer-events-none z-10" />

              {/* Cover Header Badge */}
              <div className="relative z-20 flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-amber-300/30 text-amber-200 shadow-md">
                  {activeBook.coverBadge}
                </span>
                <span className="text-[10px] font-mono text-slate-200 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded border border-white/15">
                  <Printer className="w-3 h-3 text-amber-400" /> 8.5&times;8.5&quot;
                </span>
              </div>

              {/* Cover Artwork & Typography Centerpiece */}
              <div className="relative z-20 text-center my-auto flex flex-col items-center px-4 py-3 rounded-2xl bg-black/50 backdrop-blur-md border border-amber-200/25 shadow-2xl max-w-[280px] mx-auto">
                <div className="w-12 h-12 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center mb-2.5 shadow-inner backdrop-blur-sm">
                  <div className="text-amber-300 text-2xl">{activeBook.icon}</div>
                </div>

                <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] font-serif leading-tight">
                  {activeBook.coverTitle}
                </h3>
                <p className="mt-1.5 text-[11px] text-amber-100/90 font-medium leading-relaxed drop-shadow">
                  {activeBook.coverSubtitle}
                </p>
                <span className="text-[8px] font-mono uppercase tracking-wider text-amber-300 mt-2 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/40">
                  AI Generated Cover
                </span>
              </div>

              {/* Cover Bottom Certification Footer */}
              <div className="relative z-20 flex items-center justify-between text-[9px] font-mono text-slate-200 border-t border-white/20 pt-2.5 bg-black/40 backdrop-blur-sm px-2 rounded-b">
                <span className="flex items-center gap-1 text-amber-300 font-medium">
                  <CheckCircle2 className="w-3 h-3 text-amber-400" /> Lulu Print Verified
                </span>
                <span>Softcover Velvet</span>
              </div>
            </div>

            {/* INSIDE OF FRONT COVER (Seen when opened, rotateY = 180deg) */}
            <div
              className="absolute inset-0 rounded-2xl p-6 sm:p-8 flex flex-col justify-between border-2 border-amber-300/30 text-white overflow-hidden shadow-inner bg-gradient-to-br from-[#1E2530] to-[#141A23]"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="space-y-2 opacity-90">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block font-bold">
                  Author Edition Note
                </span>
                <p className="font-serif italic text-xs text-slate-300 leading-relaxed">
                  &ldquo;A personal keepsake designed without graphic design software. Preserved forever in print.&rdquo;
                </p>
              </div>

              <div className="text-[9px] font-mono text-slate-400 flex items-center justify-between border-t border-white/10 pt-3">
                <span>PaperTales AI Co-Creation Studio</span>
                <span className="text-amber-400">PayPal Smart Rails</span>
              </div>
            </div>
          </div>

          {/* Right Edge Pages Thickness Simulation */}
          <div
            className="absolute right-0 top-3 bottom-3 w-3 bg-gradient-to-r from-amber-100 via-[#FFFDF8] to-[#E8DFD3] rounded-r shadow-inner transition-opacity duration-300 pointer-events-none"
            style={{
              transform: "rotateY(90deg) translateZ(1px)",
              opacity: isOpen ? 0.3 : 0.8,
            }}
          />
        </div>
      </div>

      {/* Interactive Controls & Studio CTA Pill */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-6 py-3 rounded-xl bg-white border border-[#E8DFD3] hover:border-amber-400 text-[#1E2530] text-xs font-bold flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shadow-sm hover:shadow cursor-pointer"
        >
          {isOpen ? (
            <>
              <BookX className="w-4 h-4 text-amber-600" />
              <span>Close 3D Cover</span>
            </>
          ) : (
            <>
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>Click to Open Interior Spread</span>
            </>
          )}
        </button>

        <Link
          href="/studio"
          className="px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-md bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-100" />
          <span>Design This in Studio</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
