import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavigationBar from "@/components/NavigationBar";
import ClientLayout from "@/components/ClientLayout";
import CustomScrollArea from "@/components/CustomScrollArea";

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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen flex flex-col`}>
        <NavigationBar />
        <CustomScrollArea className="flex-1">
          <ClientLayout>
            {children}
          </ClientLayout>
        </CustomScrollArea>
      </body>
    </html>
  );
}

/*
the current cscs fixed the navbar at the top; if i dont want that, can use this:

    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <CustomScrollArea className="h-screen">
        <NavigationBar />
          <ClientLayout>
            {children}
          </ClientLayout>
        </CustomScrollArea>
      </body>
    </html>


*/