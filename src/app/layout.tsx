import { getT } from "@/lib/i18n/server";
import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Nunito } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import { I18nProvider } from "@/lib/i18n/client";
import { parseTheme, THEME_COLOR, THEME_COOKIE } from "@/lib/theme";
import "./globals.css";

// Rounded, friendly and very legible at heavy weights — the voice of the UI.
const nunito = Nunito({ subsets: ["latin", "latin-ext"], weight: ["500", "600", "700", "800", "900"], variable: "--font-nunito", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
  title: { default: "PROOFIT — Challenge. Compete. Win.", template: "%s · PROOFIT" },
  description: t("Daily, weekly and monthly challenges. Compete with friends, prove your progress and climb the leaderboard."),
  applicationName: "PROOFIT",
  appleWebApp: { capable: true, title: "PROOFIT", statusBarStyle: "default" },
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
    <html lang={t.locale} data-theme={theme} suppressHydrationWarning className={nunito.variable}>
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
