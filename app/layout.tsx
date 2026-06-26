import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import { Toaster } from "../components/Toaster";
import { MQTTProvider } from "../components/MQTTProvider";
import DashboardLayoutClient from "../components/DashboardLayoutClient";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmartPlantCare Dashboard - IoT Irrigation Control",
  description: "Monitor and control your smart plant watering system in real-time with MQTT integration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="bg-background text-text-primary transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <MQTTProvider>
            <DashboardLayoutClient>
              {children}
            </DashboardLayoutClient>
            <Toaster />
          </MQTTProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
