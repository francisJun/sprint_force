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
    const { t, isGerman } = useTranslation();
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
    } else if (currentPath.startsWith("/admin/users")) {
        computedBreadcrumbs = [
            { title: "HourRadar", href: dashboard() },
            { title: isGerman ? "Benutzer & Rollen" : "User Governance", href: "/admin/users" },
        ];
    } else {
        const fallbackTitle =
            userRole === "consultant"
                ? t("nav.consultantWorkstation")
                : userRole === "purchasing"
                  ? t("nav.purchasingRadar")
                  : userRole === "super_admin"
                    ? (isGerman ? "Super-Admin Kontrollzentrum" : "Super Admin Command Center")
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
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-gov-border bg-gov-surface px-3 sm:px-4 md:px-6 transition-[width,height] ease-linear">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 overflow-hidden">
                <SidebarTrigger className="-ml-1 text-gov-muted hover:text-gov-text hover:bg-gov-surface-hover shrink-0" />
                <div className="h-4 w-px bg-gov-border shrink-0" />
                <div className="min-w-0 truncate text-xs sm:text-sm">
                    <Breadcrumbs breadcrumbs={computedBreadcrumbs} />
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <LanguageSwitcher variant="segmented" />
            </div>
        </header>
    );
}
