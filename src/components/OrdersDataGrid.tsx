"use client";

import React, { useMemo, useState, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, ModuleRegistry } from "ag-grid-community";
import { AllCommunityModule } from "ag-grid-community";
import { PaperTalesOrder } from "@/types/order";
import { Download, Search, RefreshCw, Printer, ExternalLink, ShieldCheck } from "lucide-react";

// Register AG Grid Community modules
ModuleRegistry.registerModules([AllCommunityModule]);

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
          <span className="font-mono text-xs font-bold text-blue-700">{params.value}</span>
        ),
      },
      {
        field: "bookTitle",
        headerName: "Book Project",
        flex: 1.5,
        minWidth: 200,
        cellRenderer: (params: any) => (
          <div>
            <div className="font-semibold text-slate-900 text-xs">{params.value}</div>
            <div className="text-[10px] text-slate-500">By {params.data?.authorName} &bull; {params.data?.pageCount} pages</div>
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
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                isPhysical ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}
            >
              {isPhysical ? "Lulu Softcover" : "Digital PDF"}
            </span>
          );
        },
      },
      {
        field: "status",
        headerName: "Production Status",
        width: 150,
        cellRenderer: (params: any) => {
          const status = params.value;
          let badgeColor = "bg-slate-100 text-slate-700";
          let label = "Pending";

          if (status === "in_production") {
            badgeColor = "bg-blue-100 text-blue-800 animate-pulse";
            label = "Lulu Printing";
          } else if (status === "paid") {
            badgeColor = "bg-emerald-100 text-emerald-800";
            label = "Paid & Ready";
          } else if (status === "shipped") {
            badgeColor = "bg-purple-100 text-purple-800";
            label = "In Transit";
          }

          return (
            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${badgeColor}`}>
              {label}
            </span>
          );
        },
      },
      {
        field: "luluJobId",
        headerName: "Lulu Job ID",
        width: 140,
        cellRenderer: (params: any) =>
          params.value ? (
            <span className="font-mono text-xs font-semibold text-slate-800">{params.value}</span>
          ) : (
            <span className="text-slate-400 text-xs italic">N/A (Digital)</span>
          ),
      },
      {
        field: "luluTrackingNumber",
        headerName: "Carrier Tracking",
        width: 180,
        cellRenderer: (params: any) =>
          params.value ? (
            <a
              href={`https://www.google.com/search?q=${params.value}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-mono text-xs text-blue-600 hover:underline"
            >
              {params.value.slice(0, 14)}...
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <span className="text-slate-400 text-xs italic">Instant Delivery</span>
          ),
      },
      {
        field: "totalAmount",
        headerName: "Paid (USD)",
        width: 120,
        cellRenderer: (params: any) => (
          <span className="font-mono text-xs font-bold text-slate-900">${Number(params.value).toFixed(2)}</span>
        ),
      },
      {
        field: "paypalCaptureId",
        headerName: "PayPal Capture ID",
        width: 160,
        cellRenderer: (params: any) => (
          <span className="font-mono text-[11px] text-slate-600">{params.value || "PAYPAL-TEST"}</span>
        ),
      },
      {
        field: "createdAt",
        headerName: "Timestamp",
        width: 150,
        cellRenderer: (params: any) => (
          <span className="text-xs text-slate-500">
            {params.value ? new Date(params.value).toLocaleDateString() : "Today"}
          </span>
        ),
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
      fileName: `papertales_orders_${Date.now()}.csv`,
    });
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Search and Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search orders, tracking, titles..."
            value={quickFilterText}
            onChange={(e) => setQuickFilterText(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1.5 text-xs rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 flex items-center gap-1"
              title="Refresh order statuses"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onExportCsv}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export CSV
          </button>
        </div>
      </div>

      {/* AG Grid React Viewport */}
      <div className="ag-theme-quartz w-full h-[520px] rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        <AgGridReact
          ref={gridRef}
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
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Real-time sync with PayPal Webhooks &amp; Lulu Manufacturing Queue</span>
        </div>
        <span>Powered by <strong>AG Grid React</strong></span>
      </div>
    </div>
  );
}
