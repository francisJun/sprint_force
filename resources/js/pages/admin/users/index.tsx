import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowUpDown,
    Check,
    CheckCircle2,
    Edit2,
    Eye,
    KeyRound,
    Lock,
    Plus,
    Search,
    Shield,
    Trash2,
    UserCheck,
    Users,
    X,
    Building2,
    Info,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/lib/i18n';
import { ChatbotDrawer } from '@/components/hourradar/ChatbotDrawer';

interface UserRecord {
    id: number;
    name: string;
    email: string;
    role: 'super_admin' | 'project_lead' | 'purchasing' | 'consultant';
    supplier_id: number | null;
    supplier_name: string | null;
    created_at: string;
}

interface SupplierItem {
    id: number;
    name: string;
}

interface PermissionRow {
    action: string;
    super_admin: boolean;
    project_lead: boolean;
    purchasing: boolean;
    consultant: boolean;
}

interface PaginatedUsers {
    data: UserRecord[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    users: PaginatedUsers;
    filters: {
        search: string;
        role: string;
    };
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
    suppliers: SupplierItem[];
    permissionsMatrix: PermissionRow[];
}

export default function AdminUsersIndex({
    users,
    filters,
    stats,
    suppliers,
    permissionsMatrix,
}: Props) {
    const { t, isGerman } = useTranslation();
    const { errors, flash } = usePage().props as any;

    const [search, setSearch] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || '');

