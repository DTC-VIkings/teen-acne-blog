import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Image from "next/image";
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

const categories = [
  { name: "Guides", slug: "guides" },
  { name: "Acne Treatments", slug: "acne-treatments" },
  { name: "Dealing with Acne", slug: "dealing-with-acne" },
  { name: "Types of Acne", slug: "types-of-acne" },
  { name: "Parents", slug: "parents" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>
        {/* Header */}
        <header className="sticky top-0 z-50">
          {/* Main nav */}
          <div className="bg-black">
            <nav className="max-w-[1100px] mx-auto px-5 md:px-[55px] h-[56px] md:h-[64px] flex items-center justify-between">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.svg"
                  alt="Teen Acne Solutions"
                  width={220}
                  height={40}
                  className="h-9 md:h-10 w-auto"
                  priority
                />
              </Link>
              <div className="flex items-center gap-5 md:gap-6">
                <Link
                  href="/about"
                  className="text-[14px] font-medium text-gray-300 hover:text-white transition-colors hidden sm:inline"
                >
                  About
                </Link>
                <Link
                  href="/about"
                  className="hidden md:inline-flex bg-[#02838d] hover:bg-[#08565c] text-white text-[14px] font-bold px-5 py-2 rounded-full transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </nav>
          </div>
          {/* Category bar */}
          <div className="bg-[#1a1a1a] border-t border-gray-800 overflow-x-auto scrollbar-hide">
            <div className="max-w-[1100px] mx-auto px-5 md:px-[55px] flex items-center gap-1 h-[42px]">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="text-[13px] font-semibold text-gray-400 hover:text-white whitespace-nowrap px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main>{children}</main>

        {/* Footer */}
        <footer className="bg-black mt-20">
          <div className="max-w-[1100px] mx-auto px-5 md:px-[55px] py-10 md:py-12">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
              <div>
                <Image
                  src="/logo.svg"
                  alt="Teen Acne Solutions"
                  width={180}
                  height={32}
                  className="h-8 w-auto mb-3"
                />
                <p className="text-[#dcdbdb] text-sm">
                  Evidence-based skincare advice for teens and parents.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                  Categories
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                  {categories.map((cat, i) => (
                    <span key={cat.slug} className="flex items-center gap-4">
                      <Link
                        href={`/category/${cat.slug}`}
                        className="text-[#dcdbdb] hover:text-[#02838d] font-semibold transition-colors"
                      >
                        {cat.name}
                      </Link>
                      {i < categories.length - 1 && (
                        <span className="text-gray-700">|</span>
                      )}
                    </span>
                  ))}
                </div>
                <div className="flex gap-x-4 text-sm mt-2">
                  <Link
                    href="/about"
                    className="text-[#dcdbdb] hover:text-[#02838d] font-semibold transition-colors"
                  >
                    About
                  </Link>
                </div>
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
