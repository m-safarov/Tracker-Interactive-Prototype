import type { Metadata } from "next";
import type { ReactNode } from "react";

import TopBar from "@/components/top-bar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tracker",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <TopBar />
        {children}
      </body>
    </html>
  );
}
