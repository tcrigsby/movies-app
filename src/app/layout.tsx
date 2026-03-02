import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/header";

export const metadata: Metadata = {
  title: "MovieMind — AI Movie & TV Recommendations",
  description:
    "Get personalized movie and TV show recommendations powered by AI. Discover what to watch next based on your tastes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
        <Header />
        <main className="mx-auto max-w-7xl px-4 pb-20 pt-6 md:pb-6">
          {children}
        </main>
      </body>
    </html>
  );
}
