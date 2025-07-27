import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import AppShell from "./AppShell";
import { Toaster } from "react-hot-toast";
import AppReady from "./AppReady";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Cogito",
  description: "Minimalistic note taking app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" id="rootHtml" suppressHydrationWarning>
      <body className={`${nunito.className} antialiased no-scrollbar`}>
        <AppReady>
          <Toaster position="bottom-center" />
          <AppShell>{children}</AppShell>
        </AppReady>
      </body>
    </html>
  );
}
