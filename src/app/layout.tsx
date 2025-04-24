import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "C to Promela",
  description: "Web interface to convert C to Promela",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="icon" type="image/svg+xml" href="/logo.svg"/>
      <body className="w-screen h-screen">
        {children}
        <Toaster/>
      </body>
    </html>
  );
}
