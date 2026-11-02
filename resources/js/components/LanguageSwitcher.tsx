import { useTranslation, type Locale } from "@/lib/i18n";
import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
    variant?: "compact" | "segmented" | "minimal";
    className?: string;
}

export function LanguageSwitcher({
    variant = "segmented",
    className = "",
}: LanguageSwitcherProps) {
    const { locale, changeLanguage } = useTranslation();

    if (variant === "compact") {
        const nextLocale: Locale = locale === "en" ? "de" : "en";
        return (
            <button
                type="button"
                onClick={() => changeLanguage(nextLocale)}
                aria-label={`Switch to ${nextLocale === "de" ? "Deutsch" : "English"}`}
                title={`Switch to ${nextLocale === "de" ? "Deutsch" : "English"}`}
                className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-gov-border bg-gov-surface hover:bg-gov-surface-hover text-gov-text font-mono text-xs font-medium transition-colors cursor-pointer ${className}`}
            >
                <Globe className="size-3.5 text-gov-muted" />
                <span className="uppercase">{locale}</span>
                <span className="text-[10px] text-gov-muted">/</span>
                <span className="text-[10px] text-gov-muted uppercase">{nextLocale}</span>
            </button>
        );
    }

    if (variant === "minimal") {
        return (
            <div className={`inline-flex items-center font-mono text-xs ${className}`}>
                <button
                    type="button"
                    onClick={() => changeLanguage("en")}
                    className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                        locale === "en"
                            ? "font-bold text-gov-interactive dark:text-gov-interactive"
                            : "text-gov-muted hover:text-gov-text"
                    }`}
                >
                    EN
                </button>
                <span className="text-gov-border">|</span>
                <button
                    type="button"
                    onClick={() => changeLanguage("de")}
                    className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                        locale === "de"
                            ? "font-bold text-gov-interactive dark:text-gov-interactive"
                            : "text-gov-muted hover:text-gov-text"
                    }`}
                >
                    DE
                </button>
            </div>
        );
    }

    // Default: Segmented toggle matching HourRadar utilitarian theme
    return (
        <div
            role="group"
            aria-label="Language selection"
            className={`inline-flex items-center rounded-md border border-gov-border bg-gov-canvas/60 p-0.5 shadow-2xs ${className}`}
        >
            <button
                type="button"
                onClick={() => changeLanguage("en")}
                aria-pressed={locale === "en"}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-mono font-medium transition-all cursor-pointer ${
                    locale === "en"
                        ? "bg-gov-surface text-gov-text shadow-xs border border-gov-border font-semibold"
                        : "text-gov-muted hover:text-gov-text"
                }`}
            >
                <span>🇬🇧</span>
                <span>EN</span>
            </button>
            <button
                type="button"
                onClick={() => changeLanguage("de")}
                aria-pressed={locale === "de"}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-mono font-medium transition-all cursor-pointer ${
                    locale === "de"
                        ? "bg-gov-surface text-gov-text shadow-xs border border-gov-border font-semibold"
                        : "text-gov-muted hover:text-gov-text"
                }`}
            >
                <span>🇩🇪</span>
                <span>DE</span>
            </button>
        </div>
    );
}
export default LanguageSwitcher;

