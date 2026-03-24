import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";
import { NetworkGuard } from "@/components/NetworkGuard";

export const metadata: Metadata = {
  title: "VoteChain | Decentralized Voting System",
  description: "Transparent. Tamper-proof. On-chain voting for the modern world.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-gray-50 dark:bg-black font-inter selection:bg-blue-500 selection:text-white transition-colors duration-300">
        <Providers>
          <NetworkGuard>
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
              {children}
            </main>
            <footer className="mt-auto py-12 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-center">
               <p className="text-gray-500 dark:text-gray-400 text-sm">
                 &copy; 2026 VoteChain DApp. All rights reserved.
               </p>
               <div className="flex justify-center gap-6 mt-4">
                  <a href="#" className="text-sm text-gray-500 hover:text-blue-600 dark:hover:text-blue-400">GitHub</a>
                  <a href="#" className="text-sm text-gray-500 hover:text-blue-600 dark:hover:text-blue-400">Etherscan</a>
                  <a href="#" className="text-sm text-gray-500 hover:text-blue-600 dark:hover:text-blue-400">Docs</a>
               </div>
            </footer>
          </NetworkGuard>
        </Providers>
      </body>
    </html>
  );
}
