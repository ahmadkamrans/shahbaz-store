import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WebFontLoader } from "./webfont-loader";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shahbaz - eCommerce Store",
  description: "Shahbaz - eCommerce Store",
  keywords: "HTML5 Template",
  authors: [{ name: "SW-THEMES" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/assets/images/icons/favicon.png" />
        <link rel="stylesheet" href="/assets/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/assets/css/style.min.css" />
        <link rel="stylesheet" href="/assets/css/demo29.min.css" />
        <link rel="stylesheet" href="/assets/vendor/fontawesome-free/css/all.min.css" />
      </head>
      <body className="loaded">
        <WebFontLoader />
        <div className="page-wrapper">
          <Header />
          {children}
          <Footer />
        </div>
        <a id="scroll-top" href="#top" title="Top" role="button">
          <i className="icon-angle-up"></i>
        </a>
      </body>
    </html>
  );
}
