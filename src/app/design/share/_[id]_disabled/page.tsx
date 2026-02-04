/**
 * Shareable Design View Page
 * Phase 04-08: Undo/Redo & Shareable Links
 *
 * Read-only view of a design with "Save a Copy" option.
 * Deep link format: /design/share/{designId}
 */

import dynamic from 'next/dynamic';

const ShareDesignClient = dynamic(() => import('./ShareDesignClient'));

interface SharePageProps {
  params: {
    id: string;
  };
}

// Required for static export
export async function generateStaticParams() {
  return [];
}

export default function ShareDesignPage({ params }: SharePageProps) {
  return <ShareDesignClient designId={params.id} />;
}
