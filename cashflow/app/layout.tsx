import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DashboardProvider } from "@/components/providers/dashboard-provider";
import { ScheduledCalendarProvider } from "@/contexts/scheduled-calendar-context";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CashFlow — Санхүүгийн хянах самбар",
  description:
    "Өөрийн орлого, зарлага, зээл, төлбөрийг нэг дороос удирдах орчин үеийн самбар.",
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#203040",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} antialiased min-h-screen`}>
        <DashboardProvider>
          <ScheduledCalendarProvider>{children}</ScheduledCalendarProvider>
        </DashboardProvider>
      </body>
    </html>
  );
}
