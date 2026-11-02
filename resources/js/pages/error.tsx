import { Head, Link } from '@inertiajs/react';

interface ErrorPageProps {
    status: number;
    message?: string;
}

export default function ErrorPage({ status = 404, message }: ErrorPageProps) {
    const titles: Record<number, string> = {
        403: 'Access Forbidden',
        404: 'Page Not Found',
        419: 'Page Expired',
        500: 'Server Error',
        503: 'Service Unavailable',
    };

    const descriptions: Record<number, string> = {
        403: 'You do not have permission to access this resource.',
        404: 'The page you are looking for could not be found.',
        419: 'Your session has expired. Please refresh the page and try again.',
        500: 'Something went wrong on our servers. Please try again later.',
        503: 'The system is temporarily unavailable for maintenance.',
    };

    const title = titles[status] || 'Error';
    const description = message || descriptions[status] || 'An unexpected error occurred.';

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gov-canvas px-4 text-center">
            <Head title={`${status}: ${title} - HourRadar`} />
            <p className="text-sm font-mono font-semibold text-gov-interactive">{status}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gov-text sm:text-4xl">{title}</h1>
            <p className="mt-3 max-w-md text-sm text-gov-muted">{description}</p>
            <div className="mt-6 flex items-center gap-3">
                <Link
                    href="/dashboard"
                    className="inline-flex h-9 items-center justify-center rounded-md bg-gov-interactive px-4 text-sm font-medium text-white hover:bg-gov-interactive-hover transition-colors"
                >
                    Back to dashboard
                </Link>
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-gov-border bg-gov-surface px-4 text-sm font-medium text-gov-text hover:bg-gov-surface-hover transition-colors"
                >
                    Go back
                </button>
            </div>
        </div>
    );
}
