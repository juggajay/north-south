/**
 * Design Edit Page with Auto-save
 * Phase 04-08: Undo/Redo & Shareable Links
 *
 * Loads a saved design from Convex and renders the 3D configurator
 * with auto-save on every change.
 */

import dynamic from 'next/dynamic';

const DesignEditClient = dynamic(() => import('./DesignEditClient'));

interface DesignPageProps {
  params: {
    id: string;
  };
}

// Required for static export
export async function generateStaticParams() {
  return [];
}

export default function DesignPage({ params }: DesignPageProps) {
  return <DesignEditClient designId={params.id} />;
}
