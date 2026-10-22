import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PwaProvider } from "@/components/pwa/PwaProvider";

const sansFont = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NPTEL Quiz Platform — Conservation Economics",
  description: "A zero-database, statically generated quiz and exam preparation app for NPTEL Conservation Economics.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/icons/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NPTEL Quiz",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6f4" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0c0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sansFont.variable} ${monoFont.variable}`}>
      <body className="antialiased min-h-[100dvh] flex flex-col bg-ground text-ink selection:bg-data/20">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <PwaProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-3 focus:py-2 focus:bg-ink focus:text-ground focus:rounded-control focus:shadow-md focus:text-xs focus:font-mono focus:outline-none focus:ring-2 focus:ring-data"
            >
              Skip to main content
            </a>
            <Navbar />
            <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col focus:outline-none">
              {children}
            </main>
            <Footer />
          </PwaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
