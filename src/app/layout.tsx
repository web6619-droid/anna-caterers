import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BookingModalProvider } from "@/context/BookingModalContext";
import { BookingProvider } from "@/context/BookingContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Anna Caterers | Luxury Wedding & Event Catering Services",
  description: "We Serve You The Real Happiness. Experience world-class culinary craftsmanship, authentic heirloom recipes, and luxurious event catering for weddings, galas, and celebrations.",
  keywords: "Anna Caterers, Kerala Catering, Luxury Catering, Wedding Catering, Event Management, Feast, Live Culinary Booths",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <BookingProvider>
          <BookingModalProvider>{children}</BookingModalProvider>
        </BookingProvider>
      </body>
    </html>
  );
}
