import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import RecoilProvider from "@/components/providers/recoil-provider";
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
      <head>
        <link rel="icon" type="image/svg+xml" href="/logo.svg"/>
      </head>
      <body className="w-screen h-screen">
        <RecoilProvider>{children}</RecoilProvider>
        <Toaster/>
      </body>
    </html>
  );
}