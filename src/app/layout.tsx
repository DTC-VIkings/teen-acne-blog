import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "./SiteChrome";
import { ConvergePixel } from "./ConvergePixel";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Teen Acne Solutions | Evidence-Based Skincare Tips",
  description:
    "Medically reviewed tips and advice for moms and teens dealing with acne. Evidence-based skincare routines, product recommendations, and lifestyle tips.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>
        <ConvergePixel />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
