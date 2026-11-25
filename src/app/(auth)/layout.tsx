import { getT } from "@/lib/i18n/server";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = await getT();
  return (
    <main id="main" className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-md animate-rise">
        <Link href="/" className="mb-8 flex justify-center" aria-label={t("PROOFIT home")}>
          <Logo size={36} />
        </Link>
        <div className="surface rounded-3xl p-6 sm:p-8">{children}</div>
        <div className="mt-6 flex justify-center gap-2">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </div>
    </main>
  );
}
