"use client";

import React, { useState, useEffect } from "react";
import { X, Printer, Download, Sparkles, CheckCircle2, PackageCheck, Plus, Check, AlertTriangle, ShieldCheck, Search } from "lucide-react";
import { BookProject } from "@/types/book";
import { CompanionProduct, LuluQuoteResponse, PaperTalesOrder } from "@/types/order";
import { PayPalButtons } from "@paypal/react-paypal-js";
import confetti from "canvas-confetti";
import { calculateBookQuote, calculateLuluCommission } from "@/lib/pricing-calculator";
import { dispatchTokensUpdated } from "@/lib/token-store";
import { dispatchOrdersUpdated } from "@/lib/order-store";
import { apiFetch } from "@/lib/api-fetch";
import { useAuth } from "@/components/AuthProvider";

interface OrderSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: BookProject;
  initialFulfillmentType?: "physical_print" | "digital_pdf";
  isDigitalUnlocked?: boolean;
  onOrderCompleted?: (order: PaperTalesOrder) => void;
  onDownloadPdf?: () => void;
}

export default function OrderSummaryModal({
  isOpen,
  onClose,
  book,
  initialFulfillmentType = "physical_print",
  isDigitalUnlocked = false,
  onOrderCompleted,
  onDownloadPdf,
}: OrderSummaryModalProps) {
  const { freeGrantClaimed, refreshProfile } = useAuth();
  const [fulfillmentType, setFulfillmentType] = useState<"physical_print" | "digital_pdf">(initialFulfillmentType);
  const [luluQuote, setLuluQuote] = useState<LuluQuoteResponse | null>(null);
  const [loadingQuote, setLoadingQuote] = useState<boolean>(true);
  const [companionProducts, setCompanionProducts] = useState<CompanionProduct[]>([]);
  const [selectedCompanion, setSelectedCompanion] = useState<CompanionProduct | null>(null);
  const [completedOrder, setCompletedOrder] = useState<PaperTalesOrder | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [paypalRetryKey, setPaypalRetryKey] = useState<number>(0);
  const [channel3SearchQuery, setChannel3SearchQuery] = useState<string>("");
  const [isSearchingChannel3, setIsSearchingChannel3] = useState<boolean>(false);
  const isSandboxMode = process.env.NEXT_PUBLIC_PAYPAL_ENV !== "production";

  const handleChannel3Search = async (query: string) => {
    setIsSearchingChannel3(true);
    try {
      const res = await fetch(`/api/channel3/suggest?genre=${encodeURIComponent(book.genre || "coloring_book")}&query=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success && data.products) {
        setCompanionProducts(data.products);
      }
    } catch (err) {
      console.error("Channel3 search failed:", err);
    } finally {
      setIsSearchingChannel3(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setFulfillmentType(initialFulfillmentType);
      setSelectedCompanion(null);
      setCompletedOrder(null);
      setCheckoutError(null);
      setPaypalRetryKey((k) => k + 1);
    }
  }, [isOpen, initialFulfillmentType, book.id]);

  // Fetch dynamic Lulu quote and Channel3 companion suggestions on mount
  useEffect(() => {
    if (!isOpen) return;

    async function fetchData() {
      setLoadingQuote(true);
      try {
        // 1. Lulu Quote
        const quoteRes = await fetch("/api/lulu/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pageCount: book.pageCount,
            quantity: 1,
            trimSize: book.format?.trimSize,
            interiorColor: book.format?.interiorColor,
          }),
        });
        const quoteData = await quoteRes.json();
        if (quoteData.success) {
          setLuluQuote(quoteData.quote);
        }

        // 2. Channel3 Companion Catalog (tailored dynamically to book genre; strictly opt-in)
        const ch3Res = await fetch(`/api/channel3/suggest?genre=${encodeURIComponent(book.genre || "coloring_book")}`);
        const ch3Data = await ch3Res.json();
        if (ch3Data.success && ch3Data.products && ch3Data.products.length > 0) {
          setCompanionProducts(ch3Data.products);
        }
      } catch (err) {
        console.error("Error fetching checkout details:", err);
      } finally {
        setLoadingQuote(false);
      }
    }

    fetchData();
  }, [isOpen, book.pageCount, book.genre, book.format?.trimSize, book.format?.interiorColor, initialFulfillmentType]);

  if (!isOpen) return null;

  // Dynamic page-count pricing formula (First 5 pages free for first-time customers)
  const isFirstTime = !freeGrantClaimed;
  const effectivePages = book.pageCount || book.pages?.length || 12;
  const dynamicQuote = calculateBookQuote(effectivePages, "illustrated", isFirstTime);
  const baseCreationFee = dynamicQuote.priceUsd > 0 ? dynamicQuote.priceUsd : 0.99;
  // If digital edition was already purchased/unlocked, credit 100% of creation fee
  const creationFee = isDigitalUnlocked ? 0.0 : baseCreationFee;

  const baseUnitPrintCost = luluQuote?.unitPrintCost || 4.5;
  const baseShippingCost = luluQuote?.shippingCost || 3.99;
  // 10% platform commission bundled into physical manufacturing fee
  const commission = calculateLuluCommission(baseUnitPrintCost, baseShippingCost);
  const printCost = fulfillmentType === "physical_print"
    ? Number((baseUnitPrintCost + commission).toFixed(2))
    : 0;
  const shippingCost = fulfillmentType === "physical_print" ? baseShippingCost : 0;
  const companionCost = selectedCompanion ? selectedCompanion.price : 0;
  const grandTotal = Number((creationFee + printCost + shippingCost + companionCost).toFixed(2));

  const isPhysicalBlocked = fulfillmentType === "physical_print" && !book.cover?.isDesigned;


  const buildSandboxFallbackOrder = (): PaperTalesOrder => ({
    id: `ORD-SANDBOX-${Date.now().toString(36).toUpperCase()}`,
    bookId: book.id,
    bookTitle: book.title,
    authorName: book.authorName,
    fulfillmentType,
    status: fulfillmentType === "physical_print" ? "in_production" : "paid",
    pageCount: book.pageCount,
    trimSize: book.format?.trimSize,
    interiorColor: book.format?.interiorColor,
    quantity: 1,
    creationFee,
    printCost,
    shippingCost,
    companionItem: selectedCompanion || undefined,
    totalAmount: grandTotal,
    currency: "USD",
    paypalOrderId: `SANDBOX-ORDER-${Date.now().toString(36).toUpperCase()}`,
    paypalCaptureId: `CAP-MOCK-${Date.now()}`,
    shippingAddress: {
      recipientName: "Demo Creator",
      street1: "742 Evergreen Terrace",
      city: "Springfield",
      stateOrProvince: "OR",
      postalCode: "97477",
      countryCode: "US",
    },
    luluJobId: `LULU-${Math.floor(100000 + Math.random() * 900000)}`,
    luluTrackingNumber: `1Z999AA101${Math.floor(10000000 + Math.random() * 90000000)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const handleOrderSuccess = (order: PaperTalesOrder) => {
    setCompletedOrder(order);
    refreshProfile();
    dispatchTokensUpdated();
    dispatchOrdersUpdated();
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    try {
      const stored = localStorage.getItem("papertales_orders");
      const currentList: PaperTalesOrder[] = stored ? JSON.parse(stored) : [];
      localStorage.setItem("papertales_orders", JSON.stringify([order, ...currentList]));
    } catch (err) {
      console.warn("Could not persist order to local storage:", err);
    }
    if (onOrderCompleted) {
      onOrderCompleted(order);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#FFFDF9] w-full max-w-xl rounded-3xl shadow-2xl border border-[#E8DFD3] overflow-hidden flex flex-col max-h-[90vh] text-[#1E2530]">
        {/* Header */}
        <div className="px-6 py-5 bg-[#FAF6EE] border-b border-[#E8DFD3] text-[#1E2530] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black font-serif text-[#1E2530]">PaperTales Print &amp; Fulfillment</h3>
              <p className="text-xs text-[#5C5347]">
                Direct Lulu manufacturing &bull; Channel3 companion kit &bull; PayPal rails
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-[#1E2530] p-1.5 rounded-lg hover:bg-amber-100/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-[#1E2530]">
          {completedOrder ? (
            /* Order Completion Success View */
            <div className="py-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mb-4">
                <PackageCheck className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-black font-serif text-[#1E2530]">Order Confirmed!</h4>
              <p className="text-xs text-[#5C5347] mt-1 max-w-md">
                PayPal transaction completed successfully. Order <strong className="text-[#1E2530]">{completedOrder.id}</strong> is logged in the AG Grid dispatch system.
              </p>

              {completedOrder.fulfillmentType === "physical_print" ? (
                <div className="w-full bg-[#FAF6EE] border border-[#E8DFD3] rounded-xl p-4 mt-5 text-left text-xs space-y-2">
                  <div className="flex justify-between font-semibold text-[#5C5347]">
                    <span>Lulu Print Job ID:</span>
                    <span className="font-mono text-amber-800 font-bold">{completedOrder.luluJobId}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-[#5C5347]">
                    <span>Carrier Tracking Number:</span>
                    <span className="font-mono text-emerald-700 font-bold">{completedOrder.luluTrackingNumber}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-[#5C5347]">
                    <span>Shipping Destination:</span>
                    <span className="text-[#1E2530]">{completedOrder.shippingAddress?.city}, {completedOrder.shippingAddress?.stateOrProvince} ({completedOrder.shippingAddress?.countryCode})</span>
                  </div>
                  <div className="flex justify-between font-semibold text-[#5C5347] pt-2 border-t border-[#E8DFD3]">
                    <span>Status:</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px]">
                      In Production (3-5 Days)
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-full bg-emerald-50 border border-emerald-300 rounded-xl p-4 mt-5 text-center text-xs text-emerald-900 font-medium">
                  Your print-ready 300 DPI PDF is unlocked and ready for instant download!
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                {onDownloadPdf && (
                  <button
                    onClick={onDownloadPdf}
                    className="px-5 py-2.5 text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Full 300 DPI PDF</span>
                  </button>
                )}
                <a
                  href="/dashboard"
                  className="px-5 py-2.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-sm transition-all"
                >
                  View in AG Grid Dashboard &rarr;
                </a>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 text-xs font-bold bg-white hover:bg-[#FAF6EE] text-[#1E2530] border border-[#E8DFD3] rounded-xl transition-colors cursor-pointer"
                >
                  Return to Studio
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Option 1 vs Option 2: Format Choice */}
              <div>
                <label className="block text-xs font-bold text-[#5C5347] mb-2 uppercase tracking-wider">
                  Select Delivery Option:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => {
                      setFulfillmentType("physical_print");
                      setCheckoutError(null);
                    }}
                    className={`cursor-pointer p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                      fulfillmentType === "physical_print"
                        ? "border-2 border-amber-500 bg-amber-50/70 shadow-sm"
                        : "border-[#E8DFD3] bg-[#FAF6EE] hover:border-amber-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-300">
                        <Printer className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-[#1E2530]">Physical Printed Book</span>
                    </div>
                    <p className="text-[11px] text-[#5C5347]">
                      Printed by Lulu on 80# satin archival stock &amp; softcover bound. Shipped to your door.
                    </p>
                    <span className="text-xs font-bold text-amber-800 mt-2">
                      Print &amp; Ship (~${(printCost + shippingCost).toFixed(2)})
                    </span>
                  </div>

                  <div
                    onClick={() => {
                      setFulfillmentType("digital_pdf");
                      setCheckoutError(null);
                    }}
                    className={`cursor-pointer p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                      fulfillmentType === "digital_pdf"
                        ? "border-2 border-amber-500 bg-amber-50/70 shadow-sm"
                        : "border-[#E8DFD3] bg-[#FAF6EE] hover:border-amber-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-300">
                        <Download className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-[#1E2530]">Instant Digital PDF</span>
                    </div>
                    <p className="text-[11px] text-[#5C5347]">
                      High-res vector 300 DPI PDF with bleed margins. Print at home or read on tablets.
                    </p>
                    <span className="text-xs font-bold text-emerald-800 mt-2">
                      {isDigitalUnlocked ? "Included (Unlocked)" : `$${creationFee.toFixed(2)} (${dynamicQuote.tokensRequired} Tokens)`}
                    </span>
                  </div>
                </div>

                {fulfillmentType === "physical_print" && (
                  <div className="mt-2.5 space-y-2">
                    {isPhysicalBlocked ? (
                      <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 flex items-start gap-2.5 text-xs text-rose-950 animate-in fade-in">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div className="space-y-1.5">
                          <p className="font-extrabold text-rose-900">Front Cover Required for Physical Print Orders</p>
                          <p className="text-[11px] text-rose-800 leading-relaxed">
                            Lulu POD factory machinery requires a designed wraparound cover spread to print physical softcovers. A physical order cannot be placed without a designed cover.
                          </p>
                          <div className="pt-1 flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={onClose}
                              className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold text-[11px] cursor-pointer shadow-xs"
                            >
                              🎨 Go to Studio &amp; Design Cover
                            </button>
                            <button
                              type="button"
                              onClick={() => setFulfillmentType("digital_pdf")}
                              className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#FAF6EE] text-[#1E2530] text-[11px] font-bold border border-[#E8DFD3] cursor-pointer"
                            >
                              Switch to Instant Digital PDF
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-2 text-[11px] text-amber-950">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-amber-900">Lulu Print Clearance Note:</span> If your book uses trademarked franchise names or logos, commercial print factories may flag the title for review. Digital PDF exports are unrestricted for personal use.
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Channel3 Agentic Commerce Companion Bundling */}
              {companionProducts.length > 0 && (
                <div className="bg-[#FAF6EE] border border-[#E8DFD3] rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-bold text-[#1E2530]">
                        Companion Art Bundle (Channel3 Agentic Commerce)
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      Optional Add-on
                    </span>
                  </div>

                  {/* Channel3 Live Search Bar */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (channel3SearchQuery.trim()) {
                        handleChannel3Search(channel3SearchQuery.trim());
                      }
                    }}
                    className="flex items-center gap-1.5"
                  >
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-amber-700 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search art supplies, markers, paints (Channel3)..."
                        value={channel3SearchQuery}
                        onChange={(e) => setChannel3SearchQuery(e.target.value)}
                        className="w-full bg-white text-xs text-[#1E2530] placeholder-slate-400 pl-8 pr-2.5 py-1.5 rounded-lg border border-[#E8DFD3] focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSearchingChannel3 || !channel3SearchQuery.trim()}
                      className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
                    >
                      {isSearchingChannel3 ? "..." : "Search"}
                    </button>
                  </form>

                  {/* Scrollable Grid of up to 6 Channel3 recommendations */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto glacier-scrollbar pr-1">
                    {companionProducts.slice(0, 6).map((item) => {
                      const isAdded = selectedCompanion?.id === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedCompanion(isAdded ? null : item)}
                          className={`cursor-pointer p-2 rounded-xl border text-xs flex items-center gap-2.5 transition-all ${
                            isAdded
                              ? "bg-amber-50 border-amber-500 shadow-sm ring-1 ring-amber-400/30"
                              : "bg-white border-[#E8DFD3] hover:border-amber-400"
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-10 h-10 object-cover rounded-lg border border-[#E8DFD3] shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-[#1E2530] truncate text-[11px]">{item.title}</p>
                            <p className="text-[10px] text-[#5C5347]">
                              ${item.price.toFixed(2)} &bull;{" "}
                              <span className="text-amber-800 font-semibold">{item.retailerDomain || item.brand}</span>
                            </p>
                          </div>
                          <button
                            type="button"
                            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                              isAdded ? "bg-amber-600 text-white font-bold" : "border border-slate-300 text-slate-600 bg-white"
                            }`}
                          >
                            {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Itemized Order Breakdown */}
              <div className="bg-[#FAF6EE] rounded-xl p-4 border border-[#E8DFD3] text-xs space-y-2">
                <div className="flex justify-between text-[#5C5347]">
                  <span>Custom AI Generation &amp; 300 DPI PDF License:</span>
                  {isDigitalUnlocked ? (
                    <span className="font-semibold text-emerald-700">$0.00 (Included)</span>
                  ) : (
                    <span className="font-mono font-bold text-[#1E2530]">${creationFee.toFixed(2)}</span>
                  )}
                </div>

                {fulfillmentType === "physical_print" && (
                  <>
                    <div className="flex justify-between text-[#5C5347]">
                      <span>Archival Softcover Print &amp; Binding ({book.format?.trimSize || "8.5x8.5"}):</span>
                      <span className="font-mono font-bold text-[#1E2530]">${printCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[#5C5347]">
                      <span>Tracked Standard Shipping:</span>
                      <span className="font-mono font-bold text-[#1E2530]">${shippingCost.toFixed(2)}</span>
                    </div>
                  </>
                )}

                {selectedCompanion && (
                  <div className="flex justify-between text-amber-900 font-semibold">
                    <span>Companion: {selectedCompanion.title}</span>
                    <span className="font-mono">+${selectedCompanion.price.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-extrabold text-[#1E2530] pt-2 border-t border-[#E8DFD3]">
                  <span>Total Amount (USD):</span>
                  <span className="font-mono text-amber-800 text-base font-black">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* PayPal Smart Buttons */}
              <div className="pt-1">
                <div className="min-h-[45px]">
                  {isPhysicalBlocked ? (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-center space-y-1">
                      <p className="text-xs font-bold text-rose-900">Physical Print Checkout Blocked</p>
                      <p className="text-[11px] text-rose-800">Please design a front cover in the Studio before ordering a physical copy, or select Instant Digital PDF above.</p>
                    </div>
                  ) : (
                    <PayPalButtons
                    key={`paypal-order-${paypalRetryKey}`}
                    style={{ layout: "horizontal", height: 42, label: "checkout" }}
                    forceReRender={[
                      fulfillmentType,
                      creationFee,
                      printCost,
                      shippingCost,
                      selectedCompanion?.id || "none",
                      grandTotal,
                      book.title,
                      paypalRetryKey,
                    ]}
                    createOrder={async () => {
                      setCheckoutError(null);
                      try {
                        const res = await apiFetch("/api/paypal/create-order", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            type: "book_order",
                            bookCheckout: {
                              bookId: book.id,
                              bookTitle: book.title,
                              pageCount: book.pageCount,
                              trimSize: book.format?.trimSize,
                              interiorColor: book.format?.interiorColor,
                              quantity: 1,
                              fulfillmentType,
                              companionItem: selectedCompanion,
                            },
                          }),
                        });

                        if (!res.ok) {
                          const errData = await res.json().catch(() => ({}));
                          throw new Error(errData.error || `HTTP error ${res.status}`);
                        }

                        const data = await res.json();
                        if (!data.orderId) {
                          throw new Error("Missing orderId from PayPal create-order response");
                        }

                        // If offline / mock simulation
                        if (data.mock || data.orderId.startsWith("SANDBOX-")) {
                          const mockOrder = buildSandboxFallbackOrder();
                          mockOrder.paypalOrderId = data.orderId;
                          handleOrderSuccess(mockOrder);
                          throw new Error("MOCK_SIMULATION_COMPLETED");
                        }

                        return data.orderId;
                      } catch (err: any) {
                        if (err.message === "MOCK_SIMULATION_COMPLETED") {
                          return "";
                        }
                        console.error("Error creating PayPal order:", err);
                        setCheckoutError(err.message || "Failed to initialize PayPal order.");
                        throw err;
                      }
                    }}
                    onCancel={() => {
                      setPaypalRetryKey((k) => k + 1);
                      setCheckoutError(
                        "Payment window was closed before completion. Your checkout session has been reset — click PayPal whenever you are ready to try again."
                      );
                    }}
                    onApprove={async (data) => {
                      setCheckoutError(null);
                      try {
                        const res = await apiFetch("/api/paypal/capture-order", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            orderId: data.orderID,
                          }),
                        });
                        const captureData = await res.json();
                        if (captureData.success) {
                          handleOrderSuccess(captureData.order);
                        } else {
                          console.error("Capture failed:", captureData);
                          setPaypalRetryKey((k) => k + 1);
                          setCheckoutError(
                            captureData.error ||
                              "PayPal capture failed. Please reset the session or use a Sandbox Personal (Buyer) account."
                          );
                        }
                      } catch (err: any) {
                        setPaypalRetryKey((k) => k + 1);
                        setCheckoutError(err.message || "Error capturing PayPal order.");
                      }
                    }}
                    onError={(err: any) => {
                      console.warn("PayPal checkout notice:", err);
                      setPaypalRetryKey((k) => k + 1);
                      setCheckoutError(
                        "PayPal Sandbox checkout could not complete (or declined by Sandbox compliance rules). Reset the session below or complete a Sandbox Test Order."
                      );
                    }}
                  />
                  )}
                </div>
                {checkoutError && (
                  <div className="mt-2.5 p-3 rounded-xl bg-rose-50 border border-rose-300 text-[11px] text-rose-900 text-center space-y-2.5">
                    <p className="font-medium leading-relaxed">{checkoutError}</p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCheckoutError(null);
                          setPaypalRetryKey((k) => k + 1);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#FAF6EE] text-[#1E2530] border border-[#E8DFD3] font-bold text-[11px] cursor-pointer shadow-2xs"
                      >
                        🔄 Reset &amp; Retry PayPal
                      </button>
                      {isSandboxMode && (
                        <button
                          type="button"
                          onClick={() => handleOrderSuccess(buildSandboxFallbackOrder())}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] cursor-pointer shadow-xs"
                        >
                          ⚡ Complete Sandbox Test Order
                        </button>
                      )}
                    </div>
                  </div>
                )}
                <p className="text-[10px] text-center text-[#5C5347] mt-2">
                  🔒 Encrypted checkout via PayPal Sandbox &bull; Instant digital unlock &amp; dispatch
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
