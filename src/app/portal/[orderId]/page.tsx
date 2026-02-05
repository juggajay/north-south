import { OrderDetail } from "@/components/portal/OrderDetail";

interface PageProps {
  params: { orderId: string };
}

/**
 * Static export: Generate dummy page for build
 * Actual order IDs handled by client-side routing
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  // Return dummy param to satisfy static export
  // Real order IDs will be resolved client-side
  return [{ orderId: '__placeholder__' }];
}

export default function OrderDetailPage({ params }: PageProps) {
  return <OrderDetail orderId={params.orderId} />;
}
