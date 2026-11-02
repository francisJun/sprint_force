import { usePage } from "@inertiajs/react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "@/lib/i18n";
import { dashboard } from "@/routes";
import type { BreadcrumbItem as BreadcrumbItemType } from "@/types";

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const page = usePage();
    const { t } = useTranslation();
    const { auth } = page.props;
    const userRole = (auth?.user as any)?.role || "consultant";
    const currentPath = page.url;

    let computedBreadcrumbs: BreadcrumbItemType[] = [];

    if (breadcrumbs.length > 0) {
        computedBreadcrumbs = breadcrumbs;
    } else if (currentPath.startsWith("/orders")) {
        computedBreadcrumbs = [
            { title: "HourRadar", href: dashboard() },
            { title: t("nav.orders"), href: "/orders" },
        ];
    } else if (currentPath.startsWith("/approvals")) {
        computedBreadcrumbs = [
            { title: "HourRadar", href: dashboard() },
            { title: t("nav.approvals"), href: "/approvals" },
        ];
    } else if (currentPath.startsWith("/purchasing/orders")) {
        computedBreadcrumbs = [
            { title: "HourRadar", href: dashboard() },
            { title: t("nav.purchasingOrders"), href: "/purchasing/orders" },
        ];
    } else if (currentPath.startsWith("/purchasing/invoices")) {
        computedBreadcrumbs = [
            { title: "HourRadar", href: dashboard() },
            { title: t("nav.purchasingInvoices"), href: "/purchasing/invoices" },
        ];
    } else {
        const fallbackTitle =
            userRole === "consultant"
                ? t("nav.consultantWorkstation")
                : userRole === "purchasing"
                  ? t("nav.purchasingRadar")
                  : t("nav.projectLeadCockpit");

        computedBreadcrumbs = [
            {
                title: "HourRadar",
                href: dashboard(),
            },
            {
                title: fallbackTitle,
                href: dashboard(),
            },
        ];
    }

    return (
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-gov-border bg-gov-surface px-4 md:px-6 transition-[width,height] ease-linear">
            <div className="flex items-center gap-3">
                <SidebarTrigger className="-ml-1 text-gov-muted hover:text-gov-text hover:bg-gov-surface-hover" />
                <div className="h-4 w-px bg-gov-border" />
                <Breadcrumbs breadcrumbs={computedBreadcrumbs} />
            </div>

            <div className="flex items-center gap-3">
                <LanguageSwitcher variant="segmented" />
                <div className="hidden md:block font-mono text-[11px] text-gov-muted tabular-nums">
                    Telemetry: 2026-11-02
                </div>
            </div>
        </header>
    );
}
