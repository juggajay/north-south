"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Download, FileText } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";

interface DocumentListProps {
  orderId: Id<"orders">;
}

export function DocumentList({ orderId }: DocumentListProps) {
  const documents = useQuery(api.documents.list, { orderId });

  const handleDownload = async (storageId: string, fileName: string) => {
    try {
      // Get download URL
      const url = await fetch(
        `/api/convex/getUrl?storageId=${storageId}`
      ).then((res) => res.json());

      if (!url) {
        toast.error("Failed to get download URL");
        return;
      }

      // Trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Downloading ${fileName}`);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download document");
    }
  };

  if (!documents) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-zinc-900"></div>
      </div>
    );
  }

  const hasDocuments =
    documents.quotes.length > 0 || documents.invoices.length > 0;

  if (!hasDocuments) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 mb-4">
          <FileText className="h-6 w-6 text-zinc-400" />
        </div>
        <p className="text-sm text-zinc-500">
          Documents will appear here once your quote is ready
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quotes section */}
      {documents.quotes.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-zinc-900 mb-3">Quotes</h3>
          <div className="space-y-2">
            {documents.quotes.map((doc) => (
              <button
                key={doc._id}
                onClick={() => handleDownload(doc.storageId, doc.fileName)}
                className="w-full flex items-center justify-between p-3 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100">
                    <FileText className="h-5 w-5 text-zinc-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-zinc-900">
                      {doc.fileName}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Version {doc.version} •{" "}
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Download className="h-5 w-5 text-zinc-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Invoices section */}
      {documents.invoices.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-zinc-900 mb-3">Invoices</h3>
          <div className="space-y-2">
            {documents.invoices.map((doc) => (
              <button
                key={doc._id}
                onClick={() => handleDownload(doc.storageId, doc.fileName)}
                className="w-full flex items-center justify-between p-3 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100">
                    <FileText className="h-5 w-5 text-zinc-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-zinc-900">
                      {doc.fileName}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Version {doc.version} •{" "}
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Download className="h-5 w-5 text-zinc-400" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
