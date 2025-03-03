import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavigationBar from "@/components/NavigationBar";
// import ClientLayout from "@/components/ClientLayout";
import CustomScrollArea from "@/components/CustomScrollArea";
import { Toaster } from "react-hot-toast";

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
          {/* <ClientLayout> */}
            {children}
          {/* </ClientLayout> */}
        </CustomScrollArea>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#2f2f2f",
              color: "#ffffff",
              fontFamily: "inherit",
            },
          }}
          containerStyle={{
            position: "fixed",
            zIndex: 51,
          }}
        />
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