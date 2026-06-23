import type { Metadata } from "next";
import type { ReactNode } from "react";

import { BackToTopButton } from "@/components/back-to-top";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://sahay.app"),
  title: {
    default: "Sahāy Legal Center",
    template: "%s | Sahāy",
  },
  description: "Enterprise-grade legal and policy pages for the Sahāy local service marketplace.",
  applicationName: "Sahāy",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main className="mx-auto min-h-screen max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">{children}</main>
        <SiteFooter />
        <BackToTopButton />
      </body>
    </html>
  );
}