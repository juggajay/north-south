"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { OrderCard } from "./OrderCard";

export function OrderList() {
  // Real-time subscription - updates automatically when orders change
  const orders = useQuery(api.orders.listAll);

  if (orders === undefined) {
    return (
      <div className="p-8 text-center text-zinc-500">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4">Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-8 text-center text-zinc-500">
        <p className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
          No orders yet
        </p>
        <p className="mt-2 text-sm">
          Orders will appear here when customers place orders.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order: any) => (
        <OrderCard key={order._id} order={order} />
      ))}
    </div>
  );
}
