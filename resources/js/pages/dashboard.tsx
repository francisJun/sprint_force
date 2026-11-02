import { Head } from '@inertiajs/react';
import ConsultantDashboard from './dashboard/consultant';
import ProjectLeadDashboard from './dashboard/project-lead';
import PurchasingDashboard from './dashboard/purchasing';
import SuperAdminDashboard from './dashboard/super-admin';

export default function Dashboard(props: any) {
    const role = props.user?.role;

    return (
        <div className="flex h-full flex-1 flex-col p-4 md:p-6 bg-gov-canvas text-gov-text">
            <Head
                title={
                    role === 'super_admin'
                        ? 'Platform Overseer Cockpit - HourRadar'
                        : role === 'consultant'
                        ? 'Consultant Workstation - HourRadar'
                        : role === 'purchasing'
                        ? 'Procurement & Finance Radar - HourRadar'
                        : 'Project Lead Cockpit - HourRadar'
                }
            />
            {role === 'super_admin' ? (
                <SuperAdminDashboard {...props} />
            ) : role === 'consultant' ? (
                <ConsultantDashboard {...props} />
            ) : role === 'purchasing' ? (
                <PurchasingDashboard {...props} />
            ) : (
                <ProjectLeadDashboard {...props} />
            )}
        </div>
    );
}
