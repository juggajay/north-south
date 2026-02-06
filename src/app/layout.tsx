import type { Metadata, Viewport } from "next";
import { Inter, Cardo } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { ConvexClientProvider } from "@/lib/convex";
import { QueryProvider } from "@/lib/query-client";
import { ProductCatalogProvider } from "@/contexts/ProductCatalogContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cardo = Cardo({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "North South Carpentry",
  description: "Design your dream kitchen, laundry, vanity or wardrobe",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NSC",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${cardo.variable} font-sans antialiased`}>
        <ConvexClientProvider>
          <QueryProvider>
            <ProductCatalogProvider>{children}</ProductCatalogProvider>
          </QueryProvider>
        </ConvexClientProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
