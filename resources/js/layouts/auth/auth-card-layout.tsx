import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { Shield } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';

export default function AuthCardLayout({
    children,
    title,
    description,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
}>) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center bg-gov-canvas p-4 sm:p-6 md:p-10 text-gov-text selection:bg-gov-interactive selection:text-white">
            <div className="flex w-full max-w-md flex-col gap-6">
                {/* Brand Header */}
                <div className="flex flex-col items-center gap-2 text-center">
                    <Link href={home()} className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-90">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-gov-primary text-white shadow-xs">
                            <AppLogoIcon className="size-5.5 text-white" />
                        </div>
                        <span className="font-semibold text-xl tracking-tight text-gov-primary dark:text-gov-text">
                            HourRadar
                        </span>
                    </Link>
                </div>

                {/* Card Shell adhering strictly to DESIGN.md (Level 1: 8px radius, #FFFFFF, 1px #E2E8F0 border) */}
                <div className="rounded-lg border border-gov-border bg-gov-surface p-5 sm:p-8 shadow-xs">
                    <div className="mb-6">
                        <h1 className="font-semibold text-lg text-gov-text tracking-tight">
                            {title || 'Enterprise Sign In'}
                        </h1>
                        {description && (
                            <p className="mt-1 text-xs text-gov-muted leading-relaxed">
                                {description}
                            </p>
                        )}
                    </div>

                    {children}

                    {/* Statutory Audit Notice Footer */}
                    <div className="mt-6 border-t border-gov-border pt-4 text-center">
                        <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gov-muted font-medium">
                            <Shield className="h-3 w-3 text-gov-interactive" />
                            Statutory Audit Trail Active · EU GDPR Compliant
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
