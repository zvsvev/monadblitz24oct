import type { Metadata } from "next";
import Link from "next/link";
import { Nunito } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Nav } from "@/components/nav";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "BuzzMe: pay-to-rank billboard on Monad",
  description:
    "Pay in MON or USDC to rank your project on a public board, or share the board to spin a daily chest. On Monad testnet.",
};

const FOOTER_LINKS = [
  { href: "/docs", label: "Docs" },
  { href: "/list", label: "List" },
  { href: "/dashboard", label: "Profile" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${nunito.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white text-eel">
        <Providers>
          <Nav />
          <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">{children}</main>
          <footer className="mx-auto w-full max-w-3xl px-4 pb-10 pt-6">
            <div className="mb-3 flex flex-wrap gap-4 border-t-2 border-swan pt-4">
              {FOOTER_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs font-extrabold uppercase tracking-wider text-wolf hover:text-mon"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <p className="text-xs font-bold text-hare">
              Monad testnet. Tokens are worthless. Rank is what you pay, not quality.
            </p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
