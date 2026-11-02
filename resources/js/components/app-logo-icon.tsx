import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="HourRadar Logo"
        >
            {/* Outer Precision Dial */}
            <circle cx="20" cy="20" r="16.5" stroke="currentColor" strokeWidth="2.5" />

            {/* Concentric Radar Ring */}
            <circle
                cx="20"
                cy="20"
                r="10.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="2.5 2.5"
                opacity="0.6"
            />

            {/* Cardinal Navigation Ticks */}
            <line x1="20" y1="3.5" x2="20" y2="7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="20" y1="32.5" x2="20" y2="36.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="3.5" y1="20" x2="7.5" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="32.5" y1="20" x2="36.5" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

            {/* Radar Sweep / Hour Hand */}
            <line x1="20" y1="20" x2="29" y2="11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />

            {/* Center Precision Target Hub */}
            <circle cx="20" cy="20" r="2.75" fill="currentColor" />
        </svg>
    );
}
