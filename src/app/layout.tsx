import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shiv Furniture Works — Mini ERP",
  description:
    "Centralized ERP for product management, inventory, sales, procurement, manufacturing, and business intelligence.",
  keywords: [
    "ERP",
    "Inventory",
    "Manufacturing",
    "Sales",
    "Procurement",
    "Furniture",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
          <TooltipProvider delay={200}>
            {children}
          </TooltipProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
