import { Link } from "@inertiajs/react";
import { ChatbotDrawer } from "@/components/hourradar/ChatbotDrawer";
import {
    Activity,
    AlertTriangle,
    ArrowRight,
    Building2,
    CheckCircle2,
    Clock,
    Layers,
    Scale,
    Shield,
    Users,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface UserItem {
    id: number;
    name: string;
    email: string;
    role: string;
    supplier_name?: string | null;
    created_at?: string;
}

interface PurchaseOrderItem {
    id: number;
    order_number: string;
    title: string;
    supplier_name: string;
    total_person_days: number;
    used_person_days: number;
    remaining_person_days: number;
    status_traffic_light: "green" | "yellow" | "red";
    needs_reorder_alert: boolean;
    days_until_reorder_deadline: number;
}

interface Props {
    user: { name: string; role: string };
    stats: {
        total_users: number;
        role_counts: {
            super_admin: number;
            project_lead: number;
            purchasing: number;
            consultant: number;
        };
        total_orders: number;
        active_orders: number;
        total_booked_hours: number;
        arbzg_notices_count: number;
        suppliers_count: number;
    };
    orders: PurchaseOrderItem[];
    pendingBookings: any[];
    recentUsers: UserItem[];
}

export default function SuperAdminDashboard({
    user,
    stats,
    orders,
    pendingBookings,
    recentUsers,
}: Props) {
    const { t, isGerman } = useTranslation();

    const roleBadgeStyles: Record<
        string,
        { label: string; bg: string; text: string; border: string }
    > = {
        super_admin: {
            label: isGerman ? "Super Admin" : "Super Admin",
            bg: "bg-amber-500/10",
            text: "text-amber-600 dark:text-amber-400",
            border: "border-amber-500/20",
        },
        project_lead: {
            label: isGerman ? "Projektleiter" : "Project Lead",
            bg: "bg-blue-500/10",
            text: "text-blue-600 dark:text-blue-400",
            border: "border-blue-500/20",
        },
        purchasing: {
            label: isGerman ? "Einkauf" : "Purchasing",
            bg: "bg-emerald-500/10",
            text: "text-emerald-600 dark:text-emerald-400",
            border: "border-emerald-500/20",
        },
        consultant: {
            label: isGerman ? "Berater" : "Consultant",
            bg: "bg-purple-500/10",
            text: "text-purple-600 dark:text-purple-400",
            border: "border-purple-500/20",
        },
    };

    const reorderAlertOrders = orders.filter((o) => o.needs_reorder_alert);

    return (
        <div className="space-y-6">
            {/* Header Strip */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gov-border pb-5">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gov-text">
                        {t("admin.overseerCockpit")}
                    </h1>
                    <p className="text-xs text-gov-muted">
                        {t("admin.overseerSubtitle")}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href="/admin/users"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-gov-interactive px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-gov-interactive-hover shadow-xs cursor-pointer"
                    >
                        <Shield className="h-4 w-4" />
                        {t("admin.manageUsers")}
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Users */}
                <div className="rounded-lg border border-gov-border bg-gov-surface p-4 shadow-xs">
                    <div className="flex items-center justify-between text-gov-muted">
                        <span className="text-xs font-medium uppercase tracking-wider">
                            {t("admin.totalUsers")}
                        </span>
                        <Users className="h-4 w-4 text-gov-interactive" />
                    </div>
                    <div className="mt-2 text-2xl font-bold text-gov-text">
                        {stats.total_users}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
                        <span className="rounded-sm bg-amber-500/10 px-1.5 py-0.5 font-medium text-amber-600 dark:text-amber-400">
                            {stats.role_counts.super_admin} Admin
                        </span>
                        <span className="rounded-sm bg-blue-500/10 px-1.5 py-0.5 font-medium text-blue-600 dark:text-blue-400">
                            {stats.role_counts.project_lead} Lead
                        </span>
                        <span className="rounded-sm bg-emerald-500/10 px-1.5 py-0.5 font-medium text-emerald-600 dark:text-emerald-400">
                            {stats.role_counts.purchasing} Purchasing
                        </span>
                        <span className="rounded-sm bg-purple-500/10 px-1.5 py-0.5 font-medium text-purple-600 dark:text-purple-400">
                            {stats.role_counts.consultant} Consultant
                        </span>
                    </div>
                </div>

                {/* Framework Orders */}
                <div className="rounded-lg border border-gov-border bg-gov-surface p-4 shadow-xs">
                    <div className="flex items-center justify-between text-gov-muted">
                        <span className="text-xs font-medium uppercase tracking-wider">
                            {isGerman
                                ? "Rahmen-Bestellungen"
                                : "Framework Orders"}
                        </span>
                        <Layers className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="mt-2 text-2xl font-bold text-gov-text">
                        {stats.active_orders}{" "}
                        <span className="text-xs font-normal text-gov-muted">
                            / {stats.total_orders}
                        </span>
                    </div>
                    <p className="mt-2 text-[11px] text-gov-muted">
                        {stats.suppliers_count}{" "}
                        {isGerman
                            ? "aktive Dienstleister angebunden"
                            : "active vendors connected"}
                    </p>
                </div>

                {/* Approved Bookings Hours */}
                <div className="rounded-lg border border-gov-border bg-gov-surface p-4 shadow-xs">
                    <div className="flex items-center justify-between text-gov-muted">
                        <span className="text-xs font-medium uppercase tracking-wider">
                            {isGerman
                                ? "Freigegebene Stunden"
                                : "Audited Hours"}
                        </span>
                        <Clock className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="mt-2 text-2xl font-bold text-gov-text">
                        {stats.total_booked_hours.toLocaleString()}{" "}
                        <span className="text-xs font-normal text-gov-muted">
                            hrs
                        </span>
                    </div>
                    <p className="mt-2 text-[11px] text-gov-muted">
                        {pendingBookings.length}{" "}
                        {isGerman
                            ? "Buchungen ausstehend"
                            : "bookings awaiting approval"}
                    </p>
                </div>

                {/* ArbZG Compliance Notices */}
                <div className="rounded-lg border border-gov-border bg-gov-surface p-4 shadow-xs">
                    <div className="flex items-center justify-between text-gov-muted">
                        <span className="text-xs font-medium uppercase tracking-wider">
                            {isGerman
                                ? "ArbZG § 3/§ 5 Hinweise"
                                : "ArbZG Rest Notices"}
                        </span>
                        <Scale
                            className={`h-4 w-4 ${stats.arbzg_notices_count > 0 ? "text-amber-500" : "text-gov-muted"}`}
                        />
                    </div>
                    <div className="mt-2 text-2xl font-bold text-gov-text">
                        {stats.arbzg_notices_count}
                    </div>
                    <p className="mt-2 text-[11px] text-gov-muted">
                        {isGerman
                            ? "Gesetzlich auditierte Ruhezeit-Meldungen"
                            : "Compensatory rest compliance alerts"}
                    </p>
                </div>
            </div>

            {/* Quick Governance Links */}
            <div className="rounded-lg border border-gov-border bg-gov-surface p-4 shadow-xs">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gov-muted mb-3">
                    {t("admin.quickLinks")}
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Link
                        href="/admin/users"
                        className="group flex items-start gap-3 rounded-lg border border-gov-border bg-gov-canvas p-3 transition-colors hover:border-gov-interactive hover:bg-gov-interactive/5"
                    >
                        <div className="rounded-md bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500/20">
                            <Shield className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-gov-text group-hover:text-gov-interactive">
                                {t("admin.manageUsers")}
                            </div>
                            <div className="text-[11px] text-gov-muted">
                                {isGerman
                                    ? "Benutzerkonten, Rollen & Matrix"
                                    : "Directory, roles & permission matrix"}
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/orders"
                        className="group flex items-start gap-3 rounded-lg border border-gov-border bg-gov-canvas p-3 transition-colors hover:border-gov-interactive hover:bg-gov-interactive/5"
                    >
                        <div className="rounded-md bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500/20">
                            <Activity className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-gov-text group-hover:text-gov-interactive">
                                {t("admin.orderRunway")}
                            </div>
                            <div className="text-[11px] text-gov-muted">
                                {isGerman
                                    ? "Depletion Trajectory & Frühwarnung"
                                    : "Burndown trajectory & early alerts"}
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/approvals"
                        className="group flex items-start gap-3 rounded-lg border border-gov-border bg-gov-canvas p-3 transition-colors hover:border-gov-interactive hover:bg-gov-interactive/5"
                    >
                        <div className="rounded-md bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/20">
                            <Scale className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-gov-text group-hover:text-gov-interactive">
                                {t("admin.proofOfWork")}
                            </div>
                            <div className="text-[11px] text-gov-muted">
                                {isGerman
                                    ? "Stundenfreigabe nach HGB / Dienstvertrag"
                                    : "Timesheet sign-off & audit trail"}
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/purchasing/orders"
                        className="group flex items-start gap-3 rounded-lg border border-gov-border bg-gov-canvas p-3 transition-colors hover:border-gov-interactive hover:bg-gov-interactive/5"
                    >
                        <div className="rounded-md bg-purple-500/10 p-2 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500/20">
                            <Layers className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-gov-text group-hover:text-gov-interactive">
                                {isGerman
                                    ? "Rahmen-Bestellungen"
                                    : "Framework Orders"}
                            </div>
                            <div className="text-[11px] text-gov-muted">
                                {isGerman
                                    ? "Beschaffungsbudget & Kontingente"
                                    : "Budgets, rates & PO line items"}
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Split Content: Recent Users & Telemetry Status */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left 2 Cols: Recent Users */}
                <div className="lg:col-span-2 rounded-lg border border-gov-border bg-gov-surface p-4 shadow-xs">
                    <div className="flex items-center justify-between border-b border-gov-border pb-3 mb-3">
                        <div>
                            <h2 className="text-sm font-semibold text-gov-text">
                                {t("admin.recentUsers")}
                            </h2>
                            <p className="text-[11px] text-gov-muted">
                                {isGerman
                                    ? "Zuletzt registrierte Plattformbenutzer"
                                    : "Latest accounts provisioned across tiers"}
                            </p>
                        </div>
                        <Link
                            href="/admin/users"
                            className="text-xs font-medium text-gov-interactive hover:underline inline-flex items-center gap-1"
                        >
                            {isGerman ? "Alle anzeigen" : "View All"}
                            <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-gov-border text-[11px] font-medium uppercase text-gov-muted">
                                <tr>
                                    <th className="py-2 pr-3">
                                        {t("admin.name")}
                                    </th>
                                    <th className="py-2 pr-3">
                                        {t("admin.email")}
                                    </th>
                                    <th className="py-2 pr-3">
                                        {t("admin.role")}
                                    </th>
                                    <th className="py-2 pr-3">
                                        {t("admin.supplier")}
                                    </th>
                                    <th className="py-2 text-right">
                                        {t("admin.created")}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gov-border text-gov-text">
                                {recentUsers.map((u) => {
                                    const badge =
                                        roleBadgeStyles[u.role] ||
                                        roleBadgeStyles.consultant;
                                    return (
                                        <tr
                                            key={u.id}
                                            className="hover:bg-gov-canvas/50"
                                        >
                                            <td className="py-2.5 pr-3 font-medium">
                                                {u.name}
                                            </td>
                                            <td className="py-2.5 pr-3 text-gov-muted font-mono text-[11px]">
                                                {u.email}
                                            </td>
                                            <td className="py-2.5 pr-3">
                                                <span
                                                    className={`inline-flex rounded-sm px-2 py-0.5 text-[10px] font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
                                                >
                                                    {badge.label}
                                                </span>
                                            </td>
                                            <td className="py-2.5 pr-3 text-gov-muted">
                                                {u.supplier_name || "—"}
                                            </td>
                                            <td className="py-2.5 text-right text-gov-muted font-mono text-[11px]">
                                                {u.created_at || "—"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Col: Statutory & Procurement Telemetry */}
                <div className="space-y-4">
                    {/* Re-Order Alerts Card */}
                    <div className="rounded-lg border border-gov-border bg-gov-surface p-4 shadow-xs">
                        <div className="flex items-center gap-2 border-b border-gov-border pb-3 mb-3">
                            <AlertTriangle
                                className={`h-4 w-4 ${reorderAlertOrders.length > 0 ? "text-amber-500" : "text-emerald-500"}`}
                            />
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-gov-text">
                                {isGerman
                                    ? "Reichweiten-Radar"
                                    : "Runway Re-Order Radar"}
                            </h3>
                        </div>

                        {reorderAlertOrders.length === 0 ? (
                            <div className="flex items-center gap-2 text-xs text-gov-muted">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                <span>
                                    {isGerman
                                        ? "Alle Rahmenbestellungen verfügen über ausreichende Restlaufzeit."
                                        : "All framework orders have sufficient delivery runway."}
                                </span>
                            </div>
                        ) : (
                            <div className="space-y-2.5">
                                <p className="text-[11px] text-gov-muted">
                                    {isGerman
                                        ? `${reorderAlertOrders.length} Rahmenbestellung(en) unterschreiten das 28-Tage-Vorwarnfenster:`
                                        : `${reorderAlertOrders.length} order(s) entered the 28-day re-order notice window:`}
                                </p>
                                {reorderAlertOrders.map((ord) => (
                                    <div
                                        key={ord.id}
                                        className="rounded-sm border border-amber-500/20 bg-amber-500/5 p-2 text-xs"
                                    >
                                        <div className="font-semibold text-gov-text flex justify-between">
                                            <span>{ord.order_number}</span>
                                            <span className="text-amber-600 dark:text-amber-400 font-mono text-[10px]">
                                                {
                                                    ord.days_until_reorder_deadline
                                                }
                                                d{" "}
                                                {isGerman
                                                    ? "bis Frist"
                                                    : "to deadline"}
                                            </span>
                                        </div>
                                        <div className="text-[11px] text-gov-muted truncate">
                                            {ord.title}
                                        </div>
                                        <div className="text-[10px] text-gov-muted mt-1">
                                            {ord.remaining_person_days}{" "}
                                            {isGerman
                                                ? "PT Rest"
                                                : "PD remaining"}{" "}
                                            · {ord.supplier_name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Legal Compliance Box */}
                    <div className="rounded-lg border border-gov-border bg-gov-surface p-4 shadow-xs">
                        <div className="flex items-center gap-2 border-b border-gov-border pb-3 mb-3">
                            <Building2 className="h-4 w-4 text-gov-interactive" />
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-gov-text">
                                {isGerman
                                    ? "Compliance & AÜG-Prävention"
                                    : "Compliance & Anti-Scheinselbstständigkeit"}
                            </h3>
                        </div>
                        <p className="text-xs text-gov-muted leading-relaxed">
                            {isGerman
                                ? "HourRadar trennt strikt zwischen Auftraggeber (Projektleitung), Beschaffung (Einkauf) und externen Dienstleistern gemäß AÜG und ArbZG. Super-Administratoren überwachen Plattformgesundheit und Rollenvergabe ohne unbefugte Eingriffe in Dienstverträge."
                                : "HourRadar strictly isolates Client Project Leads, Procurement, and External Consultants to guarantee AÜG and ArbZG compliance. Super Admins oversee platform posture and directory RBAC without unlawful direct supervision."}
                        </p>
                    </div>
                </div>
            </div>

            {/* Floating Chatbot Drawer */}
            <ChatbotDrawer />
        </div>
    );
}
