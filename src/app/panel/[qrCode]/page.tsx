import { PanelLookup } from "@/components/portal/PanelLookup";

interface PageProps {
  params: { qrCode: string };
}

/**
 * Static export: Generate dummy page for build
 * Actual QR codes handled by client-side routing
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  // Return dummy param to satisfy static export
  // Real QR codes will be resolved client-side
  return [{ qrCode: '__placeholder__' }];
}

export default function PanelLookupPage({ params }: PageProps) {
  const qrCode = decodeURIComponent(params.qrCode);

  return <PanelLookup qrCode={qrCode} />;
}
