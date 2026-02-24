import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ontos × SentimenTrader — Indicator Intelligence Demo",
  description: "What 3,000+ proprietary indicators become with a formal ontology runtime.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body style={{ background: '#0A0E17', color: '#F9FAFB', fontFamily: 'Inter, sans-serif', margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
