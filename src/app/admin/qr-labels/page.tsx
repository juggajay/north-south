"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { QRLabelSheet, printStyles } from "@/lib/qr";
import { transformOrderToSpec } from "@/lib/pdf/transformOrderToSpec";
import { Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminGuard } from "@/components/auth/AdminGuard";

function QRLabelsContent() {
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get("id");
  const orderId = orderIdParam as Id<"orders"> | null;

  const order = useQuery(
    api.orders.get,
    orderId ? { id: orderId } : "skip"
  );

  // Add print styles to document
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = printStyles;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-500">No order ID provided</p>
      </div>
    );
  }

  if (order === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (order === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-500">Order not found</p>
      </div>
    );
  }

  // Transform order to get panel data
  const specData = transformOrderToSpec(order);
  const panelLabels = specData.panels.map((panel) => ({
    panelId: panel.id,
    cabinetRef: panel.cabinetRef,
    dimensions: `${panel.width} x ${panel.height} x ${panel.thickness}mm`,
    material: panel.material,
  }));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Print button - hidden when printing */}
      <div className="print:hidden fixed top-4 right-4 z-10">
        <Button onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print Labels
        </Button>
      </div>

      {/* Page header - hidden when printing */}
      <div className="print:hidden p-6 border-b">
        <h1 className="text-xl font-bold">QR Labels - {order.orderNumber}</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {panelLabels.length} panels
        </p>
      </div>

      {/* QR Label Sheet */}
      <QRLabelSheet
        orderId={order._id}
        orderNumber={order.orderNumber}
        panels={panelLabels}
      />
    </div>
  );
}

export default function QRLabelsPage() {
  return (
    <AdminGuard>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          </div>
        }
      >
        <QRLabelsContent />
      </Suspense>
    </AdminGuard>
  );
}
