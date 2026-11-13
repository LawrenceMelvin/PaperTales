"use client";

import React, { useMemo, useState, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, ModuleRegistry, AllCommunityModule, themeQuartz } from "ag-grid-community";
import { PaperTalesOrder } from "@/types/order";
import {
  Download,
  Search,
  RefreshCw,
  Printer,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Package,
  Layers,
  ChevronRight,
  Filter,
} from "lucide-react";

// Register AG Grid Community modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Warm Sunlit Atelier Light Quartz Theme
const warmAtelierGridTheme = themeQuartz.withParams({
  backgroundColor: "#FFFFFF",
  foregroundColor: "#1E2530",
  borderColor: "#E8DFD3",
  accentColor: "#D97706",
  headerBackgroundColor: "#FAF6EE",
  rowHoverColor: "rgba(217, 119, 6, 0.06)",
});

interface OrdersDataGridProps {
  orders: PaperTalesOrder[];
  onRefresh?: () => void;
  onUpdateOrder?: (updatedOrder: PaperTalesOrder) => void;
}

export default function OrdersDataGrid({ orders: initialOrders, onRefresh, onUpdateOrder }: OrdersDataGridProps) {
  const gridRef = useRef<AgGridReact>(null);
  const [orders, setOrders] = useState<PaperTalesOrder[]>(initialOrders);
  const [quickFilterText, setQuickFilterText] = useState("");
  const [copilotQuery, setCopilotQuery] = useState("");
  const [activeFilterPill, setActiveFilterPill] = useState<string>("all");

  // Keep local state in sync if parent updates orders
  React.useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  const handleAdvanceStage = (orderId: string) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        let nextStatus: PaperTalesOrder["status"] = "in_production";
        if (o.status === "paid") nextStatus = "in_production";
        else if (o.status === "in_production") nextStatus = "shipped";
        else if (o.status === "shipped") nextStatus = "delivered";
        else nextStatus = "paid";

        const modified: PaperTalesOrder = {
          ...o,
          status: nextStatus,
          updatedAt: new Date().toISOString(),
          luluTrackingNumber:
            nextStatus === "shipped" || nextStatus === "delivered"
              ? o.luluTrackingNumber || `1Z999AA101${Math.floor(10000000 + Math.random() * 90000000)}`
              : o.luluTrackingNumber,
        };

        if (onUpdateOrder) onUpdateOrder(modified);
        return modified;
      }
      return o;
    });

    setOrders(updated);
  };

  const handlePillClick = (filterType: string) => {
    setActiveFilterPill(filterType);
    if (filterType === "all") {
      setQuickFilterText("");
    } else if (filterType === "physical") {
      setQuickFilterText("physical_print");
    } else if (filterType === "digital") {
      setQuickFilterText("digital_pdf");
    } else if (filterType === "production") {
      setQuickFilterText("in_production");
    } else if (filterType === "high_margin") {
      setQuickFilterText("62%");
    } else if (filterType === "channel3") {
      setQuickFilterText("Channel3");
    }
  };

  const handleCopilotSubmit = (query: string) => {
    const q = query.toLowerCase().trim();
    if (q.includes("margin") || q.includes("profit") || q.includes("62")) {
      handlePillClick("high_margin");
    } else if (q.includes("physical") || q.includes("lulu") || q.includes("print") || q.includes("pod")) {
      handlePillClick("physical");
    } else if (q.includes("pdf") || q.includes("digital")) {
      handlePillClick("digital");
    } else if (q.includes("produce") || q.includes("production") || q.includes("factory")) {
      handlePillClick("production");
    } else if (q.includes("channel3") || q.includes("bundle") || q.includes("art kit") || q.includes("supplies")) {
      handlePillClick("channel3");
    } else {
      setQuickFilterText(query);
    }
  };

  const columnDefs = useMemo<ColDef<PaperTalesOrder>[]>(
    () => [
      {
        field: "id",
        headerName: "Order ID",
        width: 130,
        pinned: "left",
        cellRenderer: (params: any) => (
          <span className="font-mono text-xs font-bold text-amber-700">{params.value}</span>
        ),
      },
      {
        field: "bookTitle",
        headerName: "Book Project",
        flex: 1.4,
        minWidth: 190,
        cellRenderer: (params: any) => (
          <div>
            <div className="font-semibold text-[#1E2530] text-xs truncate">{params.value}</div>
            <div className="text-[10px] text-slate-500">
              {params.data?.authorName} &bull; {params.data?.pageCount || 6} pgs
            </div>
          </div>
        ),
      },
      {
        field: "fulfillmentType",
        headerName: "Fulfillment",
        width: 135,
        cellRenderer: (params: any) => {
          const isPhysical = params.value === "physical_print";
          return (
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                isPhysical
                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                  : "bg-purple-100 text-purple-900 border border-purple-300"
              }`}
            >
              {isPhysical ? "Lulu Softcover" : "Digital PDF"}
            </span>
          );
        },
      },
      {
        field: "status",
        headerName: "Lulu POD Status",
        width: 145,
        cellRenderer: (params: any) => {
          const status = params.value;
          let badgeStyle = "bg-slate-100 text-slate-600 border-slate-200";
          let label = status;

          if (status === "paid") {
            badgeStyle = "bg-sky-50 text-sky-800 border-sky-200";
            label = "Paid";
          } else if (status === "in_production") {
            badgeStyle = "bg-amber-50 text-amber-800 border-amber-300";
            label = "In Production";
          } else if (status === "shipped") {
            badgeStyle = "bg-emerald-50 text-emerald-800 border-emerald-300";
            label = "Shipped";
          } else if (status === "delivered") {
            badgeStyle = "bg-teal-50 text-teal-800 border-teal-300";
            label = "Delivered";
          }

          return (
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badgeStyle}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {label}
            </span>
          );
        },
      },
      {
        headerName: "Unit COGS",
        width: 105,
        valueGetter: (params: any) => {
          const pgs = params.data?.pageCount || 6;
          return `$${(pgs * 0.065).toFixed(2)}`;
        },
        cellRenderer: (params: any) => (
          <span className="font-mono text-xs text-slate-700">{params.value}</span>
        ),
      },
      {
        headerName: "Net Margin",
        width: 110,
        valueGetter: (params: any) => {
          const fee = params.data?.creationFee || 3.5;
          const pgs = params.data?.pageCount || 6;
          const cogs = pgs * 0.065;
          const profit = fee - cogs;
          const margin = Math.round((profit / fee) * 100);
          return `${margin}%`;
        },
        cellRenderer: (params: any) => (
          <span className="font-mono text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
            {params.value}
          </span>
        ),
      },
      {
        headerName: "Channel3 Bundle",
        width: 140,
        valueGetter: (params: any) => {
          return params.data?.companionItem ? "Channel3 Bundled" : "—";
        },
        cellRenderer: (params: any) => {
          const item = params.data?.companionItem;
          if (!item) return <span className="text-slate-400 text-xs">—</span>;
          return (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-300 truncate block max-w-[125px]"
              title={`${item.title} ($ ${item.price.toFixed(2)})`}
            >
              🛒 {item.title}
            </span>
          );
        },
      },
      {
        field: "totalAmount",
        headerName: "Gross (USD)",
        width: 110,
        cellRenderer: (params: any) => (
          <span className="font-mono text-xs font-bold text-[#1E2530]">
            ${params.value?.toFixed(2)}
          </span>
        ),
      },
      {
        headerName: "Simulation Stage",
        width: 140,
        pinned: "right",
        cellRenderer: (params: any) => {
          const order = params.data;
          if (!order) return null;
          return (
            <button
              type="button"
              onClick={() => handleAdvanceStage(order.id)}
              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-2xs"
              title="Advance order through Lulu POD factory stages"
            >
              <span>Advance</span>
              <ChevronRight className="w-3 h-3 text-amber-700" />
            </button>
          );
        },
      },
    ],
    [orders]
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
    <div className="flex flex-col gap-3.5 w-full">
      {/* AI Grid Copilot Natural Language Bar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#E8DFD3] shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-200">
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-[#1E2530]">
                AG Grid AI Operations Copilot
              </h4>
              <p className="text-[11px] text-slate-500">
                Natural-language filtering, unit economics (62% target margin), and Lulu POD orchestration
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
            AG Grid React 36.2
          </span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (copilotQuery.trim()) {
              handleCopilotSubmit(copilotQuery);
            }
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-amber-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Ask Copilot: 'Show orders with margin >= 60%', 'Filter Lulu in production', 'Channel3 add-ons'..."
              value={copilotQuery}
              onChange={(e) => {
                setCopilotQuery(e.target.value);
                setQuickFilterText(e.target.value);
              }}
              className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-[#FAF6EE] border border-[#E8DFD3] text-[#1E2530] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-all cursor-pointer shrink-0"
          >
            Filter
          </button>
        </form>

        {/* Quick Filter KPI Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Quick Views:
          </span>
          {[
            { id: "all", label: "All Orders" },
            { id: "physical", label: "Physical Lulu POD" },
            { id: "digital", label: "Digital PDF" },
            { id: "high_margin", label: "High Margin (62%)" },
            { id: "production", label: "In Production" },
            { id: "channel3", label: "Channel3 Bundled" },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => handlePillClick(pill.id)}
              className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                activeFilterPill === pill.id
                  ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                  : "bg-white text-slate-600 border-[#E8DFD3] hover:border-amber-300"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Action Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="text-xs text-slate-600">
          Showing <strong className="text-[#1E2530]">{orders.length}</strong> live enterprise operations
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[#E8DFD3] hover:border-amber-400 text-[#1E2530] flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          )}
          <button
            type="button"
            onClick={onExportCsv}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* AG Grid React Viewport */}
      <div className="w-full h-[520px] rounded-2xl overflow-hidden border border-[#E8DFD3] shadow-md bg-white">
        <AgGridReact
          ref={gridRef}
          theme={warmAtelierGridTheme}
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

      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>Real-time sync with PayPal Webhooks, Lulu Print Queues &amp; Channel3 Agentic Commerce</span>
        </div>
        <span>Enterprise Edition &bull; <strong className="text-[#1E2530]">AG Grid Quartz</strong></span>
      </div>
    </div>
  );
}
