import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteProvider } from "@/contexts/SiteContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { CookieConsent } from "@/components/ui/cookie-consent";
import { getSiteConfig } from "@/lib/site-config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Dynamic metadata based on hostname
export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get("host") || "vietnamtravel.help";
  const hostname = host.split(":")[0]; // Remove port if present

  const siteConfig = getSiteConfig(hostname);

  return {
    title: siteConfig.content.metaTitle,
    description: siteConfig.content.metaDescription,
    keywords: "Vietnam visa, e-visa, urgent visa, fast visa, Vietnam travel, approval letter",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200 overflow-x-hidden`}
      >
        <SiteProvider>
          <ThemeProvider>
            <LanguageProvider>
              <CurrencyProvider>
                {children}
                <CookieConsent />
              </CurrencyProvider>
            </LanguageProvider>
          </ThemeProvider>
        </SiteProvider>
      </body>
    </html>
  );
}
