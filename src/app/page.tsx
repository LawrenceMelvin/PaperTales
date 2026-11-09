"use client";

import React, { useState, useId } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import TokenModal from "@/components/TokenModal";
import Logo from "@/components/Logo";
import Interactive3DBook from "@/components/Interactive3DBook";
import {
  Sparkles,
  BookOpen,
  Printer,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sliders,
  Palette,
  FileText,
  Lock,
  Layers,
  PenTool,
  Clock,
  Award,
  Users,
  GraduationCap,
  Sparkle,
  Truck,
  ExternalLink,
  X,
  ChefHat,
  Compass,
  BookHeart,
  Type,
  Image as ImageIcon,
} from "lucide-react";

export default function LandingPage() {
  const [tokenModalOpen, setTokenModalOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen relative bg-[#FFFDF9] text-[#1E2530] overflow-x-hidden selection:bg-amber-100 selection:text-amber-900 font-sans">
      {/* Sunlit Warm Ambient Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[960px] h-[550px] bg-amber-200/35 rounded-full blur-[140px] opacity-70" />
        <div className="absolute top-[30%] -left-32 w-[650px] h-[650px] bg-orange-100/40 rounded-full blur-[160px] opacity-60" />
        <div className="absolute top-[60%] -right-32 w-[650px] h-[650px] bg-amber-100/30 rounded-full blur-[180px] opacity-50" />
        <div className="absolute bottom-10 left-1/3 w-[500px] h-[500px] bg-amber-200/20 rounded-full blur-[170px] opacity-40" />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar onOpenTokenModal={() => setTokenModalOpen(true)} />

        <main className="flex-1 space-y-24 md:space-y-36 pt-8 md:pt-14 pb-24">
          {/* ========================================================================= */}
          {/* HERO SECTION - WARM SUNLIT ATELIER                                        */}
          {/* ========================================================================= */}
          <section className="max-w-7xl mx-auto px-4 md:px-8 text-center flex flex-col items-center" id="hero">
            {/* Top Prestige Laurel Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full warm-badge text-xs font-semibold mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>✦ The Personal Book Atelier for Kids, Families & Storytellers</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="font-mono text-amber-800">PayPal AI Hackathon 2026</span>
            </div>

            {/* Main Literary Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-extrabold text-[#1E2530] max-w-5xl tracking-tight leading-[1.15] mb-6">
              Turn Evening Bedtime Stories Into{" "}
              <span className="italic text-amber-600 underline decoration-amber-300 decoration-wavy decoration-2">
                Bound Keepsakes.
              </span>
            </h1>

            {/* Editorial Subtitle */}
            <p className="text-base md:text-lg text-[#64748B] max-w-3xl mb-8 leading-relaxed font-normal">
              You don&apos;t need InDesign skills or an art degree to hold your own published book. From bedtime adventures and custom coloring volumes to family heirloom recipes — PaperTales AI formats every page, generates crisp 300 DPI vector art, and delivers bookstore-grade softcover editions to your doorstep.
            </p>

            {/* Dual Hero Actions */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
              <Link
                href="/studio"
                className="atelier-btn-primary text-base font-bold px-8 py-4 rounded-xl flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start Designing (5 Free Pages)</span>
              </Link>
              <a
                href="#showcase"
                className="bg-white hover:bg-[#FAF6EE] px-7 py-4 rounded-xl border border-[#E8DFD3] text-[#1E2530] hover:text-amber-700 text-base font-semibold flex items-center gap-2 transition-all shadow-sm"
              >
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span>Explore Book Types</span>
              </a>
            </div>

            {/* Quick Inspiration Badges Strip */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl text-xs">
              <span className="text-slate-500 font-medium mr-1 hidden sm:inline">What you can create:</span>
              <span className="px-3 py-1.5 rounded-full bg-white border border-[#E8DFD3] text-slate-700 flex items-center gap-1.5 shadow-sm hover:border-amber-400 transition-colors">
                🍳 Family Recipe Heirlooms
              </span>
              <span className="px-3 py-1.5 rounded-full bg-white border border-[#E8DFD3] text-slate-700 flex items-center gap-1.5 shadow-sm hover:border-amber-400 transition-colors">
                🎨 Custom Coloring Books
              </span>
              <span className="px-3 py-1.5 rounded-full bg-white border border-[#E8DFD3] text-slate-700 flex items-center gap-1.5 shadow-sm hover:border-amber-400 transition-colors">
                🎣 Dad&apos;s Fishing Guides
              </span>
              <span className="px-3 py-1.5 rounded-full bg-white border border-[#E8DFD3] text-slate-700 flex items-center gap-1.5 shadow-sm hover:border-amber-400 transition-colors">
                🧮 Math &amp; Logic Quests
              </span>
              <span className="px-3 py-1.5 rounded-full bg-white border border-[#E8DFD3] text-slate-700 flex items-center gap-1.5 shadow-sm hover:border-amber-400 transition-colors">
                📔 Guided Daily Journals
              </span>
              <span className="px-3 py-1.5 rounded-full bg-white border border-[#E8DFD3] text-slate-700 flex items-center gap-1.5 shadow-sm hover:border-amber-400 transition-colors">
                📸 Memory Lane Albums
              </span>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* TACTILE 3D INTERACTIVE CENTERPIECE INSPECTOR                              */}
          {/* ========================================================================= */}
          <section className="max-w-7xl mx-auto px-4 md:px-8 py-2" id="3d-book-inspector">
            <Interactive3DBook />
          </section>

          {/* ========================================================================= */}
          {/* SHOWCASE SECTION: "NOT A DESIGNER? THAT'S WHERE WE COME IN."              */}
          {/* ========================================================================= */}
          <section className="max-w-7xl mx-auto px-4 md:px-8" id="showcase">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full warm-badge text-xs font-semibold mb-4">
                <Palette className="w-3.5 h-3.5 text-amber-600" />
                <span>Empowering Everyday Creators, Parents &amp; Hobbyists</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-serif font-extrabold text-[#1E2530] tracking-tight">
                Not a Designer?{" "}
                <span className="italic text-amber-600">
                  That&apos;s Where We Come In.
                </span>
              </h2>
              <p className="text-base md:text-lg text-[#64748B] mt-3">
                No complex desktop software or graphic design courses required. You bring the heart, recipes, lessons, or stories — our multi-agent AI formats the typography, margins, bleed, and vector artwork automatically.
              </p>
            </div>

            {/* 6 Personal Book Use-Cases Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {/* Card 1: Family Recipe Heirloom */}
              <div className="p-6 rounded-2xl bg-white border border-[#E8DFD3] hover:border-amber-400 transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-md">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shadow-inner group-hover:scale-105 transition-transform">
                      <ChefHat className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      Family Keepsake
                    </span>
                  </div>
                  <h3 className="text-lg font-serif font-bold text-[#1E2530] group-hover:text-amber-700 transition-colors">
                    Mom&apos;s Family Recipe Heirloom
                  </h3>
                  <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                    Preserve handwritten culinary secrets, holiday traditions, and grandmother&apos;s sauce notes. Formatted with ingredients checklists, prep times, and vintage kitchen borders.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-[#E8DFD3] flex items-center justify-between text-[11px] text-amber-800 font-mono">
                  <span>Archival Satin Paper</span>
                  <Link href="/studio" className="flex items-center gap-1 hover:underline text-amber-700 font-bold">
                    Create <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Card 2: Custom Coloring Book */}
              <div className="p-6 rounded-2xl bg-white border border-[#E8DFD3] hover:border-amber-400 transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-md">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shadow-inner group-hover:scale-105 transition-transform">
                      <Palette className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      Kids &amp; Adults
                    </span>
                  </div>
                  <h3 className="text-lg font-serif font-bold text-[#1E2530] group-hover:text-amber-700 transition-colors">
                    Custom Coloring Books
                  </h3>
                  <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                    Transform your child&apos;s favorite pets, space fantasies, or mindfulness mandalas into 300 DPI vector linework on thick paper that markers won&apos;t bleed through.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-[#E8DFD3] flex items-center justify-between text-[11px] text-amber-800 font-mono">
                  <span>300 DPI Vector Linework</span>
                  <Link href="/studio" className="flex items-center gap-1 hover:underline text-amber-700 font-bold">
                    Create <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Card 3: Dad's Fishing & Hobby Guide */}
              <div className="p-6 rounded-2xl bg-white border border-[#E8DFD3] hover:border-amber-400 transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-md">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shadow-inner group-hover:scale-105 transition-transform">
                      <Compass className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Hands-On Mentorship
                    </span>
                  </div>
                  <h3 className="text-lg font-serif font-bold text-[#1E2530] group-hover:text-amber-700 transition-colors">
                    Dad&apos;s Hobby &amp; Teaching Guide
                  </h3>
                  <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                    Pass down outdoor and maker skills. Step-by-step illustrated guides for teaching lake fishing, tying knots, woodworking safety, camping, or gardening traditions.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-[#E8DFD3] flex items-center justify-between text-[11px] text-emerald-800 font-mono">
                  <span>Illustrated How-To Spreads</span>
                  <Link href="/studio" className="flex items-center gap-1 hover:underline text-emerald-700 font-bold">
                    Create <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Card 4: Math & Logic Quests */}
              <div className="p-6 rounded-2xl bg-white border border-[#E8DFD3] hover:border-amber-400 transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-md">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shadow-inner group-hover:scale-105 transition-transform">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      Learning &amp; Phonics
                    </span>
                  </div>
                  <h3 className="text-lg font-serif font-bold text-[#1E2530] group-hover:text-amber-700 transition-colors">
                    Math &amp; Logic Learning Quests
                  </h3>
                  <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                    Interactive educational workbooks personalized for your child or classroom. Age-calibrated multiplication quests, mazes, and word puzzles that turn practice into an adventure.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-[#E8DFD3] flex items-center justify-between text-[11px] text-amber-800 font-mono">
                  <span>Custom Activity Worksheets</span>
                  <Link href="/studio" className="flex items-center gap-1 hover:underline text-amber-700 font-bold">
                    Create <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Card 5: Family Memory Lane Keepsake */}
              <div className="p-6 rounded-2xl bg-white border border-[#E8DFD3] hover:border-amber-400 transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-md">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700 shadow-inner group-hover:scale-105 transition-transform">
                      <BookHeart className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                      Milestones &amp; Tributes
                    </span>
                  </div>
                  <h3 className="text-lg font-serif font-bold text-[#1E2530] group-hover:text-amber-700 transition-colors">
                    Family Memory Lane Album
                  </h3>
                  <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                    Rescue scattered camera rolls and treasured memories from fading in the cloud. Assemble milestone journeys, anniversary tributes, and adoption stories into permanent print.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-[#E8DFD3] flex items-center justify-between text-[11px] text-rose-800 font-mono">
                  <span>8.5×8.5 Square Softcover</span>
                  <Link href="/studio" className="flex items-center gap-1 hover:underline text-rose-700 font-bold">
                    Create <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Card 6: Bespoke Guided Daily Journal */}
              <div className="p-6 rounded-2xl bg-white border border-[#E8DFD3] hover:border-amber-400 transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-md">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shadow-inner group-hover:scale-105 transition-transform">
                      <PenTool className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      Mindfulness &amp; Habits
                    </span>
                  </div>
                  <h3 className="text-lg font-serif font-bold text-[#1E2530] group-hover:text-amber-700 transition-colors">
                    Bespoke Guided Journals
                  </h3>
                  <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                    Tired of generic journals that don&apos;t fit your flow? Design a 30 to 64 page journal tailored to your exact mindfulness rituals, habit trackers, and personal reflection questions.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-[#E8DFD3] flex items-center justify-between text-[11px] text-amber-800 font-mono">
                  <span>Custom Prompts &amp; Ruled Grids</span>
                  <Link href="/studio" className="flex items-center gap-1 hover:underline text-amber-700 font-bold">
                    Create <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* The 3-Step "Idea to Doorstep" Pipeline */}
            <div className="p-8 md:p-10 rounded-2xl bg-white border border-[#E8DFD3] shadow-warm">
              <div className="text-center max-w-xl mx-auto mb-10">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-700">
                  The Non-Designer&apos;s Publishing Pipeline
                </span>
                <h3 className="text-2xl md:text-3xl font-serif font-extrabold text-[#1E2530] mt-1">
                  How Your Thoughts Become a Physical Book
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex items-start gap-4 p-5 rounded-xl bg-[#FAF6EE] border border-[#E8DFD3]">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 font-bold font-mono shrink-0">
                    01
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#1E2530]">1. Share Your Idea</h4>
                    <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                      Type your recipe notes, child&apos;s favorite characters, or teaching concepts in plain text. No layout software required.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 rounded-xl bg-[#FAF6EE] border border-[#E8DFD3]">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 font-bold font-mono shrink-0">
                    02
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#1E2530]">2. AI Typesets &amp; Illustrates</h4>
                    <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                      PaperTales automates typography, 300 DPI vector linework, spine calculations, and Lulu-certified bleed margins.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 rounded-xl bg-[#FAF6EE] border border-[#E8DFD3]">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 font-bold font-mono shrink-0">
                    03
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#1E2530]">3. Lulu Prints &amp; Ships</h4>
                    <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                      Review your flipbook preview, checkout in 1 click with PayPal, and hold a bookstore-grade bound copy at your door.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* HOW YOU PAY SECTION - TRANSPARENT COMPUTE & MANUFACTURING PRICING        */}
          {/* ========================================================================= */}
          <section className="max-w-7xl mx-auto px-4 md:px-8" id="pricing-overview">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full warm-badge text-xs font-semibold mb-4">
                <Sliders className="w-3.5 h-3.5 text-amber-600" />
                <span>Pay Only for What You Create &bull; Zero Subscriptions</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-serif font-extrabold text-[#1E2530] tracking-tight">
                How Pricing Works:{" "}
                <span className="italic text-amber-600">
                  Pay by Book Type.
                </span>
              </h2>
              <p className="text-base md:text-lg text-[#64748B] mt-3">
                No monthly subscription fatigue. You only pay for the AI model compute you use ($0.02 – $0.05/page) and paper manufacturing if you choose physical print. Digital PDF downloads are always 100% free.
              </p>
            </div>

            {/* 3 Clear Pricing Tier Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
              {/* Tier 1: Words & Story Books */}
              <div className="p-8 rounded-2xl bg-white border border-[#E8DFD3] flex flex-col justify-between shadow-warm relative overflow-hidden group hover:border-amber-400 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800">
                      <Type className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Lighter Model
                    </span>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-[#1E2530]">Words &amp; Story Books</h3>
                  <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                    Family recipes, guided daily journals, memory lane stories, and bedtime reading. Uses standard language models for typographic layout and text synthesis.
                  </p>

                  <div className="my-6 p-4 rounded-xl bg-[#FAF6EE] border border-[#E8DFD3] space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-[#64748B]">AI Compute:</span>
                      <span className="text-lg font-black text-emerald-800 font-mono">$0.02 <span className="text-xs font-normal text-slate-500">/ page</span></span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-[#64748B]">Digital PDF:</span>
                      <span className="text-sm font-bold text-emerald-800 font-mono flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] uppercase tracking-wider font-semibold">Free</span>
                        <span>$0.00</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-[#64748B]">Physical Print:</span>
                      <span className="text-xs text-amber-800 font-mono">+$0.17/pg + binding</span>
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>First 5 introductory pages 100% free</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Instant 300 DPI vector PDF export 100% free</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Automatic typographic layout &amp; margins</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Custom prompt &amp; recipe formatting</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-[#E8DFD3]">
                  <Link
                    href="/studio"
                    className="w-full py-3 px-4 rounded-xl bg-[#FAF6EE] hover:bg-[#F4EFEA] border border-[#E8DFD3] text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <span>Create a Words Book</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Tier 2: Illustrated & Coloring Books */}
              <div className="p-8 rounded-2xl bg-white border-2 border-amber-400 flex flex-col justify-between shadow-warm relative overflow-hidden group">
                <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider rounded-bl-xl shadow-sm">
                  Most Popular
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      Vision &amp; Vector GPU
                    </span>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-[#1E2530]">Illustrated &amp; Coloring Books</h3>
                  <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                    Kids&apos; custom coloring adventures, dad&apos;s fishing &amp; hobby guides, and math quests. Generates 300 DPI vector linework and character consistency locks.
                  </p>

                  <div className="my-6 p-4 rounded-xl bg-[#FAF6EE] border border-[#E8DFD3] space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-[#64748B]">AI Compute:</span>
                      <span className="text-lg font-black text-amber-700 font-mono">$0.05 <span className="text-xs font-normal text-slate-500">/ page</span></span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-[#64748B]">Digital PDF:</span>
                      <span className="text-sm font-bold text-emerald-800 font-mono flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] uppercase tracking-wider font-semibold">Free</span>
                        <span>$0.00</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-[#64748B]">Physical Print:</span>
                      <span className="text-xs text-amber-800 font-mono">+$0.17/pg + binding</span>
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>First 5 introductory pages 100% free</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Unlimited home printing with free vector PDF downloads</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>300 DPI vector linework (no marker bleed)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Character Anchor Lock consistency pipeline</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-[#E8DFD3]">
                  <Link
                    href="/studio"
                    className="w-full atelier-btn-primary py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md"
                  >
                    <span>Create an Illustrated Book</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Tier 3: Physical Printing via Lulu */}
              <div className="p-8 rounded-2xl bg-white border border-[#E8DFD3] flex flex-col justify-between shadow-warm relative overflow-hidden group hover:border-amber-400 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
                      <Printer className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      Lulu Direct POD
                    </span>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-[#1E2530]">Bookstore-Grade Softcover</h3>
                  <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                    Hold your real bound book in your hands. On-demand printing on heavy 80# satin archival paper with velvet-touch matte cover laminate and perfect binding.
                  </p>

                  <div className="my-6 p-4 rounded-xl bg-[#FAF6EE] border border-[#E8DFD3] space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-[#64748B]">Paper &amp; Lulu Binding:</span>
                      <span className="text-lg font-black text-amber-700 font-mono">$0.17 <span className="text-xs font-normal text-slate-500">/ page</span></span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-[#64748B]">Trim Format:</span>
                      <span className="text-xs font-bold text-[#1E2530] font-mono">8.5 &times; 8.5 in Square</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-[#64748B]">Fulfillment:</span>
                      <span className="text-xs text-amber-800 font-mono">48h print turnaround</span>
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Archival satin interior (no ink show-through)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>FSC-certified, eco-friendly manufacturing</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>1-click shipping autofill via PayPal</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-[#E8DFD3]">
                  <Link
                    href="/pricing"
                    className="w-full py-3 px-4 rounded-xl bg-[#FAF6EE] hover:bg-[#F4EFEA] border border-[#E8DFD3] text-amber-900 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <span>Configure Exact Print Specs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Launch Dedicated Calculator CTA Banner */}
            <div className="p-6 md:p-8 rounded-2xl bg-white border border-[#E8DFD3] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-warm">
              <div>
                <h4 className="text-lg md:text-xl font-serif font-bold text-[#1E2530]">
                  Want to estimate exact costs for your page count?
                </h4>
                <p className="text-xs md:text-sm text-[#64748B] mt-1">
                  Use Barnaby&apos;s interactive calculator with live sliders (5 to 64 pages), companion marker kits, and instant checkout totals.
                </p>
              </div>
              <Link
                href="/pricing"
                className="atelier-btn-primary px-6 py-3.5 rounded-xl font-bold text-xs shrink-0 flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-md"
              >
                <Sliders className="w-4 h-4" />
                <span>Launch Interactive Calculator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* PHYSICAL PRINT & PARTNER ECOSYSTEM (LULU POD + CHANNEL3)                   */}
          {/* ========================================================================= */}
          <section className="max-w-7xl mx-auto px-4 md:px-8" id="ecosystem">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full warm-badge text-xs font-semibold mb-4">
                <Printer className="w-3.5 h-3.5 text-amber-600" />
                <span>Craftsmanship &amp; Companion Art Ecosystem</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-serif font-extrabold text-[#1E2530] tracking-tight">
                The Tangible Keepsake Experience
              </h2>
              <p className="text-base md:text-lg text-[#64748B] mt-3">
                We bridge artificial intelligence with bookstore-quality tactile printmaking. In certified partnership with Lulu Print-on-Demand and Channel3 Artistry.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Product Showcase Image */}
              <div className="lg:col-span-7 relative group">
                <div className="rounded-2xl overflow-hidden border border-[#E8DFD3] bg-white shadow-warm relative aspect-[1.34/1]">
                  <Image
                    src="/lulu-channel3-product.png"
                    alt="Product render of 8.5x8.5 softcover storybook and Channel3 art kit"
                    fill
                    className="object-cover transform group-hover:scale-[1.02] transition-transform duration-500"
                  />
                </div>
                {/* Tactile Badge Float */}
                <div className="absolute -bottom-4 right-6 p-4 rounded-xl bg-white border border-[#E8DFD3] shadow-md hidden sm:flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-amber-600" />
                  <div>
                    <p className="text-sm font-serif font-bold text-[#1E2530]">8.5 × 8.5 in Softcover</p>
                    <p className="text-xs text-[#64748B]">80# Archival Satin Interior</p>
                  </div>
                </div>
              </div>

              {/* Right Specification & Address Autofill Details */}
              <div className="lg:col-span-5 space-y-6">
                {/* Lulu Certified Specs Card */}
                <div className="p-6 rounded-2xl bg-white border border-[#E8DFD3] space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-serif font-bold text-[#1E2530] flex items-center gap-2">
                      <Printer className="w-4 h-4 text-amber-600" />
                      Lulu POD Print Specifications
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Certified
                    </span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-[#64748B] leading-relaxed">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-[#1E2530]">Format:</strong> 8.5 × 8.5 inch perfect-bound square children&apos;s storybook.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-[#1E2530]">Interior Stock:</strong> 80# Satin archival paper (no ink bleed-through).
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-[#1E2530]">Cover Finish:</strong> Velvet-touch matte laminate with UV spine seal.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-[#1E2530]">Eco Commitment:</strong> FSC-certified, carbon-neutral regional printing.
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Channel3 Companion Kit Card */}
                <div className="p-6 rounded-2xl bg-white border border-[#E8DFD3] space-y-3 shadow-sm">
                  <span className="text-base font-serif font-bold text-[#1E2530] flex items-center gap-2">
                    <Palette className="w-4 h-4 text-amber-600" />
                    Channel3 Companion Art Kit
                  </span>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    Includes 24 custom dual-tip artist markers and mess-free crayons specially formulated for heavy archival paper stocks. Perfect for kids coloring in custom AI vector pages without smudges.
                  </p>
                </div>

                {/* PayPal One-Touch Autofill Simulation */}
                <div className="p-5 rounded-2xl bg-[#FAF6EE] border border-[#E8DFD3] space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#64748B] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      PayPal One-Touch Address Autofill
                    </span>
                    <span className="text-emerald-800 font-bold">Instant Dispatch</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-[#E8DFD3] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#1E2530]">Auto-detected Shipping Destination</p>
                        <p className="text-[11px] text-[#64748B]">Verified Postal Coordinates • Global Routing</p>
                      </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* DUAL AGENTIC WORKFLOWS SHOWCASE                                           */}
          {/* ========================================================================= */}
          <section className="max-w-7xl mx-auto px-4 md:px-8" id="studio">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full warm-badge text-xs font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Dual Generative Directors</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-serif font-extrabold text-[#1E2530] tracking-tight">
                Two Tailored Creative Studios
              </h2>
              <p className="text-base md:text-lg text-[#64748B] mt-3">
                Whether bonding with your child at bedtime or orchestrating classroom literacy programs, our specialized agent pipelines adapt seamlessly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Mode A: Family Bedtime Atelier */}
              <div className="p-8 rounded-2xl bg-white border border-[#E8DFD3] hover:border-amber-400 transition-all duration-300 relative group overflow-hidden shadow-warm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-amber-100 border border-amber-300 text-amber-700">
                    <Users className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Mode A</span>
                    <h3 className="text-xl font-serif font-bold text-[#1E2530]">Family Bedtime Atelier</h3>
                  </div>
                </div>
                <p className="text-sm text-[#64748B] mb-6 leading-relaxed">
                  Transform nighttime whispers into real published hard copies. Capture voice recordings of your child’s bedtime story ideas, upload personal portrait sketches, and generate cohesive chapter arcs.
                </p>
                <div className="space-y-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-[#FAF6EE] border border-[#E8DFD3] flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-xs font-medium text-[#1E2530]">Voice-to-Story Audio Prompts with tone calibrator</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#FAF6EE] border border-[#E8DFD3] flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-medium text-[#1E2530]">Consistent Character Faces (Barnaby, Luna, or your pet)</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#FAF6EE] border border-[#E8DFD3] flex items-center gap-3">
                    <PenTool className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-xs font-medium text-[#1E2530]">Simultaneous Story Spread + Coloring Sheet generation</span>
                  </div>
                </div>
                <div className="mt-8">
                  <Link
                    href="/studio"
                    className="inline-flex items-center gap-2 text-sm font-bold text-amber-700 hover:text-amber-900 transition-colors"
                  >
                    <span>Launch Bedtime Atelier</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Mode B: Classroom & Educator Guild */}
              <div className="p-8 rounded-2xl bg-white border border-[#E8DFD3] hover:border-amber-400 transition-all duration-300 relative group overflow-hidden shadow-warm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-amber-100 border border-amber-300 text-amber-700">
                    <GraduationCap className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Mode B</span>
                    <h3 className="text-xl font-serif font-bold text-[#1E2530]">Classroom &amp; Educator Guild</h3>
                  </div>
                </div>
                <p className="text-sm text-[#64748B] mb-6 leading-relaxed">
                  Empower whole classrooms with tailored reading and coloring books. Connect grade-level vocabulary, curriculum objectives, and generate thirty unique student versions in a single batch.
                </p>
                <div className="space-y-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-[#FAF6EE] border border-[#E8DFD3] flex items-center gap-3">
                    <Award className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-xs font-medium text-[#1E2530]">Curriculum &amp; Lexile-Aligned Reading Themes (K-5)</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#FAF6EE] border border-[#E8DFD3] flex items-center gap-3">
                    <Palette className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-xs font-medium text-[#1E2530]">STEM Activity Worksheets &amp; Illustrated Coloring Pages</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#FAF6EE] border border-[#E8DFD3] flex items-center gap-3">
                    <Layers className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-xs font-medium text-[#1E2530]">AG Grid Batch Roster Ingestion with 1-Click CSV Export</span>
                  </div>
                </div>
                <div className="mt-8">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-sm font-bold text-amber-700 hover:text-amber-900 transition-colors"
                  >
                    <span>Access Educator Guild Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* LIVE AG GRID PRODUCTION ORDER TICKER                                      */}
          {/* ========================================================================= */}
          <section className="max-w-7xl mx-auto px-4 md:px-8" id="order-grid">
            <div className="p-6 md:p-8 rounded-2xl bg-white border border-[#E8DFD3] shadow-warm">
              {/* Header & Live Stream Indicator */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 border-b border-[#E8DFD3] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <h3 className="text-xl font-serif font-bold text-[#1E2530]">Live AG Grid Production Stream</h3>
                  </div>
                  <p className="text-xs text-[#64748B] mt-1">
                    Synchronized global print-on-demand queues and direct PDF digital exports.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#64748B] hidden md:inline">
                    Network Nodes: Lulu Raleigh, Lyon, Melbourne
                  </span>
                  <div className="px-3 py-1 rounded-full bg-emerald-50 text-xs font-bold text-emerald-800 border border-emerald-200">
                    Live Feed
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-[#E8DFD3] bg-[#FAF6EE]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF4EB] text-slate-700 font-semibold border-b border-[#E8DFD3] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Story Title</th>
                      <th className="py-3 px-4">Format &amp; Volume</th>
                      <th className="py-3 px-4">Production Node</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DFD3] text-[#1E2530]">
                    <tr className="hover:bg-amber-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono text-amber-800 font-semibold">#PT-8942</td>
                      <td className="py-3 px-4 font-semibold text-[#1E2530]">&quot;Barnaby in Paris&quot;</td>
                      <td className="py-3 px-4 text-slate-600">32 pgs • Softcover</td>
                      <td className="py-3 px-4">Lulu Lyon, France</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" /> Dispatched
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">3 mins ago</td>
                    </tr>
                    <tr className="hover:bg-amber-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono text-amber-800 font-semibold">#PT-8941</td>
                      <td className="py-3 px-4 font-semibold text-[#1E2530]">&quot;Cosmo the Astronaut Cat&quot;</td>
                      <td className="py-3 px-4 text-slate-600">18 pgs • PDF 300 DPI</td>
                      <td className="py-3 px-4">Atelier Cloud Engine</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                          Downloaded
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">7 mins ago</td>
                    </tr>
                    <tr className="hover:bg-amber-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono text-amber-800 font-semibold">#PT-8940</td>
                      <td className="py-3 px-4 font-semibold text-[#1E2530]">&quot;The Secret Garden of Willow Creek&quot;</td>
                      <td className="py-3 px-4 text-slate-600">48 pgs • Atelier Bundle</td>
                      <td className="py-3 px-4">Lulu Raleigh, USA</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                          Binding Spine (80#)
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">12 mins ago</td>
                    </tr>
                    <tr className="hover:bg-amber-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono text-amber-800 font-semibold">#PT-8939</td>
                      <td className="py-3 px-4 font-semibold text-[#1E2530]">&quot;Grade 2: Solar System Voyagers&quot;</td>
                      <td className="py-3 px-4 text-slate-600">24 × 20 pgs • Softcover</td>
                      <td className="py-3 px-4">Lulu Melbourne, AUS</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Batch Print Queue
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">19 mins ago</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row justify-between items-center text-xs text-[#64748B] gap-3">
                <span>Displaying live stream of verified community orders</span>
                <Link
                  href="/dashboard"
                  className="text-amber-800 hover:text-amber-950 flex items-center gap-1 font-bold transition-colors"
                >
                  <span>Launch Full Author Console in AG Grid</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </section>
        </main>

        {/* SHARED COMPONENT: Footer */}
        <footer className="mt-12 bg-[#FAF6EE] border-t border-[#E8DFD3] text-slate-600">
          <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
            <Link href="/" className="active:scale-95 transition-transform duration-150">
              <Logo size="sm" />
            </Link>

            <nav className="flex flex-wrap justify-center items-center gap-6 text-center text-xs text-slate-600">
              <a href="#ecosystem" className="hover:text-amber-700 transition-colors">Print Specifications</a>
              <a href="#ecosystem" className="hover:text-amber-700 transition-colors">Lulu Certification Guarantee</a>
              <Link href="/pricing" className="hover:text-amber-700 transition-colors">Pricing Calculator</Link>
              <Link href="/studio" className="hover:text-amber-700 transition-colors">Studio Atelier</Link>
              <Link href="/dashboard" className="hover:text-amber-700 transition-colors">AG Grid Orders</Link>
            </nav>

            <p className="text-xs text-slate-500 text-center md:text-right max-w-sm">
              © 2026 PaperTales AI Inc. Archival 300 DPI Print Standards &amp; Certified Lulu POD Partner. PayPal AI Hackathon Showcase.
            </p>
          </div>
        </footer>
      </div>

      {/* Token Modal */}
      <TokenModal
        isOpen={tokenModalOpen}
        onClose={() => setTokenModalOpen(false)}
      />
    </div>
  );
}
