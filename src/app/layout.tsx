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
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-[#FFFDF9] text-[#1E2530] font-sans selection:bg-amber-100 selection:text-amber-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
