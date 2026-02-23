// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DashboardProvider } from "@/components/providers/dashboard-provider";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CashFlow - Wealth Pro Dashboard",
  description: "Modern financial dashboard for managing your wealth",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} antialiased min-h-screen`}>
        <DashboardProvider>
          {children}
        </DashboardProvider>
      </body>
    </html>
  );
}
