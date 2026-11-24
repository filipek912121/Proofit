import { getT } from "@/lib/i18n/server";
import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Inter, Space_Grotesk } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import { I18nProvider } from "@/lib/i18n/client";
import { parseTheme, THEME_COLOR, THEME_COOKIE } from "@/lib/theme";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter", display: "swap" });
const grotesk = Space_Grotesk({ subsets: ["latin", "latin-ext"], variable: "--font-grotesk", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
  title: { default: "PROOFIT — Challenge. Compete. Win.", template: "%s · PROOFIT" },
  description: t("Daily, weekly and monthly challenges. Compete with friends, prove your progress and climb the leaderboard."),
  applicationName: "PROOFIT",
  appleWebApp: { capable: true, title: "PROOFIT", statusBarStyle: "black-translucent" },
  icons: { icon: "/icon.svg", apple: "/icons/apple-touch-icon.png" },
  openGraph: { title: "PROOFIT — Challenge. Compete. Win.", description: "The social challenge platform.", type: "website" },
  };
}

export async function generateViewport(): Promise<Viewport> {
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);
  return { themeColor: THEME_COLOR[theme], width: "device-width", initialScale: 1, viewportFit: "cover" };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const t = await getT();
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);
  return (
    <html lang={t.locale} data-theme={theme} suppressHydrationWarning className={`${inter.variable} ${grotesk.variable}`}>
      <body>
        <div className="app-backdrop" aria-hidden />
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-violet focus:px-4 focus:py-2">
          {t("Skip to content")}
        </a>
        <I18nProvider locale={t.locale}>
          <ToastProvider>{children}</ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
