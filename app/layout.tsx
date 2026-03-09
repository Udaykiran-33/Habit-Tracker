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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0a] text-[#f5f5f5]`}
      >
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#141414",
              color: "#f5f5f5",
              border: "1px solid #2a2a2a",
            },
            success: {
              iconTheme: { primary: "#6b8c3a", secondary: "#f5f5f5" },
            },
          }}
        />
      </body>
    </html>
  );
}
