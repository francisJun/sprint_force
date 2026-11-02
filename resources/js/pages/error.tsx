import { Head, Link } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { 
    ShieldAlert, 
    FileQuestion, 
    Clock, 
    AlertTriangle, 
    Wrench, 
    ArrowLeft, 
    LayoutDashboard, 
    Radio
} from 'lucide-react';

interface ErrorPageProps {
    status: number;
    message?: string;
}

export default function ErrorPage({ status = 404, message }: ErrorPageProps) {
    const { t, isGerman } = useTranslation();

    const getErrorConfig = (code: number) => {
        switch (code) {
            case 403:
                return {
                    title: t('errors.title403'),
                    description: message || t('errors.description403'),
                    icon: ShieldAlert,
                    badgeStyle: 'bg-gov-warning-bg text-gov-warning-text border-gov-warning-border',
                    codeLabel: '403_ACCESS_FORBIDDEN',
                    statusTitle: isGerman ? '403 · ZUGRIFF VERWEIGERT' : '403 · ACCESS FORBIDDEN',
                };
            case 419:
                return {
                    title: t('errors.title419'),
                    description: message || t('errors.description419'),
                    icon: Clock,
                    badgeStyle: 'bg-gov-warning-bg text-gov-warning-text border-gov-warning-border',
                    codeLabel: '419_SESSION_EXPIRED',
                    statusTitle: isGerman ? '419 · SITZUNG ABGELAUFEN' : '419 · SESSION EXPIRED',
                };
            case 500:
                return {
                    title: t('errors.title500'),
                    description: message || t('errors.description500'),
                    icon: AlertTriangle,
                    badgeStyle: 'bg-gov-critical-bg text-gov-critical-text border-gov-critical-border',
                    codeLabel: '500_INTERNAL_SERVER_ERROR',
                    statusTitle: isGerman ? '500 · SERVERFEHLER' : '500 · SERVER ERROR',
                };
            case 503:
                return {
                    title: t('errors.title503'),
                    description: message || t('errors.description503'),
                    icon: Wrench,
                    badgeStyle: 'bg-gov-surface-hover text-gov-interactive border-gov-border',
                    codeLabel: '503_SERVICE_MAINTENANCE',
                    statusTitle: isGerman ? '503 · WARTUNG' : '503 · SERVICE UNAVAILABLE',
                };
            case 404:
            default:
                return {
                    title: t('errors.title404'),
                    description: message || t('errors.description404'),
                    icon: FileQuestion,
                    badgeStyle: 'bg-gov-surface-hover text-gov-text border-gov-border',
                    codeLabel: '404_ROUTE_NOT_FOUND',
                    statusTitle: isGerman ? '404 · NICHT GEFUNDEN' : '404 · NOT FOUND',
                };
        }
    };

    const config = getErrorConfig(status);
    const IconComponent = config.icon;

    return (
        <div className="min-h-screen flex flex-col bg-gov-canvas text-gov-text font-sans antialiased">
            <Head title={`${status} · ${config.title} - HourRadar`} />

            {/* Institutional Header (DESIGN.md: Deep Navy --gov-primary) */}
            <header className="h-14 bg-gov-primary border-b border-white/10 px-6 flex items-center justify-between text-white shrink-0">
                <Link href="/" className="flex items-center gap-2.5 text-white hover:opacity-90 transition-opacity">
                    <div className="h-7 w-7 rounded-sm bg-gov-interactive flex items-center justify-center text-white">
                        <Radio className="h-4 w-4" />
                    </div>
                    <span className="font-mono text-[15px] font-bold tracking-tight">
                        Hour<span className="text-sidebar-accent-foreground">Radar</span>
                    </span>
                    <span className="hidden sm:inline-block text-[11px] font-mono uppercase tracking-wider text-white/50 border-l border-white/20 pl-2.5 ml-1">
                        Enterprise Governance
                    </span>
                </Link>

                <div className="flex items-center gap-3">
                    <LanguageSwitcher />
                </div>
            </header>

            {/* Main Operational Canvas */}
            <main className="flex-1 flex items-center justify-center p-6 md:p-8">
                <div className="w-full max-w-[560px] bg-gov-surface border border-gov-border rounded-lg p-8 shadow-sm text-center space-y-6">
                    
                    {/* Status Indicator Icon */}
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-lg bg-gov-canvas border border-gov-border text-gov-primary dark:text-gov-text">
                        <IconComponent className="h-7 w-7 stroke-[1.75]" />
                    </div>

                    {/* Status Pill (DESIGN.md: 4px radius / rounded-sm, uppercase, 11px font-size, 600 weight) */}
                    <div>
                        <span className={`inline-block px-2 py-0.5 text-[11px] font-semibold font-mono uppercase tracking-[0.04em] rounded-sm border ${config.badgeStyle}`}>
                            {config.statusTitle}
                        </span>
                    </div>

                    {/* Typography Hierarchy (DESIGN.md: Headline-lg, 24px, 600 weight, Inter) */}
                    <div className="space-y-2">
                        <h1 className="text-2xl font-semibold text-gov-text tracking-tight leading-8">
                            {config.title}
                        </h1>
                        <p className="text-sm text-gov-muted leading-5 max-w-[460px] mx-auto">
                            {config.description}
                        </p>
                    </div>

                    {/* Operational Telemetry Grid (DESIGN.md: Tabular figures, monospaced metadata, clinical clarity) */}
                    <div className="rounded-lg border border-gov-border bg-gov-canvas p-3 text-left font-mono text-xs space-y-1.5 text-gov-muted">
                        <div className="flex items-center justify-between pb-1.5 border-b border-gov-border">
                            <span className="text-[11px] uppercase tracking-wider text-gov-muted">{isGerman ? 'System-Fehlercode' : 'System Error Code'}</span>
                            <span className="font-semibold text-gov-text">{config.codeLabel}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                            <span>Operational Engine:</span>
                            <span className="text-gov-text">HourRadar v2.4 (Statutory ArbZG Guard)</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                            <span>Audit Logging:</span>
                            <span className="text-gov-success-text font-semibold">Active · Non-Repudiation Enforced</span>
                        </div>
                    </div>

                    {/* Action Touchpoints (DESIGN.md: 8px radius / rounded-lg, height 40px, Primary gov-interactive, Secondary Outline) */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                        <Link
                            href="/dashboard"
                            className="w-full sm:w-auto h-10 px-4 inline-flex items-center justify-center gap-2 rounded-lg bg-gov-interactive text-white text-sm font-medium hover:bg-gov-interactive-hover focus:outline-none focus:ring-2 focus:ring-gov-interactive focus:ring-offset-2 transition-colors cursor-pointer"
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            <span>{t('errors.backToDashboard')}</span>
                        </Link>

                        <button
                            type="button"
                            onClick={() => window.history.length > 1 ? window.history.back() : window.location.href = '/'}
                            className="w-full sm:w-auto h-10 px-4 inline-flex items-center justify-center gap-2 rounded-lg bg-gov-surface border border-gov-border text-gov-text text-sm font-medium hover:bg-gov-surface-hover focus:outline-none transition-colors cursor-pointer"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>{isGerman ? 'Zurück' : 'Go Back'}</span>
                        </button>
                    </div>
                </div>
            </main>

            {/* Institutional Sub-Footer */}
            <footer className="h-10 border-t border-gov-border bg-gov-surface px-6 flex items-center justify-between text-xs font-mono text-gov-muted">
                <span>HourRadar Enterprise Governance</span>
                <span>German ArbZG Compliance Engine · {new Date().getFullYear()}</span>
            </footer>
        </div>
    );
}
