"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  ColDef,
  GridReadyEvent,
  GridApi,
  ModuleRegistry,
  AllCommunityModule,
  ICellRendererParams,
  themeQuartz,
} from "ag-grid-community";
import { PublishOrder } from "@/types/order";
import { getClientOrders } from "@/lib/order-store";
import {
  X,
  Download,
  RefreshCw,
  Search,
  Package,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Printer,
  Sparkles,
  Truck,
  CheckCircle2,
} from "lucide-react";

// Register AG Grid Community modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Glacier Dark Quartz Theme
const glacierGridTheme = themeQuartz.withParams({
  backgroundColor: "#091122",
  foregroundColor: "#e0e8f0",
  borderColor: "rgba(56, 189, 248, 0.2)",
  accentColor: "#38bdf8",
  headerBackgroundColor: "#0c1a32",
  rowHoverColor: "rgba(56, 189, 248, 0.08)",
});

interface OrderTrackingGridProps {
  isOpen: boolean;
  onClose: () => void;
  onViewBook?: (bookTitle: string) => void;
}

export default function OrderTrackingGrid({
  isOpen,
  onClose,
  onViewBook,
}: OrderTrackingGridProps) {
  const [orders, setOrders] = useState<PublishOrder[]>([]);
  const [quickFilterText, setQuickFilterText] = useState<string>("");
  const gridRef = useRef<AgGridReact<PublishOrder>>(null);
  const [gridApi, setGridApi] = useState<GridApi<PublishOrder> | null>(null);

  const reloadOrders = useCallback(() => {
    setOrders(getClientOrders());
  }, []);

  useEffect(() => {
    if (isOpen) {
      reloadOrders();
    }
  }, [isOpen, reloadOrders]);

  useEffect(() => {
    const handleUpdated = () => reloadOrders();
    window.addEventListener("orders_updated", handleUpdated);
    return () => window.removeEventListener("orders_updated", handleUpdated);
  }, [reloadOrders]);

  const onGridReady = useCallback((params: GridReadyEvent<PublishOrder>) => {
    setGridApi(params.api);
  }, []);

  const handleExportCsv = useCallback(() => {
    if (gridApi) {
      gridApi.exportDataAsCsv({
        fileName: `papertales-orders-${new Date().toISOString().slice(0, 10)}.csv`,
      });
    }
  }, [gridApi]);

  // Column definitions for AG Grid
  const columnDefs = useMemo<ColDef<PublishOrder>[]>(() => {
    return [
      {
        field: "id",
        headerName: "Order ID",
        width: 130,
        pinned: "left",
        cellRenderer: (params: ICellRendererParams<PublishOrder>) => {
          return (
            <span className="font-mono text-xs text-sky-300 font-bold bg-sky-950/60 px-2 py-0.5 rounded border border-sky-400/30">
              {params.value}
            </span>
          );
        },
      },
      {
        field: "createdAt",
        headerName: "Date",
        width: 120,
        valueFormatter: (params) => {
          if (!params.value) return "";
          try {
            return new Date(params.value).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
          } catch {
            return params.value;
          }
        },
      },
      {
        field: "bookTitle",
        headerName: "Book Title",
        minWidth: 200,
        flex: 1,
        cellRenderer: (params: ICellRendererParams<PublishOrder>) => {
          return (
            <div className="flex items-center gap-2">
              <span className="font-bold text-white truncate">{params.value}</span>
            </div>
          );
        },
      },
      {
        field: "characterName",
        headerName: "Character",
        width: 160,
        cellRenderer: (params: ICellRendererParams<PublishOrder>) => (
          <span className="text-slate-300 text-xs">{params.value}</span>
        ),
      },
      {
        field: "printRiskStatus",
        headerName: "POD Copyright Safety",
        width: 210,
        cellRenderer: (params: ICellRendererParams<PublishOrder>) => {
          const isSafe = params.value === "safe";
          return isSafe ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Print-Safe Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <AlertTriangle className="w-3 h-3 text-amber-400" /> User Custom Requested
            </span>
          );
        },
      },
      {
        field: "fulfillmentStatus",
        headerName: "Fulfillment Stage",
        width: 180,
        cellRenderer: (params: ICellRendererParams<PublishOrder>) => {
          const status = params.value;
          if (status === "shipped") {
            return (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                <Truck className="w-3 h-3 text-sky-400 animate-pulse" /> Shipped &bull; Tracked
              </span>
            );
          }
          if (status === "printing") {
            return (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30">
                <Printer className="w-3 h-3 text-purple-400" /> Printing at Lulu POD
              </span>
            );
          }
          if (status === "sent_to_lulu") {
            return (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                <Package className="w-3 h-3 text-amber-400" /> Dispatched to Factory
              </span>
            );
          }
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Proof Confirmed
            </span>
          );
        },
      },
      {
        field: "trackingNumber",
        headerName: "Tracking",
        width: 150,
        cellRenderer: (params: ICellRendererParams<PublishOrder>) => {
          const trackUrl = params.data?.trackingUrl;
          const number = params.value;
          if (!number) return <span className="text-slate-500 text-xs">Processing...</span>;
          return trackUrl ? (
            <a
              href={trackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-300 hover:text-white underline text-xs flex items-center gap-1 font-mono"
            >
              <ExternalLink className="w-3 h-3" /> Track
            </a>
          ) : (
            <span className="font-mono text-xs text-slate-300">{number}</span>
          );
        },
      },
      {
        field: "totalAmountUsd",
        headerName: "Total Paid",
        width: 110,
        valueFormatter: (params) => `$${Number(params.value || 0).toFixed(2)}`,
        cellClass: "font-semibold text-emerald-300",
      },
      {
        field: "paypalTxnId",
        headerName: "PayPal Txn",
        width: 180,
        cellRenderer: (params: ICellRendererParams<PublishOrder>) => (
          <span className="font-mono text-[11px] text-slate-400">
            {params.value || "PAYPAL_VAULT"}
          </span>
        ),
      },
    ];
  }, []);

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      sortable: true,
      filter: true,
      resizable: true,
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-6 animate-in fade-in">
      <div className="glacier-glass rounded-3xl border border-sky-400/35 p-5 sm:p-6 max-w-6xl w-full shadow-2xl flex flex-col space-y-4 max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-sky-400/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-400/20 text-sky-300 flex items-center justify-center border border-sky-400/30 shadow-md">
              <Package className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-xl font-black text-white tracking-tight">
                  Order &amp; Fulfillment Tracker
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  AG Grid Powered
                </span>
              </div>
              <p className="text-xs text-[#a0b4c4]">
                Track physical print-on-demand manufacturing, copyright verification, and carrier delivery
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search, Stats, Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {/* Quick Filter */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={quickFilterText}
              onChange={(e) => setQuickFilterText(e.target.value)}
              placeholder="Search by title, character, or order ID..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900/90 text-white placeholder-slate-400 rounded-xl border border-sky-400/30 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={reloadOrders}
              className="px-3 py-2 text-xs font-semibold rounded-xl glacier-glass-subtle hover:bg-slate-800 text-sky-200 border border-sky-400/30 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3.5 py-2 text-xs font-bold rounded-xl glacier-btn text-[#001f2e] flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* AG Grid Component */}
        <div className="w-full h-[400px] sm:h-[460px] rounded-2xl overflow-hidden border border-sky-400/25 shadow-inner">
          <AgGridReact<PublishOrder>
            ref={gridRef}
            theme={glacierGridTheme}
            rowData={orders}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            quickFilterText={quickFilterText}
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 20, 50]}
            onGridReady={onGridReady}
            rowHeight={48}
            headerHeight={44}
          />
        </div>

        {/* Footer info pill */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-[#a0b4c4] border-t border-sky-400/20 pt-3 gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Print-Safe Verified: Instant Lulu POD dispatch
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Custom Requested: Personal homage review queue
            </span>
          </div>
          <span className="text-slate-400">
            Total Orders: <strong className="text-white">{orders.length}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
