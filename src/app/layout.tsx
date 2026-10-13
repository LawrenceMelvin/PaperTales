import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "PaperTales AI - Personalized Co-Creation Publishing Studio",
  description:
    "Co-create custom coloring and storybooks with AI. Instant 300 DPI PDF downloads and physical softcover printing delivered via Lulu and PayPal.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/favicon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen flex flex-col bg-[#0a0e1a] text-[#e0e8f0]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
