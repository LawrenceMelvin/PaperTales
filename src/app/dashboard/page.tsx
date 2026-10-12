"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import OrdersDataGrid from "@/components/OrdersDataGrid";
import TokenModal from "@/components/TokenModal";
import { PaperTalesOrder } from "@/types/order";
import { BookOpen, Printer, DollarSign, Clock, Plus, Sparkles, Layers } from "lucide-react";
import Link from "next/link";

const INITIAL_MOCK_ORDERS: PaperTalesOrder[] = [
  {
    id: "ORD-K829XA",
    bookId: "book_dino_1",
    bookTitle: "Penny's Big Bakery Adventure",
    authorName: "Maya & Dad",
    fulfillmentType: "physical_print",
    status: "in_production",
    pageCount: 8,
    quantity: 1,
    creationFee: 3.5,
    printCost: 4.5,
    shippingCost: 3.99,
    totalAmount: 11.99,
    currency: "USD",
    paypalOrderId: "5BX82910KP882144L",
    paypalCaptureId: "9CC1029482910398A",
    luluJobId: "LULU-849201",
    luluTrackingNumber: "1Z999AA10123984719",
    luluCarrier: "Standard Ground",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "ORD-P910MC",
    bookId: "book_space_2",
    bookTitle: "Barnaby's Journey to Mars",
    authorName: "Lawrence & Leo",
    fulfillmentType: "physical_print",
    status: "shipped",
    pageCount: 6,
    quantity: 2,
    creationFee: 3.5,
    printCost: 8.5,
    shippingCost: 4.99,
    totalAmount: 16.99,
    currency: "USD",
    paypalOrderId: "2LK992010882194X",
    paypalCaptureId: "7BB2019482910321P",
    luluJobId: "LULU-719302",
    luluTrackingNumber: "1Z999AA10184719203",
    luluCarrier: "Standard Ground",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "ORD-M394DF",
    bookId: "book_ocean_3",
    bookTitle: "Coral Reef Mermaid Chronicles",
    authorName: "Mrs. Henderson (Grade 1)",
    fulfillmentType: "digital_pdf",
    status: "paid",
    pageCount: 12,
    quantity: 1,
    creationFee: 3.5,
    printCost: 0,
    shippingCost: 0,
    totalAmount: 3.5,
    currency: "USD",
    paypalOrderId: "8MK102940182910L",
    paypalCaptureId: "1AA9920194820198Z",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

export default function DashboardPage() {
  const [orders, setOrders] = useState<PaperTalesOrder[]>(INITIAL_MOCK_ORDERS);
  const [tokenModalOpen, setTokenModalOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("papertales_orders");
      if (stored) {
        const parsed: PaperTalesOrder[] = JSON.parse(stored);
        setOrders([...parsed, ...INITIAL_MOCK_ORDERS]);
      }
    } catch (e) {
      console.warn("Could not load stored orders:", e);
    }
  }, []);

  const totalBooks = orders.length;
  const inProductionCount = orders.filter((o) => o.status === "in_production").length;
  const grossVolume = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0e1a] text-[#e0e8f0] relative selection:bg-sky-500/30 selection:text-sky-200">
      {/* Ambient Glacier Aurora Frost */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-10 left-1/3 w-[700px] h-[500px] bg-sky-400/10 rounded-full blur-[140px] opacity-40" />
        <div className="absolute bottom-10 right-10 w-[550px] h-[550px] bg-cyan-500/10 rounded-full blur-[160px] opacity-30" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar onOpenTokenModal={() => setTokenModalOpen(true)} />

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header Title */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Author &amp; Teacher Operations Portal
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-400/20 text-sky-300 font-extrabold border border-sky-400/30">
                  AG Grid Showcase
                </span>
              </div>
              <p className="text-xs text-[#a0b4c4] mt-1">
                Unified tracking for AI book generations, PayPal payment captures, and Lulu manufacturing fulfillment.
              </p>
            </div>

            <Link
              href="/studio"
              className="glacier-btn flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              New Book Project
            </Link>
          </div>

          {/* Metric Cards (Glacier Glass) */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="glacier-glass p-4 rounded-xl border border-sky-400/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-400/15 text-sky-300 flex items-center justify-center border border-sky-400/30">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#a0b4c4]">Total Book Orders</p>
                <p className="text-xl font-black text-white">{totalBooks}</p>
              </div>
            </div>

            <div className="glacier-glass p-4 rounded-xl border border-sky-400/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-400/15 text-cyan-300 flex items-center justify-center border border-cyan-400/30">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#a0b4c4]">Active Lulu Print Jobs</p>
                <p className="text-xl font-black text-cyan-300">{inProductionCount}</p>
              </div>
            </div>

            <div className="glacier-glass p-4 rounded-xl border border-sky-400/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-400/15 text-emerald-300 flex items-center justify-center border border-emerald-400/30">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#a0b4c4]">PayPal Gross Volume</p>
                <p className="text-xl font-black text-emerald-300 font-mono">${grossVolume.toFixed(2)}</p>
              </div>
            </div>

            <div className="glacier-glass p-4 rounded-xl border border-sky-400/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-400/15 text-purple-300 flex items-center justify-center border border-purple-400/30">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#a0b4c4]">Avg POD Turnaround</p>
                <p className="text-xl font-black text-purple-300 font-mono">3.8 Days</p>
              </div>
            </div>
          </div>

          {/* AG Grid React Table Container */}
          <div className="glacier-glass p-5 rounded-2xl border border-sky-400/25 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Live Production &amp; Settlement Grid</h3>
              </div>
              <span className="text-[10px] text-[#a0b4c4]">
                Auto-refreshed with PayPal Sandbox &bull; Lulu Print API
              </span>
            </div>

            <OrdersDataGrid orders={orders} />
          </div>
        </main>

        <TokenModal
          isOpen={tokenModalOpen}
          onClose={() => setTokenModalOpen(false)}
        />
      </div>
    </div>
  );
}
