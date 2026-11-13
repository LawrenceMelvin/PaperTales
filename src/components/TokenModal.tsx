"use client";

import React, { useState } from "react";
import { X, Coins, Sparkles, CheckCircle2 } from "lucide-react";
import { AVAILABLE_TOKEN_PACKS, addClientTokens } from "@/lib/token-store";
import { TokenPack } from "@/types/order";
import { PayPalButtons } from "@paypal/react-paypal-js";
import confetti from "canvas-confetti";

interface TokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (addedTokens: number) => void;
}

export default function TokenModal({ isOpen, onClose, onSuccess }: TokenModalProps) {
  const [selectedPack, setSelectedPack] = useState<TokenPack>(AVAILABLE_TOKEN_PACKS[1]); // Default to Creator bundle
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paypalRetryKey, setPaypalRetryKey] = useState<number>(0);
  const isSandboxMode = process.env.NEXT_PUBLIC_PAYPAL_ENV !== "production";

  if (!isOpen) return null;

  const handleCaptureSuccess = (pack: TokenPack) => {
    setErrorMessage(null);
    addClientTokens(pack.tokens + (pack.bonusTokens || 0));
    confetti({ particleCount: 75, spread: 60, origin: { y: 0.7 } });
    setSuccessMessage(`Successfully refilled ${pack.tokens + (pack.bonusTokens || 0)} tokens!`);
    if (onSuccess) onSuccess(pack.tokens + (pack.bonusTokens || 0));
    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#FFFDF9] w-full max-w-2xl rounded-3xl shadow-2xl border border-[#E8DFD3] overflow-hidden flex flex-col text-[#1E2530]">
        {/* Header */}
        <div className="px-6 py-5 bg-[#FAF6EE] border-b border-[#E8DFD3] text-[#1E2530] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black font-serif text-[#1E2530]">PaperTales Token Vault</h3>
              <p className="text-xs text-[#5C5347]">Pay-as-you-go &bull; No monthly subscriptions &bull; Secure with PayPal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-[#1E2530] p-1.5 rounded-lg hover:bg-amber-100/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {successMessage ? (
            <div className="py-12 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-extrabold font-serif text-[#1E2530]">{successMessage}</h4>
              <p className="text-xs text-[#5C5347] mt-1">Your token vault balance has been updated immediately.</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-[#5C5347] mb-4 font-medium">
                Choose a flexible credit pack to generate new chapters, consistent character sheets, and print-ready vector PDF packages.
              </p>

              {/* Pack Selector Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                {AVAILABLE_TOKEN_PACKS.map((pack) => {
                  const isSelected = selectedPack.id === pack.id;
                  return (
                    <div
                      key={pack.id}
                      onClick={() => {
                        setSelectedPack(pack);
                        setErrorMessage(null);
                      }}
                      className={`relative cursor-pointer rounded-xl p-4 border transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-2 border-amber-500 bg-amber-50/80 shadow-md"
                          : "border-[#E8DFD3] bg-[#FAF6EE] hover:border-amber-300"
                      }`}
                    >
                      {pack.badge && (
                        <span className="absolute -top-2.5 right-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-600 text-white shadow-sm">
                          {pack.badge}
                        </span>
                      )}

                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E2530] mb-1">
                          <Coins className="w-4 h-4 text-amber-600" />
                          <span>{pack.tokens} Tokens</span>
                          {pack.bonusTokens && (
                            <span className="text-[10px] text-emerald-700 font-extrabold">+{pack.bonusTokens} Free</span>
                          )}
                        </div>
                        <div className="text-xl font-extrabold text-amber-800 mb-2 font-mono">
                          ${pack.priceUsd.toFixed(2)}
                        </div>
                        <ul className="text-[11px] text-[#5C5347] space-y-1 mb-2">
                          {pack.features.slice(0, 2).map((feat, i) => (
                            <li key={i} className="flex items-center gap-1">
                              &bull; {feat}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-2 border-t border-[#E8DFD3] flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-[#5C5347]">One-time payment</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? "border-amber-600 bg-amber-600 text-white" : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* PayPal Checkout Area */}
              <div className="bg-[#FAF6EE] rounded-xl p-4 border border-[#E8DFD3]">
                <div className="flex items-center justify-between text-xs font-bold text-[#1E2530] mb-3">
                  <span>Selected: {selectedPack.name}</span>
                  <span className="text-sm font-extrabold font-mono text-amber-800">${selectedPack.priceUsd.toFixed(2)}</span>
                </div>

                <div className="min-h-[45px]">
                  <PayPalButtons
                    key={`paypal-token-${paypalRetryKey}`}
                    style={{ layout: "horizontal", height: 42, label: "pay" }}
                    forceReRender={[selectedPack.id, selectedPack.priceUsd, paypalRetryKey]}
                    createOrder={async () => {
                      setIsProcessing(true);
                      setErrorMessage(null);
                      try {
                        const res = await fetch("/api/paypal/create-order", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            type: "token_pack",
                            tokenPackId: selectedPack.id,
                          }),
                        });
                        const data = await res.json();
                        setIsProcessing(false);
                        if (!res.ok || !data.orderId) {
                          throw new Error(data.error || "Failed to create token order");
                        }
                        if (data.mock || data.orderId.startsWith("SANDBOX-")) {
                          handleCaptureSuccess(selectedPack);
                          return "";
                        }
                        return data.orderId;
                      } catch (err: any) {
                        setIsProcessing(false);
                        setErrorMessage(err.message || "Could not initialize PayPal order.");
                        console.error("Token order error:", err);
                        throw err;
                      }
                    }}
                    onCancel={() => {
                      setIsProcessing(false);
                      setPaypalRetryKey((k) => k + 1);
                      setErrorMessage(
                        "Payment window was closed before completion. Your PayPal session has been reset — click the PayPal button whenever you're ready to retry."
                      );
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
                          }),
                        });
                        const captureData = await res.json();
                        setIsProcessing(false);
                        if (captureData.success) {
                          handleCaptureSuccess(selectedPack);
                        } else {
                          setPaypalRetryKey((k) => k + 1);
                          setErrorMessage(captureData.error || "PayPal payment capture failed. Please reset and retry.");
                        }
                      } catch (err: any) {
                        setIsProcessing(false);
                        setPaypalRetryKey((k) => k + 1);
                        setErrorMessage(err.message || "Error capturing PayPal payment.");
                      }
                    }}
                    onError={(err: any) => {
                      setIsProcessing(false);
                      setPaypalRetryKey((k) => k + 1);
                      console.warn("PayPal token button notice:", err);
                      setErrorMessage(
                        "PayPal Sandbox checkout could not complete. Reset and retry below, or complete a Sandbox Test Order."
                      );
                    }}
                  />
                </div>

                {errorMessage && (
                  <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-300 text-[11px] text-rose-900 text-center space-y-2.5">
                    <p className="font-medium leading-relaxed">{errorMessage}</p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setErrorMessage(null);
                          setPaypalRetryKey((k) => k + 1);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#FAF6EE] text-[#1E2530] border border-[#E8DFD3] font-bold text-[11px] cursor-pointer shadow-2xs"
                      >
                        🔄 Reset &amp; Retry PayPal
                      </button>
                      {isSandboxMode && (
                        <button
                          type="button"
                          onClick={() => handleCaptureSuccess(selectedPack)}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] cursor-pointer shadow-xs"
                        >
                          ⚡ Complete Sandbox Test Order
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-center text-[#5C5347] mt-2">
                  🔒 Encrypted transaction via PayPal Sandbox &bull; Instant balance crediting
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