    // Modal States
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isMatrixOpen, setIsMatrixOpen] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        id: 0,
        name: '',
        email: '',
        password: '',
        role: 'consultant' as 'super_admin' | 'project_lead' | 'purchasing' | 'consultant',
        supplier_id: '' as string | number,
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [userToDelete, setUserToDelete] = useState<UserRecord | null>(null);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/users',
            { search, role: roleFilter },
            { preserveState: true, replace: true }
        );
    };

    const handleRoleFilterChange = (newRole: string) => {
        setRoleFilter(newRole);
        router.get(
            '/admin/users',
            { search, role: newRole },
            { preserveState: true, replace: true }
        );
    };

    const openCreateModal = () => {
        setFormData({
            id: 0,
            name: '',
            email: '',
            password: '',
            role: 'consultant',
            supplier_id: suppliers.length > 0 ? suppliers[0].id : '',
        });
        setFormErrors({});
        setIsCreateOpen(true);
    };

    const openEditModal = (u: UserRecord) => {
        setFormData({
            id: u.id,
            name: u.name,
            email: u.email,
            password: '',
            role: u.role,
            supplier_id: u.supplier_id || (suppliers.length > 0 ? suppliers[0].id : ''),
        });
        setFormErrors({});
        setIsEditOpen(true);
    };

    const openDeleteModal = (u: UserRecord) => {
        setUserToDelete(u);
        setIsDeleteOpen(true);
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        setFormErrors({});
        router.post(
            '/admin/users',
            {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                supplier_id: formData.role === 'consultant' ? formData.supplier_id : null,
            },
            {
                onSuccess: () => {
                    setIsCreateOpen(false);
                },
                onError: (errs) => {
                    setFormErrors(errs);
                },
            }
        );
    };

    const submitUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        setFormErrors({});
        router.put(
            `/admin/users/${formData.id}`,
            {
                name: formData.name,
                email: formData.email,
                password: formData.password || undefined,
                role: formData.role,
                supplier_id: formData.role === 'consultant' ? formData.supplier_id : null,
            },
            {
                onSuccess: () => {
                    setIsEditOpen(false);
                },
                onError: (errs) => {
                    setFormErrors(errs);
                },
            }
        );
    };

    const submitDelete = () => {
        if (!userToDelete) return;
        router.delete(`/admin/users/${userToDelete.id}`, {
            onSuccess: () => {
                setIsDeleteOpen(false);
                setUserToDelete(null);
            },
        });
    };

    const roleBadgeStyles: Record<string, { label: string; bg: string; text: string; border: string }> = {
        super_admin: {
            label: isGerman ? 'Super Admin' : 'Super Admin',
            bg: 'bg-amber-500/10',
            text: 'text-amber-600 dark:text-amber-400',
            border: 'border-amber-500/20',
        },
        project_lead: {
            label: isGerman ? 'Projektleiter' : 'Project Lead',
            bg: 'bg-blue-500/10',
            text: 'text-blue-600 dark:text-blue-400',
            border: 'border-blue-500/20',
        },
        purchasing: {
            label: isGerman ? 'Einkauf' : 'Purchasing',
            bg: 'bg-emerald-500/10',
            text: 'text-emerald-600 dark:text-emerald-400',
            border: 'border-emerald-500/20',
        },
        consultant: {
            label: isGerman ? 'Berater' : 'Consultant',
            bg: 'bg-purple-500/10',
            text: 'text-purple-600 dark:text-purple-400',
            border: 'border-purple-500/20',
        },
    };

    return (
        <div className="flex h-full flex-1 flex-col p-4 md:p-6 bg-gov-canvas text-gov-text font-sans space-y-6">
            <Head title={`${t('admin.title')} - HourRadar`} />

            {/* Error or Success alerts */}
            {errors?.error && (
                <div className="rounded-sm border border-red-500/30 bg-red-500/10 p-3 text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{errors.error}</span>
                </div>
            )}
            {flash?.success && (
                <div className="rounded-sm border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{flash.success}</span>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gov-border pb-5">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gov-text">
                        {t('admin.title')}
                    </h1>
                    <p className="text-xs text-gov-muted">
                        {t('admin.subtitle')}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsMatrixOpen(true)}
                        className="group rounded-lg border-gov-border bg-gov-surface text-xs font-medium text-gov-text transition-all duration-150 hover:border-gov-interactive hover:bg-gov-interactive hover:text-white shadow-xs cursor-pointer"
                    >
                        <Shield className="mr-1.5 h-3.5 w-3.5 text-gov-interactive transition-colors duration-150 group-hover:text-white" />
                        {t('admin.rolesMatrix')}
                    </Button>
                    <Button
                        type="button"
                        onClick={openCreateModal}
                        className="rounded-lg bg-gov-interactive text-xs font-medium text-white hover:bg-gov-interactive-hover shadow-xs cursor-pointer"
                    >
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        {t('admin.addUser')}
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                <div className="rounded-lg border border-gov-border bg-gov-surface p-3 shadow-xs">
                    <div className="text-[11px] font-medium uppercase text-gov-muted">
                        {t('admin.totalUsers')}
                    </div>
                    <div className="mt-1 text-xl font-bold text-gov-text">
                        {stats.total_users}
                    </div>
                </div>
                <div className="rounded-lg border border-gov-border bg-gov-surface p-3 shadow-xs">
                    <div className="text-[11px] font-medium uppercase text-gov-muted">
                        Super Admin
                    </div>
                    <div className="mt-1 text-xl font-bold text-amber-600 dark:text-amber-400">
                        {stats.role_counts.super_admin}
                    </div>
                </div>
                <div className="rounded-lg border border-gov-border bg-gov-surface p-3 shadow-xs">
                    <div className="text-[11px] font-medium uppercase text-gov-muted">
                        {isGerman ? 'Projektleiter' : 'Project Leads'}
                    </div>
                    <div className="mt-1 text-xl font-bold text-blue-600 dark:text-blue-400">
                        {stats.role_counts.project_lead}
                    </div>
                </div>
                <div className="rounded-lg border border-gov-border bg-gov-surface p-3 shadow-xs">
                    <div className="text-[11px] font-medium uppercase text-gov-muted">
                        {isGerman ? 'Einkauf & Finanzen' : 'Procurement'}
                    </div>
                    <div className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">
                        {stats.role_counts.purchasing}
                    </div>
                </div>
                <div className="rounded-lg border border-gov-border bg-gov-surface p-3 shadow-xs col-span-2 sm:col-span-1">
                    <div className="text-[11px] font-medium uppercase text-gov-muted">
                        {isGerman ? 'Externe Berater' : 'Consultants'}
                    </div>
                    <div className="mt-1 text-xl font-bold text-purple-600 dark:text-purple-400">
                        {stats.role_counts.consultant}
                    </div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-gov-border bg-gov-surface p-3 shadow-xs">
                <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gov-muted" />
                    <Input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('admin.searchPlaceholder')}
                        className="pl-9 h-9 text-xs rounded-lg border-gov-border bg-gov-canvas"
                    />
                </form>
                <div className="flex items-center gap-2">
                    <Label htmlFor="role-filter" className="text-xs text-gov-muted whitespace-nowrap">
                        {t('common.filter')}:
                    </Label>
                    <select
                        id="role-filter"
                        value={roleFilter}
                        onChange={(e) => handleRoleFilterChange(e.target.value)}
                        className="h-9 rounded-lg border border-gov-border bg-gov-canvas px-3 text-xs text-gov-text focus:outline-hidden focus:ring-1 focus:ring-gov-interactive cursor-pointer"
                    >
                        <option value="">{t('admin.allRoles')}</option>
                        <option value="super_admin">Super Admin</option>
                        <option value="project_lead">{isGerman ? 'Projektleiter' : 'Project Lead'}</option>
                        <option value="purchasing">{isGerman ? 'Einkauf & Finanzen' : 'Procurement & Finance'}</option>
                        <option value="consultant">{isGerman ? 'Externer Berater' : 'External Consultant'}</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="rounded-lg border border-gov-border bg-gov-surface shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="border-b border-gov-border bg-gov-canvas/60 text-[11px] font-medium uppercase text-gov-muted">
                            <tr>
                                <th className="p-3 pl-4">{t('admin.name')}</th>
                                <th className="p-3">{t('admin.email')}</th>
                                <th className="p-3">{t('admin.role')}</th>
                                <th className="p-3">{t('admin.supplier')}</th>
                                <th className="p-3">{t('admin.created')}</th>
                                <th className="p-3 pr-4 text-right">{t('admin.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gov-border text-gov-text">
                            {users.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-xs text-gov-muted">
                                        {t('admin.noUsersFound')}
                                    </td>
                                </tr>
                            ) : (
                                users.data.map((u) => {
                                    const badge = roleBadgeStyles[u.role] || roleBadgeStyles.consultant;
                                    return (
                                        <tr key={u.id} className="hover:bg-gov-canvas/50 transition-colors">
                                            <td className="p-3 pl-4 font-medium flex items-center gap-2">
                                                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gov-canvas border border-gov-border text-[11px] font-bold text-gov-text uppercase">
                                                    {u.name.substring(0, 2)}
                                                </div>
                                                <span>{u.name}</span>
                                            </td>
                                            <td className="p-3 text-gov-muted font-mono text-[11px]">
                                                {u.email}
                                            </td>
                                            <td className="p-3">
                                                <span className={`inline-flex rounded-sm px-2 py-0.5 text-[10px] font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}>
                                                    {badge.label}
                                                </span>
                                            </td>
                                            <td className="p-3 text-gov-muted">
                                                {u.supplier_name || '—'}
                                            </td>
                                            <td className="p-3 text-gov-muted font-mono text-[11px]">
                                                {u.created_at || '—'}
                                            </td>
                                            <td className="p-3 pr-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openEditModal(u)}
                                                        className="h-7 px-2 text-[11px] text-gov-interactive hover:bg-gov-interactive/10 cursor-pointer"
                                                    >
                                                        <Edit2 className="h-3 w-3 mr-1" />
                                                        {t('common.details')}
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openDeleteModal(u)}
                                                        className="h-7 px-2 text-[11px] text-red-600 hover:bg-red-500/10 cursor-pointer"
                                                    >
                                                        <Trash2 className="h-3 w-3 mr-1" />
                                                        {t('common.delete')}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {users.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-gov-border p-3 text-xs text-gov-muted">
                        <span>
                            {isGerman
                                ? `Seite ${users.current_page} von ${users.last_page} (${users.total} Einträge)`
                                : `Page ${users.current_page} of ${users.last_page} (${users.total} records)`}
                        </span>
                        <div className="flex items-center gap-1">
                            {users.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    preserveScroll
                                    className={`rounded-sm px-2.5 py-1 text-xs ${
                                        link.active
                                            ? 'bg-gov-interactive text-white font-medium'
                                            : !link.url
                                            ? 'text-gov-muted/40 pointer-events-none'
                                            : 'border border-gov-border bg-gov-canvas text-gov-text hover:bg-gov-surface'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Create User Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-md bg-gov-surface text-gov-text border-gov-border">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-gov-text">
                            {t('admin.addUser')}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-gov-muted">
                            {isGerman
                                ? 'Neues Plattform-Konto anlegen und Zugriffsrolle zuweisen.'
                                : 'Provision a new platform user account and assign their access tier.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitCreate} className="space-y-4 pt-2">
                        <div className="space-y-1">
                            <Label htmlFor="create-name" className="text-xs font-medium text-gov-text">
                                {t('admin.name')}
                            </Label>
                            <Input
                                id="create-name"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Max Mustermann"
                                className="h-9 text-xs rounded-lg border-gov-border bg-gov-canvas"
                            />
                            {formErrors.name && (
                                <p className="text-[11px] text-red-500">{formErrors.name}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="create-email" className="text-xs font-medium text-gov-text">
                                {t('admin.email')}
                            </Label>
                            <Input
                                id="create-email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="name@company.de"
                                className="h-9 text-xs rounded-lg border-gov-border bg-gov-canvas"
                            />
                            {formErrors.email && (
                                <p className="text-[11px] text-red-500">{formErrors.email}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="create-password" className="text-xs font-medium text-gov-text">
                                {t('admin.password')}
                            </Label>
                            <Input
                                id="create-password"
                                type="password"
                                required
                                minLength={8}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                                className="h-9 text-xs rounded-lg border-gov-border bg-gov-canvas"
                            />
                            {formErrors.password && (
                                <p className="text-[11px] text-red-500">{formErrors.password}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="create-role" className="text-xs font-medium text-gov-text">
                                {t('admin.role')}
                            </Label>
                            <select
                                id="create-role"
                                required
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                className="w-full h-9 rounded-lg border border-gov-border bg-gov-canvas px-3 text-xs text-gov-text focus:ring-1 focus:ring-gov-interactive cursor-pointer"
                            >
                                <option value="super_admin">{isGerman ? 'Super-Admin (Plattform-Aufsicht)' : 'Super Admin (Platform Overseer)'}</option>
                                <option value="project_lead">{isGerman ? 'Projektleiter (Auftraggeber)' : 'Project Lead (Client Auftraggeber)'}</option>
                                <option value="purchasing">{isGerman ? 'Einkauf & Finanzen' : 'Procurement & Finance'}</option>
                                <option value="consultant">{isGerman ? 'Externer Berater (Dienstleister)' : 'External Consultant (Dienstleister)'}</option>
                            </select>
                            {formErrors.role && (
                                <p className="text-[11px] text-red-500">{formErrors.role}</p>
                            )}
                        </div>

                        {formData.role === 'consultant' && (
                            <div className="space-y-1">
                                <Label htmlFor="create-supplier" className="text-xs font-medium text-gov-text">
                                    {t('admin.supplier')}
                                </Label>
                                <select
                                    id="create-supplier"
                                    required
                                    value={formData.supplier_id}
                                    onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                                    className="w-full h-9 rounded-lg border border-gov-border bg-gov-canvas px-3 text-xs text-gov-text focus:ring-1 focus:ring-gov-interactive cursor-pointer"
                                >
                                    <option value="">{t('admin.selectSupplier')}</option>
                                    {suppliers.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.supplier_id && (
                                    <p className="text-[11px] text-red-500">{formErrors.supplier_id}</p>
                                )}
                            </div>
                        )}

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateOpen(false)}
                                className="text-xs"
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button
                                type="submit"
                                className="rounded-lg bg-gov-interactive text-xs font-medium text-white hover:bg-gov-interactive-hover"
                            >
                                {t('admin.createUser')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-md bg-gov-surface text-gov-text border-gov-border">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-gov-text">
                            {t('admin.editUser')}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-gov-muted">
                            {isGerman
                                ? 'Benutzerdaten oder Plattform-Rolle aktualisieren.'
                                : 'Update user profile, credentials, or assigned authorization tier.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitUpdate} className="space-y-4 pt-2">
                        <div className="space-y-1">
                            <Label htmlFor="edit-name" className="text-xs font-medium text-gov-text">
                                {t('admin.name')}
                            </Label>
                            <Input
                                id="edit-name"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="h-9 text-xs rounded-lg border-gov-border bg-gov-canvas"
                            />
                            {formErrors.name && (
                                <p className="text-[11px] text-red-500">{formErrors.name}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="edit-email" className="text-xs font-medium text-gov-text">
                                {t('admin.email')}
                            </Label>
                            <Input
                                id="edit-email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="h-9 text-xs rounded-lg border-gov-border bg-gov-canvas"
                            />
                            {formErrors.email && (
                                <p className="text-[11px] text-red-500">{formErrors.email}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="edit-password" className="text-xs font-medium text-gov-text">
                                {t('admin.passwordOptional')}
                            </Label>
                            <Input
                                id="edit-password"
                                type="password"
                                minLength={8}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                                className="h-9 text-xs rounded-lg border-gov-border bg-gov-canvas"
                            />
                            {formErrors.password && (
                                <p className="text-[11px] text-red-500">{formErrors.password}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="edit-role" className="text-xs font-medium text-gov-text">
                                {t('admin.role')}
                            </Label>
                            <select
                                id="edit-role"
                                required
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                className="w-full h-9 rounded-lg border border-gov-border bg-gov-canvas px-3 text-xs text-gov-text focus:ring-1 focus:ring-gov-interactive cursor-pointer"
                            >
                                <option value="super_admin">{isGerman ? 'Super-Admin (Plattform-Aufsicht)' : 'Super Admin (Platform Overseer)'}</option>
                                <option value="project_lead">{isGerman ? 'Projektleiter (Auftraggeber)' : 'Project Lead (Client Auftraggeber)'}</option>
                                <option value="purchasing">{isGerman ? 'Einkauf & Finanzen' : 'Procurement & Finance'}</option>
                                <option value="consultant">{isGerman ? 'Externer Berater (Dienstleister)' : 'External Consultant (Dienstleister)'}</option>
                            </select>
                            {formErrors.role && (
                                <p className="text-[11px] text-red-500">{formErrors.role}</p>
                            )}
                        </div>

                        {formData.role === 'consultant' && (
                            <div className="space-y-1">
                                <Label htmlFor="edit-supplier" className="text-xs font-medium text-gov-text">
                                    {t('admin.supplier')}
                                </Label>
                                <select
                                    id="edit-supplier"
                                    required
                                    value={formData.supplier_id}
                                    onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                                    className="w-full h-9 rounded-lg border border-gov-border bg-gov-canvas px-3 text-xs text-gov-text focus:ring-1 focus:ring-gov-interactive cursor-pointer"
                                >
                                    <option value="">{t('admin.selectSupplier')}</option>
                                    {suppliers.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.supplier_id && (
                                    <p className="text-[11px] text-red-500">{formErrors.supplier_id}</p>
                                )}
                            </div>
                        )}

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditOpen(false)}
                                className="text-xs"
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button
                                type="submit"
                                className="rounded-lg bg-gov-interactive text-xs font-medium text-white hover:bg-gov-interactive-hover"
                            >
                                {t('admin.saveChanges')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="sm:max-w-md bg-gov-surface text-gov-text border-gov-border">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            {t('admin.deleteUser')}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-gov-muted">
                            {userToDelete && (
                                <span>
                                    {t('admin.deleteConfirm', { name: userToDelete.name })}
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="pt-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDeleteOpen(false)}
                            className="text-xs"
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            type="button"
                            onClick={submitDelete}
                            className="rounded-lg bg-red-600 text-xs font-medium text-white hover:bg-red-700"
                        >
                            {t('common.delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Roles & Permissions Matrix Dialog */}
            <Dialog open={isMatrixOpen} onOpenChange={setIsMatrixOpen}>
                <DialogContent className="sm:max-w-3xl bg-gov-surface text-gov-text border-gov-border max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <span className="rounded-sm bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                RBAC Matrix
                            </span>
                        </div>
                        <DialogTitle className="text-base font-bold text-gov-text">
                            {t('admin.rolesMatrix')}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-gov-muted">
                            {t('admin.rolesMatrixDesc')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-3 rounded-lg border border-gov-border overflow-hidden">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-gov-border bg-gov-canvas/80 text-[11px] font-medium uppercase text-gov-muted">
                                <tr>
                                    <th className="p-3 pl-4">{t('admin.actionColumn')}</th>
                                    <th className="p-3 text-center">{t('admin.superAdmin')}</th>
                                    <th className="p-3 text-center">{t('admin.projectLead')}</th>
                                    <th className="p-3 text-center">{t('admin.purchasing')}</th>
                                    <th className="p-3 text-center pr-4">{t('admin.consultant')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gov-border text-gov-text">
                                {permissionsMatrix.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-gov-canvas/40 transition-colors">
                                        <td className="p-3 pl-4 font-medium text-gov-text">
                                            {row.action}
                                        </td>
                                        <td className="p-3 text-center">
                                            {row.super_admin ? (
                                                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-600">
                                                    <Check className="h-3.5 w-3.5" />
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500/10 text-red-500">
                                                    <X className="h-3 w-3" />
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-3 text-center">
                                            {row.project_lead ? (
                                                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-600">
                                                    <Check className="h-3.5 w-3.5" />
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500/10 text-red-500">
                                                    <X className="h-3 w-3" />
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-3 text-center">
                                            {row.purchasing ? (
                                                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-600">
                                                    <Check className="h-3.5 w-3.5" />
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500/10 text-red-500">
                                                    <X className="h-3 w-3" />
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-3 text-center pr-4">
                                            {row.consultant ? (
                                                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-600">
                                                    <Check className="h-3.5 w-3.5" />
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500/10 text-red-500">
                                                    <X className="h-3 w-3" />
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-3 rounded-md bg-gov-canvas border border-gov-border p-3 text-[11px] text-gov-muted flex items-start gap-2">
                        <Info className="h-4 w-4 text-gov-interactive shrink-0 mt-0.5" />
                        <span>
                            {isGerman
                                ? 'Alle Zugriffsberechtigungen werden strikt serverseitig über Richtlinien und Autorisierungsprüfungen erzwungen. Die Benutzeroberfläche spiegelt die verifizierten Zugriffsebenen wider.'
                                : 'All authorization checks are strictly enforced server-side via granular security policies. The client interface strictly reflects verified role privileges.'}
                        </span>
                    </div>

                    <DialogFooter className="pt-3">
                        <Button
                            type="button"
                            onClick={() => setIsMatrixOpen(false)}
                            className="rounded-lg bg-gov-interactive text-xs font-medium text-white"
                        >
                            {t('common.close')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Embedded Chatbot Drawer */}
            <ChatbotDrawer />
        </div>
    );
}
