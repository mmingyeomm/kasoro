import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SolanaWalletProvider } from "@/components/SolanaWalletProvider";
import { Geist, Geist_Mono, Silkscreen, Poppins, Quicksand } from "next/font/google";
import "./globals.css";
import localFont from "next/font/local";

const fbpung = localFont({
  src:"../../public/fonts/FB-pung-pop-M.ttf",
  display: "swap",
  variable: "--font-fbpung"
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const silkscreen = Silkscreen({
  weight: "400",
  variable: "--font-silkscreen",
  subsets: ["latin"],
});

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  subsets: ["latin"],
  display: "swap",
});

const quicksand = Quicksand({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-quicksand",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kasoro | First CommuniFi on Solana",
  description: "The cutest community-driven platform for content creators and community builders on Solana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${silkscreen.variable} ${poppins.variable} ${quicksand.variable} antialiased`}
      >
        <SolanaWalletProvider>
          {children}
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
