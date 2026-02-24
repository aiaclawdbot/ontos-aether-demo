import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  icons: {
    icon: '/icon.svg',
  },
  title: "Ontos × SentimenTrader — Compiled Reasoning for 3,100 Indicators",
  description: "See how Ontos' compiled ontology engine detects cross-asset regime shifts across SentimenTrader's 3,100 indicators — in 0.42ms. Interactive demo.",
  openGraph: {
    title: "Ontos × SentimenTrader — Compiled Reasoning Demo",
    description: "3,100 indicators. 28,400 relationships. 847 rules. Sub-millisecond cross-asset detection. Interactive demo of the .onto engine.",
    type: "website",
    siteName: "Ontos",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ontos × SentimenTrader — Compiled Reasoning Demo",
    description: "3,100 indicators. 28,400 relationships. 847 rules. Sub-millisecond cross-asset detection.",
  },
  metadataBase: new URL("https://ontos-aether-demo.vercel.app"),
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
