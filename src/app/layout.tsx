import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "McDonald's Order Management System",
  description: "Automated cooking bot order controller",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen">
        <header className="bg-mcdonald-red text-white py-4 px-6 shadow-lg">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            🍟 McDonald&apos;s Order Management System
          </h1>
        </header>
        <main className="container mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
