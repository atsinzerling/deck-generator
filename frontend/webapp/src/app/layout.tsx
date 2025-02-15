import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Deck Generator",
  description: "Deck Generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <nav className="bg-gray-800 p-4">
          <div className="container mx-auto flex justify-between">
            <Link href="/dashboard" className="text-white text-lg font-semibold">
              Deck Manager
            </Link>
            <div>
              <Link href="/dashboard" className="text-gray-300 hover:text-white mx-2">
                Dashboard
              </Link>
              <Link href="/decks/new" className="text-gray-300 hover:text-white mx-2">
                New Deck
              </Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
