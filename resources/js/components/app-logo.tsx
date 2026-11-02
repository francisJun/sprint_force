import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2.5">
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-gov-interactive text-white shadow-xs">
                <AppLogoIcon className="size-5 text-white" />
            </div>
            <span className="truncate font-semibold text-sm text-white">
                HourRadar
            </span>
        </div>
    );
}
