import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import Providers from "@/components/Providers";
import AuthRedirect from "@/components/AuthRedirect";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "JB Rewards",
  description: "Jakaas Bandey Cricket Team Peer Nominations & Leaderboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.className} h-full antialiased`}>
      <body
        style={{ background: "#0f0f10", color: "#ffffff", fontFamily: "'Nunito', sans-serif" }}
        className="min-h-full"
        suppressHydrationWarning
      >
        <AuthRedirect />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
