import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FIRE Calculator - Plan Your Financial Independence",
  description: "Calculate your path to Financial Independence and Early Retirement.",
  keywords: [
    "FIRE calculator",
    "financial independence",
    "retire early",
    "investment growth",
    "retirement planning",
  ],
  metadataBase: new URL("https://firecalc.borloz.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "FIRE Calculator - Plan Your Financial Independence",
    description: "Calculate your path to Financial Independence and Early Retirement.",
    url: "https://firecalc.borloz.com/",
    siteName: "FIRE Calculator",
    images: [
      {
        url: "/og.svg",
        width: 1200,
        height: 630,
        alt: "FIRE Calculator preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FIRE Calculator - Plan Your Financial Independence",
    description: "Calculate your path to Financial Independence and Early Retirement.",
    images: ["/og.svg"],
  },
  icons: {
    icon: "/android-chrome-192x192.svg",
    apple: "/apple-touch-icon.svg",
  },
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
