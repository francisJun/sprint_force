import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslation } from '@/lib/i18n';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { t } = useTranslation();

    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center bg-gov-canvas p-6 text-gov-text md:p-10 selection:bg-gov-interactive selection:text-white">
            <div className="absolute top-4 right-4">
                <LanguageSwitcher variant="segmented" />
            </div>

            <div className="w-full max-w-md">
                <div className="flex flex-col gap-6">
                    {/* Brand Header */}
                    <div className="flex flex-col items-center gap-2 text-center">
                        <Link
                            href={home()}
                            className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-90"
                        >
                            <div className="flex size-9 items-center justify-center rounded-lg bg-gov-primary text-white shadow-xs">
                                <AppLogoIcon className="size-5.5 text-white" />
                            </div>
                            <span className="font-semibold text-xl tracking-tight text-gov-primary dark:text-white">
                                HourRadar
                            </span>
                        </Link>
                    </div>

                    {/* Card Container conforming strictly to DESIGN.md */}
                    <div className="rounded-lg border border-gov-border bg-gov-surface p-8 shadow-xs">
                        <div className="mb-6">
                            <h1 className="font-semibold text-lg text-gov-text tracking-tight">
                                {title || t("auth.loginTitle")}
                            </h1>
                            <p className="mt-1 text-xs text-gov-muted leading-relaxed">
                                {description || t("auth.loginSubtitle")}
                            </p>
                        </div>

                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
