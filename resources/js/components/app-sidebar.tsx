import { Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import {
    Activity,
    Calendar,
    CheckCircle2,
    Clock,
    FileCheck2,
    FileText,
    Layers,
    LayoutDashboard,
    LogOut,
    Scale,
    Shield,
} from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useTranslation } from '@/lib/i18n';

export function AppSidebar() {
    const { isCurrentUrl } = useCurrentUrl();
    const { t, isGerman } = useTranslation();
    const { auth } = usePage().props;
    const userRole = (auth?.user as any)?.role || 'consultant';

    const roleTitle =
        userRole === 'super_admin'
            ? (isGerman ? 'Super-Administrator (Plattform)' : 'Super Admin (Platform Overseer)')
            : userRole === 'project_lead'
            ? (isGerman ? 'Projektleiter (Auftraggeber)' : 'Client Project Lead')
            : userRole === 'purchasing'
            ? (isGerman ? 'Einkauf & Finanzen' : 'Procurement & Finance')
            : (isGerman ? 'Externer Berater' : 'External Consultant');

    const primaryViewTitle =
        userRole === 'super_admin'
            ? (isGerman ? 'Plattform-Übersicht' : 'Platform Overseer Cockpit')
            : userRole === 'consultant'
            ? (isGerman ? 'Berater-Arbeitsplatz' : 'Time Booking Portal')
            : userRole === 'purchasing'
            ? (isGerman ? 'Einkaufs-Cockpit' : 'Purchasing Cockpit')
            : (isGerman ? 'Projektleiter-Cockpit' : 'Project Lead Cockpit');

    return (
        <Sidebar collapsible="icon" variant="sidebar" className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
            {/* Header with Enterprise Branding */}
            <SidebarHeader className="border-b border-sidebar-border p-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-sidebar-accent text-white data-[state=open]:bg-sidebar-accent">
                            <Link href={dashboard()} className="flex items-center gap-2.5">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-gov-interactive text-white shrink-0 shadow-xs">
                                    <AppLogoIcon className="size-5 text-white" />
                                </div>
                                <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                                    <span className="truncate font-semibold text-sm text-white">HourRadar</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Navigation Menu */}
            <SidebarContent className="p-2">
                <SidebarGroup>
                    <SidebarGroupLabel className="text-white/50 text-[10px] font-semibold uppercase tracking-wider group-data-[collapsible=icon]:hidden">
                        {isGerman ? 'Arbeitsbereiche' : 'Workspace Views'}
                    </SidebarGroupLabel>
                    <SidebarMenu className="space-y-1">
                        {/* Primary Dashboard Link */}
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                isActive={isCurrentUrl('/dashboard')}
                                tooltip={{ children: primaryViewTitle }}
                                className={`h-10 rounded-md px-3 text-xs transition-colors cursor-pointer ${
                                    isCurrentUrl('/dashboard')
                                        ? 'bg-sidebar-accent text-white font-medium border-l-2 border-gov-interactive'
                                        : 'text-white/70 hover:bg-sidebar-accent hover:text-white'
                                }`}
                            >
                                <Link href={dashboard()}>
                                    <LayoutDashboard className="h-4 w-4 shrink-0" />
                                    <span className="group-data-[collapsible=icon]:hidden">{primaryViewTitle}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        {/* Super Admin: Platform Overseer Governance Links */}
                        {userRole === 'super_admin' && (
                            <>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isCurrentUrl('/admin/users', undefined, true)}
                                        tooltip={{ children: isGerman ? 'Benutzer- & Rollenverwaltung' : 'User & Role Governance' }}
                                        className={`h-10 rounded-md px-3 text-xs transition-colors cursor-pointer ${
                                            isCurrentUrl('/admin/users', undefined, true)
                                                ? 'bg-sidebar-accent text-white font-medium border-l-2 border-gov-interactive'
                                                : 'text-white/70 hover:bg-sidebar-accent hover:text-white'
                                        }`}
                                    >
                                        <Link href="/admin/users">
                                            <Shield className="h-4 w-4 shrink-0" />
                                            <span className="group-data-[collapsible=icon]:hidden">{isGerman ? 'Benutzer & Rollen' : 'User Governance'}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isCurrentUrl('/orders', undefined, true)}
                                        tooltip={{ children: isGerman ? 'Auftrags-Reichweite' : 'Order Runway Burndown' }}
                                        className={`h-10 rounded-md px-3 text-xs transition-colors cursor-pointer ${
                                            isCurrentUrl('/orders', undefined, true)
                                                ? 'bg-sidebar-accent text-white font-medium border-l-2 border-gov-interactive'
                                                : 'text-white/70 hover:bg-sidebar-accent hover:text-white'
                                        }`}
                                    >
                                        <Link href="/orders">
                                            <Activity className="h-4 w-4 shrink-0" />
                                            <span className="group-data-[collapsible=icon]:hidden">{isGerman ? 'Auftrags-Reichweite' : 'Order Runway'}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isCurrentUrl('/approvals', undefined, true)}
                                        tooltip={{ children: isGerman ? 'Leistungsnachweise' : 'Proof of Work Approvals' }}
                                        className={`h-10 rounded-md px-3 text-xs transition-colors cursor-pointer ${
                                            isCurrentUrl('/approvals', undefined, true)
                                                ? 'bg-sidebar-accent text-white font-medium border-l-2 border-gov-interactive'
                                                : 'text-white/70 hover:bg-sidebar-accent hover:text-white'
                                        }`}
                                    >
                                        <Link href="/approvals">
                                            <Scale className="h-4 w-4 shrink-0" />
                                            <span className="group-data-[collapsible=icon]:hidden">{isGerman ? 'Leistungsnachweise' : 'Approvals'}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isCurrentUrl('/purchasing/orders', undefined, true)}
                                        tooltip={{ children: isGerman ? 'Rahmen-Bestellungen' : 'Framework Orders' }}
                                        className={`h-10 rounded-md px-3 text-xs transition-colors cursor-pointer ${
                                            isCurrentUrl('/purchasing/orders', undefined, true)
                                                ? 'bg-sidebar-accent text-white font-medium border-l-2 border-gov-interactive'
                                                : 'text-white/70 hover:bg-sidebar-accent hover:text-white'
                                        }`}
                                    >
                                        <Link href="/purchasing/orders">
                                            <Layers className="h-4 w-4 shrink-0" />
                                            <span className="group-data-[collapsible=icon]:hidden">{isGerman ? 'Rahmen-Bestellungen' : 'Framework Orders'}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </>
                        )}

                        {/* Consultant: Unified Single-Page Workstation Anchors */}
                        {userRole === 'consultant' && (
                            <>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={{ children: isGerman ? 'Stunden buchen' : 'Daily Time Entry' }}
                                        className="h-10 rounded-md px-3 text-xs text-white/70 hover:bg-sidebar-accent hover:text-white transition-colors cursor-pointer"
                                    >
                                        <a href="/dashboard#booking-form">
                                            <Clock className="h-4 w-4 shrink-0" />
                                            <span className="group-data-[collapsible=icon]:hidden">{isGerman ? 'Stunden buchen' : 'Daily Time Entry'}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={{ children: isGerman ? 'Urlaubsplaner' : 'Planned Absences' }}
                                        className="h-10 rounded-md px-3 text-xs text-white/70 hover:bg-sidebar-accent hover:text-white transition-colors cursor-pointer"
                                    >
                                        <a href="/dashboard#vacation-manager">
                                            <Calendar className="h-4 w-4 shrink-0" />
                                            <span className="group-data-[collapsible=icon]:hidden">{isGerman ? 'Urlaubsplaner' : 'Planned Absences'}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={{ children: isGerman ? 'Buchungsübersicht' : 'Timesheet Ledger' }}
                                        className="h-10 rounded-md px-3 text-xs text-white/70 hover:bg-sidebar-accent hover:text-white transition-colors cursor-pointer"
                                    >
                                        <a href="/dashboard#ledger">
                                            <FileText className="h-4 w-4 shrink-0" />
                                            <span className="group-data-[collapsible=icon]:hidden">{isGerman ? 'Buchungsübersicht' : 'Timesheet Ledger'}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </>
                        )}

                        {/* Project Lead: Dedicated Views */}
                        {userRole === 'project_lead' && (
                            <>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isCurrentUrl('/orders', undefined, true)}
                                        tooltip={{ children: isGerman ? 'Auftrags-Reichweite' : 'Order Runway Burndown' }}
                                        className={`h-10 rounded-md px-3 text-xs transition-colors cursor-pointer ${
                                            isCurrentUrl('/orders', undefined, true)
                                                ? 'bg-sidebar-accent text-white font-medium border-l-2 border-gov-interactive'
                                                : 'text-white/70 hover:bg-sidebar-accent hover:text-white'
                                        }`}
                                    >
                                        <Link href="/orders">
                                            <Activity className="h-4 w-4 shrink-0" />
                                            <span className="group-data-[collapsible=icon]:hidden">{isGerman ? 'Auftrags-Reichweite' : 'Order Runway Burndown'}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isCurrentUrl('/approvals', undefined, true)}
                                        tooltip={{ children: isGerman ? 'Leistungsnachweise' : 'Proof of Work Approvals' }}
                                        className={`h-10 rounded-md px-3 text-xs transition-colors cursor-pointer ${
                                            isCurrentUrl('/approvals', undefined, true)
                                                ? 'bg-sidebar-accent text-white font-medium border-l-2 border-gov-interactive'
                                                : 'text-white/70 hover:bg-sidebar-accent hover:text-white'
                                        }`}
                                    >
                                        <Link href="/approvals">
                                            <Scale className="h-4 w-4 shrink-0" />
                                            <span className="group-data-[collapsible=icon]:hidden">{isGerman ? 'Leistungsnachweise' : 'Proof of Work Approvals'}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </>
                        )}

                        {/* Purchasing: Dedicated Views */}
                        {userRole === 'purchasing' && (
                            <>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isCurrentUrl('/purchasing/orders', undefined, true)}
                                        tooltip={{ children: isGerman ? 'Rahmen-Bestellungen' : 'Framework Orders' }}
                                        className={`h-10 rounded-md px-3 text-xs transition-colors cursor-pointer ${
                                            isCurrentUrl('/purchasing/orders', undefined, true)
                                                ? 'bg-sidebar-accent text-white font-medium border-l-2 border-gov-interactive'
                                                : 'text-white/70 hover:bg-sidebar-accent hover:text-white'
                                        }`}
                                    >
                                        <Link href="/purchasing/orders">
                                            <Layers className="h-4 w-4 shrink-0" />
                                            <span className="group-data-[collapsible=icon]:hidden">{isGerman ? 'Rahmen-Bestellungen' : 'Framework Orders'}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isCurrentUrl('/purchasing/invoices', undefined, true)}
                                        tooltip={{ children: isGerman ? 'Rechnungsbuch' : 'Invoice Ledger' }}
                                        className={`h-10 rounded-md px-3 text-xs transition-colors cursor-pointer ${
                                            isCurrentUrl('/purchasing/invoices', undefined, true)
                                                ? 'bg-sidebar-accent text-white font-medium border-l-2 border-gov-interactive'
                                                : 'text-white/70 hover:bg-sidebar-accent hover:text-white'
                                        }`}
                                    >
                                        <Link href="/purchasing/invoices">
                                            <FileText className="h-4 w-4 shrink-0" />
                                            <span className="group-data-[collapsible=icon]:hidden">{isGerman ? 'Rechnungsbuch' : 'Invoice Ledger'}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </>
                        )}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            {/* Footer with Role Authorization Tier Badge */}
            <SidebarFooter className="border-t border-sidebar-border p-2.5">
                <div className="group-data-[collapsible=icon]:hidden rounded-md bg-black/25 p-2.5 text-xs text-white/80">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-white/50 font-semibold">
                        <span>{isGerman ? 'Berechtigungsstufe' : 'Authorization Tier'}</span>
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    </div>
                    <div className="mt-1 font-medium text-xs text-white capitalize">
                        {roleTitle}
                    </div>
                    <div className="text-[11px] text-white/60 truncate">
                        {auth?.user?.name || auth?.user?.email}
                    </div>
                </div>

                <div className="mt-2">
                    <form method="POST" action="/logout" className="w-full">
                        <SidebarMenuButton
                            asChild
                            tooltip={{ children: isGerman ? 'Abmelden' : 'Sign Out' }}
                            className="h-9 w-full justify-center gap-1.5 rounded-md border border-white/10 bg-white/5 text-xs text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer group-data-[collapsible=icon]:p-0"
                        >
                            <button type="submit" className="w-full flex items-center justify-center gap-1.5">
                                <LogOut className="h-3.5 w-3.5 shrink-0" />
                                <span className="group-data-[collapsible=icon]:hidden">{isGerman ? 'Abmelden' : 'Sign Out'}</span>
                            </button>
                        </SidebarMenuButton>
                    </form>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
