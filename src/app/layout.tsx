import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "MuseumAID — Евакуація музейних предметів",
  description:
    "AI-система підтримки рішень для евакуації музейних предметів під час воєнного стану",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" className="h-full">
      <body className="min-h-full flex flex-col bg-bg text-text">
        <ThemeProvider>
          <Navigation />
          <main
            className="flex-1 flex flex-col pb-14 lg:pb-0"
            role="main"
            aria-label="Основний вміст"
          >
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
