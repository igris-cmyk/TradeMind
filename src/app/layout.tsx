import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "sonner";
import { SessionProvider } from "@/providers/session-provider";
import { QueryProvider } from "@/providers/query-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AriaLiveRegion } from "@/components/shared/aria-live-region";
import "./globals.css";

export const metadata: Metadata = {
  title: "TradeMind AI Journal | AI-Powered Trading Journal",
  description:
    "The AI-powered trading journal and performance coach for retail traders. Log trades, analyse performance, detect mistakes, and improve your trading psychology.",
  keywords: ["trading journal", "AI trading", "forex journal", "trading psychology", "prop firm journal"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <SessionProvider>
          <QueryProvider>
            <TooltipProvider delayDuration={200}>
            <AriaLiveRegion />
            {children}
            <Toaster
              theme="dark"
              position="top-right"
              richColors
              closeButton
              toastOptions={{
                style: {
                  background: "rgba(15, 17, 25, 0.92)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  color: "#FAFAFA",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
                },
              }}
            />
            </TooltipProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
