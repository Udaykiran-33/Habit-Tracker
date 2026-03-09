import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
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
  title: "UrHabit — Discipline Tracker",
  description:
    "Build discipline through consistent habit tracking, streaks, and AI insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#111111] text-[#FAF6F0]`}
      >
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1A1A1A",
              color: "#FAF6F0",
              border: "1px solid #2D2D2A",
            },
            success: {
              iconTheme: { primary: "#6b8c3a", secondary: "#FAF6F0" },
            },
          }}
        />
      </body>
    </html>
  );
}
