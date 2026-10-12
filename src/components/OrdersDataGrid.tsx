"use client";

import React, { useMemo, useState, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, ModuleRegistry, AllCommunityModule, themeQuartz } from "ag-grid-community";
import { PaperTalesOrder } from "@/types/order";
import { Download, Search, RefreshCw, Printer, ExternalLink, ShieldCheck } from "lucide-react";

// Register AG Grid Community modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Glacier Dark Quartz Theme
const glacierGridTheme = themeQuartz.withParams({
  backgroundColor: "#0f1524",
  foregroundColor: "#e0e8f0",
  borderColor: "rgba(125, 211, 252, 0.16)",
  accentColor: "#7dd3fc",
  headerBackgroundColor: "#141c2e",
  rowHoverColor: "rgba(125, 211, 252, 0.06)",
});

interface OrdersDataGridProps {
  orders: PaperTalesOrder[];
  onRefresh?: () => void;
}

export default function OrdersDataGrid({ orders, onRefresh }: OrdersDataGridProps) {
  const gridRef = useRef<AgGridReact>(null);
  const [quickFilterText, setQuickFilterText] = useState("");

  const columnDefs = useMemo<ColDef<PaperTalesOrder>[]>(
    () => [
      {
        field: "id",
        headerName: "Order ID",
        width: 140,
        pinned: "left",
        cellRenderer: (params: any) => (
          <span className="font-mono text-xs font-bold text-sky-300">{params.value}</span>
        ),
      },
      {
        field: "bookTitle",
        headerName: "Book Project",
        flex: 1.5,
        minWidth: 200,
        cellRenderer: (params: any) => (
          <div>
            <div className="font-semibold text-white text-xs">{params.value}</div>
            <div className="text-[10px] text-[#a0b4c4]">
              By {params.data?.authorName} &bull; {params.data?.pageCount} pages
            </div>
          </div>
        ),
      },
      {
        field: "fulfillmentType",
        headerName: "Fulfillment",
        width: 140,
        cellRenderer: (params: any) => {
          const isPhysical = params.value === "physical_print";
          return (
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                isPhysical
                  ? "bg-sky-400/15 text-sky-300 border border-sky-400/30"
                  : "bg-purple-400/15 text-purple-300 border border-purple-400/30"
              }`}
            >
              {isPhysical ? "Lulu Softcover" : "Digital PDF"}
            </span>
          );
        },
      },
      {
        field: "status",
        headerName: "Status",
        width: 150,
        cellRenderer: (params: any) => {
          const status = params.value;
          let badgeStyle = "bg-slate-800 text-slate-300 border-slate-700";
          let label = status;

          if (status === "paid") {
            badgeStyle = "bg-sky-400/15 text-sky-300 border-sky-400/30";
            label = "Paid (Pending)";
          } else if (status === "in_production") {
            badgeStyle = "bg-cyan-500/15 text-cyan-300 border-cyan-400/30";
            label = "In Production";
          } else if (status === "shipped") {
            badgeStyle = "bg-emerald-500/15 text-emerald-300 border-emerald-400/30";
            label = "Shipped";
          } else if (status === "delivered") {
            badgeStyle = "bg-teal-500/15 text-teal-300 border-teal-400/30";
            label = "Delivered";
          }

          return (
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${badgeStyle}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {label}
            </span>
          );
        },
      },
      {
        field: "totalAmount",
        headerName: "Amount",
        width: 110,
        cellRenderer: (params: any) => (
          <span className="font-mono text-xs font-bold text-white">
            ${params.value?.toFixed(2)} {params.data?.currency}
          </span>
        ),
      },
      {
        field: "paypalOrderId",
        headerName: "PayPal Order",
        width: 170,
        cellRenderer: (params: any) => (
          <span className="font-mono text-[11px] text-[#a0b4c4]">
            {params.value || "—"}
          </span>
        ),
      },
      {
        field: "luluJobId",
        headerName: "Lulu Job ID",
        width: 140,
        cellRenderer: (params: any) => (
          <span className="font-mono text-[11px] text-sky-300">
            {params.value || "—"}
          </span>
        ),
      },
      {
        field: "luluTrackingNumber",
        headerName: "Tracking #",
        width: 180,
        cellRenderer: (params: any) => {
          if (!params.value) return <span className="text-slate-600 text-xs">—</span>;
          return (
            <div className="flex items-center gap-1 text-xs text-sky-400 hover:text-white cursor-pointer font-mono">
              <span>{params.value.slice(0, 12)}...</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          );
        },
      },
      {
        field: "createdAt",
        headerName: "Created",
        width: 130,
        cellRenderer: (params: any) => {
          if (!params.value) return "";
          const d = new Date(params.value);
          return (
            <span className="text-xs text-[#a0b4c4]">
              {d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
          );
        },
      },
    ],
    []
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
    }),
    []
  );

  const onExportCsv = () => {
    gridRef.current?.api.exportDataAsCsv({
      fileName: `papertales-orders-${new Date().toISOString().slice(0, 10)}.csv`,
    });
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Quick Filter Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-[#a0b4c4] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search orders, titles, authors..."
            value={quickFilterText}
            onChange={(e) => setQuickFilterText(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-slate-900/80 border border-sky-400/20 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg glacier-glass-subtle border border-sky-400/20 hover:border-sky-400/40 text-sky-300 flex items-center gap-1.5 transition-all shadow-sm"
              title="Refresh Grid"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          )}

          <button
            onClick={onExportCsv}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg glacier-btn text-[#001f2e] flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* AG Grid React Viewport */}
      <div className="w-full h-[520px] rounded-xl overflow-hidden border border-sky-400/20 shadow-xl">
        <AgGridReact
          ref={gridRef}
          theme={glacierGridTheme}
          rowData={orders}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          quickFilterText={quickFilterText}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 20, 50]}
          rowHeight={52}
          headerHeight={44}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#a0b4c4] px-1">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-sky-400" />
          <span>Real-time sync with PayPal Webhooks &amp; Lulu Manufacturing Queue</span>
        </div>
        <span>Powered by <strong className="text-white">AG Grid React</strong></span>
      </div>
    </div>
  );
}
