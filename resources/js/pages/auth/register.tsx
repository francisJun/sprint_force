import { Head, Link } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import { login } from '@/routes';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function Register() {
    return (
        <div className="flex flex-col gap-6 text-center">
            <Head title="Registration Restricted" />

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gov-warning-bg border border-gov-warning-border text-gov-warning-text">
                <ShieldAlert className="h-6 w-6" />
            </div>

            <div className="space-y-2">
                <h1 className="text-xl font-semibold tracking-tight text-gov-text">
                    Enterprise Onboarding Only
                </h1>
                <p className="text-xs text-gov-muted max-w-sm mx-auto leading-relaxed">
                    Public self-registration is disabled. Consultants and project directors are onboarded directly through authorized framework contracts and receive pre-provisioned credentials.
                </p>
            </div>

            <div className="pt-2">
                <Link
                    href={login()}
                    className="inline-flex items-center gap-1.5 rounded-md bg-gov-interactive px-4 py-2 text-xs font-medium text-white hover:bg-gov-interactive-hover transition-colors"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Return to Enterprise Sign In
                </Link>
            </div>
        </div>
    );
}
