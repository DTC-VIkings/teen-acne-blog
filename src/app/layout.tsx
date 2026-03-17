import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Teen Acne Solutions | Evidence-Based Skincare Tips",
  description:
    "Medically reviewed tips and advice for moms and teens dealing with acne. Evidence-based skincare routines, product recommendations, and lifestyle tips.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>
        {/* Header */}
        <header className="sticky top-0 z-50 bg-black">
          <nav className="max-w-[1100px] mx-auto px-5 md:px-[55px] h-[56px] md:h-[74px] flex items-center justify-between">
            <Link href="/" className="text-white font-bold text-lg md:text-xl tracking-tight">
              Teen Acne Solutions
            </Link>
            <div className="flex items-center gap-5 md:gap-6">
              <Link
                href="/"
                className="text-[15px] font-medium text-gray-300 hover:text-white transition-colors"
              >
                Articles
              </Link>
              <Link
                href="/about"
                className="text-[15px] font-medium text-gray-300 hover:text-white transition-colors"
              >
                About
              </Link>
              <Link
                href="/about"
                className="hidden md:inline-flex bg-[#02838d] hover:bg-[#08565c] text-white text-[15px] font-bold px-6 py-2.5 rounded-full transition-colors"
              >
                Learn More
              </Link>
            </div>
          </nav>
        </header>

        {/* Main content */}
        <main>{children}</main>

        {/* Footer */}
        <footer className="bg-black mt-20">
          <div className="max-w-[1100px] mx-auto px-5 md:px-[55px] py-10 md:py-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p className="text-white font-bold text-lg mb-2">
                  Teen Acne Solutions
                </p>
                <p className="text-[#dcdbdb] text-sm">
                  Evidence-based skincare advice for teens and parents.
                </p>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                <Link
                  href="/"
                  className="text-[#dcdbdb] hover:text-[#02838d] font-semibold transition-colors"
                >
                  Articles
                </Link>
                <span className="text-gray-600">|</span>
                <Link
                  href="/about"
                  className="text-[#dcdbdb] hover:text-[#02838d] font-semibold transition-colors"
                >
                  About
                </Link>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8">
              <p className="text-[#767474] text-xs leading-5">
                The content on this site is for informational purposes only and
                is not a substitute for professional medical advice, diagnosis,
                or treatment. Always seek the advice of a qualified healthcare
                provider. &copy; {new Date().getFullYear()} Teen Acne Solutions.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
