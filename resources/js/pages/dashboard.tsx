import { Head } from "@inertiajs/react";
import ConsultantDashboard from "./dashboard/consultant";
import ProjectLeadDashboard from "./dashboard/project-lead";

export default function Dashboard(props: any) {
    const isConsultant = props.user?.role === "consultant";

    return (
        <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6">
            <Head
                title={
                    isConsultant ? "Consultant Portal" : "Project Lead Cockpit"
                }
            />
            {isConsultant ? (
                <ConsultantDashboard {...props} />
            ) : (
                <ProjectLeadDashboard {...props} />
            )}
        </div>
    );
}
