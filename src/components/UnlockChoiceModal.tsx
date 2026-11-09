"use client";

import React, { useState } from "react";
import { BookProject } from "@/types/book";
import { PaperTalesOrder } from "@/types/order";
import { calculateBookQuote } from "@/lib/pricing-calculator";
import { isFirstTimeCustomer, deductClientTokens, markFirstBookClaimed } from "@/lib/token-store";
import { PayPalButtons } from "@paypal/react-paypal-js";
import confetti from "canvas-confetti";
import {
  X,
  Sparkles,
  BookOpen,
  Coins,
  Printer,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Download,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface UnlockChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: BookProject;
  currentTokens: number;
  onDirectUnlockSuccess: (order: PaperTalesOrder) => void;
  onTokenUnlockSuccess: () => void;
  onBuyTokens: () => void;
  onOrderPhysical: () => void;
}

export default function UnlockChoiceModal({
  isOpen,
  onClose,
  book,
  currentTokens,
  onDirectUnlockSuccess,
  onTokenUnlockSuccess,
  onBuyTokens,
  onOrderPhysical,
}: UnlockChoiceModalProps) {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isFirstTime = isFirstTimeCustomer();
  const quote = calculateBookQuote(book.pageCount, "illustrated", isFirstTime);
  const paidPagesCount = quote.paidPages;
  const freePagesCount = quote.freePages;
  const tokensNeeded = quote.tokensRequired;
  const hasEnoughTokens = currentTokens >= tokensNeeded;

  const handleCaptureSuccess = (order: PaperTalesOrder) => {
    markFirstBookClaimed();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#d97706", "#f59e0b", "#fbbf24", "#78350f"],
    });
    onDirectUnlockSuccess(order);
  };

  const handleTokenUnlock = () => {
    if (!hasEnoughTokens) {
      onBuyTokens();
      return;
    }
    const success = deductClientTokens(tokensNeeded);
    if (success) {
      markFirstBookClaimed();
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#d97706", "#f59e0b", "#fbbf24"],
      });
      onTokenUnlockSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#FFFDF9] rounded-3xl border border-[#E8DFD3] p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative my-8 space-y-6">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 pr-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold tracking-wide uppercase">
            <Lock className="w-3.5 h-3.5 text-amber-700" />
            Unlock Complete Book ({book.pageCount} Pages)
          </div>
          <h3 className="text-2xl sm:text-3xl font-black font-serif text-[#1E2530]">
            Choose How to Unlock &ldquo;{book.title}&rdquo;
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            {isFirstTime && freePagesCount > 0 ? (
              <>
                Your first <strong className="text-amber-800">{freePagesCount} pages are 100% free</strong>!
                Unlock the remaining <strong className="text-[#1E2530]">{paidPagesCount} pages</strong> below to review,
                edit in AI chat, and download the print-ready 300 DPI vector PDF.
              </>
            ) : (
              <>
                Unlock all <strong className="text-[#1E2530]">{paidPagesCount} pages</strong> to immediately unblur,
                review and tweak spreads in AI chat, and download the 300 DPI vector PDF.
              </>
            )}
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* 3 Choice Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Track 1: Direct Digital Book via PayPal (Recommended) */}
          <div className="bg-[#FAF6EE] rounded-2xl p-5 border-2 border-amber-400/80 shadow-md flex flex-col justify-between relative space-y-4">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
              Instant 1-Click
            </div>

            <div className="space-y-3 pt-1">
              <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
                <BookOpen className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h4 className="font-extrabold text-[#1E2530] text-base">Digital Edition</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Direct PayPal Purchase</p>
              </div>

              <div className="pt-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[#1E2530] font-serif">
                    ${quote.priceUsd.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">USD</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {paidPagesCount} paid pages &bull; ~₹{quote.priceInrApprox} INR
                </p>
              </div>

              <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-[#E8DFD3]">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Instant full unblur</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>300 DPI vector PDF</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Unlimited chat revisions</span>
                </li>
              </ul>
            </div>

            {/* PayPal Smart Button */}
            <div className="pt-2 min-h-[46px]">
              {isProcessing ? (
                <div className="w-full py-2.5 rounded-xl bg-white border border-[#E8DFD3] flex items-center justify-center gap-2 text-xs font-bold text-slate-700">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                  <span>Processing...</span>
                </div>
              ) : (
                <PayPalButtons
                  style={{ layout: "horizontal", height: 40, label: "pay", tagline: false }}
                  forceReRender={[quote.priceUsd, book.id]}
                  createOrder={async () => {
                    setIsProcessing(true);
                    setErrorMessage(null);
                    try {
                      const res = await fetch("/api/paypal/create-order", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          type: "book_order",
                          bookCheckout: {
                            bookTitle: book.title,
                            fulfillmentType: "digital_download",
                            creationFee: quote.priceUsd,
                            printCost: 0,
                            shippingCost: 0,
                          },
                        }),
                      });
                      const data = await res.json();
                      setIsProcessing(false);
                      if (!res.ok || !data.orderId) {
                        throw new Error(data.error || "Failed to create digital book order");
                      }
                      if (data.mock || data.orderId.startsWith("SANDBOX-")) {
                        const mockOrder: PaperTalesOrder = {
                          id: `ORD-DIGITAL-${Date.now().toString(36).toUpperCase()}`,
                          bookId: book.id,
                          bookTitle: book.title,
                          authorName: book.authorName || "Creator",
                          fulfillmentType: "digital_pdf",
                          status: "paid",
                          pageCount: book.pageCount,
                          quantity: 1,
                          creationFee: quote.priceUsd,
                          printCost: 0,
                          shippingCost: 0,
                          totalAmount: quote.priceUsd,
                          currency: "USD",
                          paypalOrderId: data.orderId,
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString(),
                        };
                        handleCaptureSuccess(mockOrder);
                        return "";
                      }
                      return data.orderId;
                    } catch (err: any) {
                      setIsProcessing(false);
                      setErrorMessage(err.message || "Could not initialize PayPal order.");
                      console.error("Direct digital order error:", err);
                      throw err;
                    }
                  }}
                  onApprove={async (data) => {
                    setIsProcessing(true);
                    setErrorMessage(null);
                    try {
                      const res = await fetch("/api/paypal/capture-order", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          orderId: data.orderID,
                          orderDetails: {
                            bookId: book.id,
                            bookTitle: book.title,
                            authorName: book.authorName || "Creator",
                            fulfillmentType: "digital_pdf",
                            pageCount: book.pageCount,
                            creationFee: quote.priceUsd,
                            totalAmount: quote.priceUsd,
                          },
                        }),
                      });
                      const captureData = await res.json();
                      setIsProcessing(false);
                      if (captureData.success && captureData.order) {
                        handleCaptureSuccess(captureData.order);
                      } else {
                        setErrorMessage(captureData.error || "PayPal payment capture failed.");
                      }
                    } catch (err: any) {
                      setIsProcessing(false);
                      setErrorMessage(err.message || "Error capturing PayPal payment.");
                    }
                  }}
                  onError={(err: any) => {
                    console.warn("PayPal button notice:", err);
                    setErrorMessage(
                      "PayPal Sandbox checkout could not complete. Make sure you log in with a Sandbox Personal (Buyer) account."
                    );
                  }}
                />
              )}
            </div>
          </div>

          {/* Track 2: Pay with Tokens */}
          <div className="bg-[#FAF6EE] rounded-2xl p-5 border border-[#E8DFD3] hover:border-amber-300 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
                <Coins className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h4 className="font-extrabold text-[#1E2530] text-base">Creator Tokens</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Use existing token pack</p>
              </div>

              <div className="pt-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-[#1E2530] font-serif">
                    {tokensNeeded}
                  </span>
                  <span className="text-xs text-slate-500 font-bold">🪙 Tokens</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Your Balance: <strong className={hasEnoughTokens ? "text-emerald-700" : "text-amber-800"}>{currentTokens} Tokens</strong>
                </p>
              </div>

              <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-[#E8DFD3]">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>1 token per paid page</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Save on multi-book packs</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Unused tokens never expire</span>
                </li>
              </ul>
            </div>

            <div className="pt-2">
              {hasEnoughTokens ? (
                <button
                  type="button"
                  onClick={handleTokenUnlock}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Coins className="w-4 h-4" />
                  <span>Spend {tokensNeeded} Tokens Now</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onBuyTokens}
                  className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-[#FAF6EE] text-[#1E2530] border border-[#E8DFD3] hover:border-amber-400 font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Buy Token Pack</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-700" />
                </button>
              )}
            </div>
          </div>

          {/* Track 3: Physical Softcover Keepsake */}
          <div className="bg-[#FAF6EE] rounded-2xl p-5 border border-[#E8DFD3] hover:border-amber-300 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
                <Printer className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h4 className="font-extrabold text-[#1E2530] text-base">Archival Print</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Physical Softcover POD</p>
              </div>

              <div className="pt-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl sm:text-2xl font-black text-[#1E2530] font-serif">
                    From ~$8.99
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Includes Print &bull; Binding &bull; Shipping
                </p>
              </div>

              <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-[#E8DFD3]">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>60# uncoated white paper</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Delivered to your door</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Digital edition included</span>
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onOrderPhysical}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs shadow-sm shadow-amber-600/20 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Configure Physical Book</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer reassurance */}
        <div className="pt-2 border-t border-[#E8DFD3] flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Secure PayPal Checkout &bull; Verified Instant Digital Unlock</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5 text-amber-700" />
            <span>Print-ready 300 DPI vector PDF included with every unlock</span>
          </div>
        </div>
      </div>
    </div>
  );
}
