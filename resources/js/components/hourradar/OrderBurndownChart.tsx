import React, { useState, useId } from 'react';
import { AlertTriangle, CheckCircle2, TrendingDown, Calendar, Clock, Shield } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export interface BurndownPoint {
    date: string;
    label: string;
    ideal_pd: number;
    actual_pd: number | null;
    projected_pd: number | null;
    is_today: boolean;
    is_reorder_window: boolean;
}

interface OrderBurndownChartProps {
    totalPersonDays: number;
    usedPersonDays: number;
    remainingPersonDays: number;
    weeklyBurnRate: number;
    forecastedEndDate: string;
    targetEndDate: string;
    needsReorderAlert: boolean;
    daysUntilReorder: number;
    reorderDeadlineDate?: string;
    series?: BurndownPoint[];
}

export function OrderBurndownChart({
    totalPersonDays,
    usedPersonDays,
    remainingPersonDays,
    weeklyBurnRate,
    forecastedEndDate,
    targetEndDate,
    needsReorderAlert,
    daysUntilReorder,
    reorderDeadlineDate,
    series = [],
}: OrderBurndownChartProps) {
    const chartId = useId();
    const { t, isGerman } = useTranslation();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // If series is empty, generate a fallback 10-point trajectory
    const dataPoints: BurndownPoint[] = series.length > 0
        ? series
        : [
            { date: 'Start', label: 'W1', ideal_pd: totalPersonDays, actual_pd: totalPersonDays, projected_pd: null, is_today: false, is_reorder_window: false },
            { date: 'Mid', label: 'Today', ideal_pd: totalPersonDays * 0.5, actual_pd: remainingPersonDays, projected_pd: remainingPersonDays, is_today: true, is_reorder_window: needsReorderAlert },
            { date: 'End', label: 'Horizon', ideal_pd: 0, actual_pd: null, projected_pd: 0, is_today: false, is_reorder_window: true },
        ];

    // Chart dimensions (wide aspect ratio for expansive modal viewing)
    const width = 760;
    const height = 250;
    const padding = { top: 30, right: 40, bottom: 38, left: 55 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const maxPd = Math.max(totalPersonDays, ...dataPoints.map((p) => Math.max(p.ideal_pd, p.actual_pd ?? 0, p.projected_pd ?? 0))) * 1.05;

    // Coordinate conversion
    const getX = (index: number) => {
        if (dataPoints.length <= 1) return padding.left;
        return padding.left + (index / (dataPoints.length - 1)) * chartWidth;
    };

    const getY = (val: number) => {
        return padding.top + chartHeight - (val / (maxPd || 1)) * chartHeight;
    };

    // Ideal Line Path (SVG string)
    const idealPath = dataPoints
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.ideal_pd)}`)
        .join(' ');

    // Actual Line Path (only where actual_pd is not null)
    const actualPoints = dataPoints
        .map((p, i) => ({ point: p, index: i }))
        .filter((item) => item.point.actual_pd !== null);

    const actualPath = actualPoints
        .map((item, i) => `${i === 0 ? 'M' : 'L'} ${getX(item.index)} ${getY(item.point.actual_pd!)}`)
        .join(' ');

    // Actual Area Fill Path
    const actualAreaPath = actualPoints.length > 0
        ? `${actualPath} L ${getX(actualPoints[actualPoints.length - 1].index)} ${padding.top + chartHeight} L ${getX(actualPoints[0].index)} ${padding.top + chartHeight} Z`
        : '';

    // Projected Line Path (where projected_pd is not null)
    const projectedPoints = dataPoints
        .map((p, i) => ({ point: p, index: i }))
        .filter((item) => item.point.projected_pd !== null);

    const projectedPath = projectedPoints
        .map((item, i) => `${i === 0 ? 'M' : 'L'} ${getX(item.index)} ${getY(item.point.projected_pd!)}`)
        .join(' ');

    // Find Re-order Horizon start index
    const reorderStartIndex = dataPoints.findIndex((p) => p.is_reorder_window);
    const reorderStartX = reorderStartIndex !== -1 ? getX(reorderStartIndex) : null;

    // Today index
    const todayIndex = dataPoints.findIndex((p) => p.is_today);
    const todayX = todayIndex !== -1 ? getX(todayIndex) : null;

    // Determine which X-axis milestone labels to display to avoid crowding
    const totalPoints = dataPoints.length;
    const stride = totalPoints > 28 ? 4 : totalPoints > 14 ? 2 : 1;

    const shouldShowLabel = (index: number) => {
        const point = dataPoints[index];
        // Always show the Today milestone
        if (point.is_today) return true;
        // Always show first and last week milestones
        if (index === 0 || index === totalPoints - 1) return true;

        // Skip non-stride indices
        if (index % stride !== 0) return false;

        const currentX = getX(index);

        // Keep a 36px clearance zone around the 'Today' marker to prevent overlap
        if (todayX !== null && Math.abs(currentX - todayX) < 36) {
            return false;
        }

        // Keep clearance from the edges (W1 and W_last)
        const firstX = getX(0);
        const lastX = getX(totalPoints - 1);
        if (Math.abs(currentX - firstX) < 32 || Math.abs(currentX - lastX) < 32) {
            return false;
        }

        return true;
    };

    // Y Axis Ticks (4 levels: 0, 33%, 66%, 100%)
    const yTicks = [0, maxPd * 0.33, maxPd * 0.66, maxPd];

    // Active hovered point
    const activePoint = hoveredIndex !== null ? dataPoints[hoveredIndex] : null;

    return (
        <div className="space-y-4">
            {/* Quick Runway Summary Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 rounded-lg border border-gov-border bg-gov-canvas p-3 font-mono text-xs">
                <div>
                    <span className="text-[10px] text-gov-muted uppercase block">{t("burndown.initialBudget")}</span>
                    <span className="font-semibold text-gov-text tabular-nums">{totalPersonDays.toFixed(1)} {t("common.pd")}</span>
                </div>
                <div>
                    <span className="text-[10px] text-gov-muted uppercase block">{t("common.remaining")}</span>
                    <span className="font-semibold text-gov-interactive tabular-nums">{remainingPersonDays.toFixed(1)} {t("common.pd")}</span>
                </div>
                <div>
                    <span className="text-[10px] text-gov-muted uppercase block">{t("burndown.weeklyBurn")}</span>
                    <span className="font-semibold text-gov-text tabular-nums">{weeklyBurnRate.toFixed(1)} {t("common.pd")}/wk</span>
                </div>
                <div>
                    <span className="text-[10px] text-gov-muted uppercase block">{t("burndown.exhaustionExpected")}</span>
                    <span className={`font-semibold tabular-nums ${needsReorderAlert ? 'text-gov-warning-text' : 'text-gov-text'}`}>
                        {forecastedEndDate}
                    </span>
                </div>
            </div>

            {/* Interactive Chart Container */}
            <div className="relative rounded-lg border border-gov-border bg-gov-canvas p-3.5 shadow-2xs overflow-hidden">
                {/* Header Legend */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gov-border text-[11px]">
                    <div className="flex items-center gap-1.5 font-semibold text-gov-text">
                        <TrendingDown className="h-4 w-4 text-gov-interactive" />
                        <span>{t("burndown.title")}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-gov-muted">
                        <div className="flex items-center gap-1.5">
                            <span className="h-0.5 w-3.5 border-b-2 border-dashed border-gov-border inline-block" />
                            <span>{t("burndown.plannedTarget")}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="h-0.5 w-3.5 bg-gov-interactive inline-block" />
                            <span className="text-gov-text font-medium">{t("burndown.actualVerified")}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="h-0.5 w-3.5 border-b-2 border-dashed border-gov-warning-text inline-block" />
                            <span className="text-gov-warning-text">{t("burndown.forecastedRunway")}</span>
                        </div>
                        {reorderStartX !== null && (
                            <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-xs bg-gov-warning-bg border border-gov-warning-border inline-block" />
                                <span className="text-gov-warning-text">{t("burndown.reorderZone")}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* SVG Visual Canvas */}
                <div className="relative mt-2 w-full">
                    <svg
                        viewBox={`0 0 ${width} ${height}`}
                        className="w-full h-auto overflow-visible select-none"
                    >
                        <defs>
                            <linearGradient id={`actualGradient-${chartId}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--gov-interactive)" stopOpacity="0.25" />
                                <stop offset="100%" stopColor="var(--gov-interactive)" stopOpacity="0.0" />
                            </linearGradient>
                            <linearGradient id={`reorderGradient-${chartId}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--gov-warning-text)" stopOpacity="0.12" />
                                <stop offset="100%" stopColor="var(--gov-warning-text)" stopOpacity="0.02" />
                            </linearGradient>
                        </defs>

                        {/* Background Grid Lines (Y-Axis) */}
                        {yTicks.map((tick, i) => {
                            const y = getY(tick);
                            return (
                                <g key={i}>
                                    <line
                                        x1={padding.left}
                                        y1={y}
                                        x2={width - padding.right}
                                        y2={y}
                                        stroke="var(--gov-border)"
                                        strokeWidth="1"
                                        strokeDasharray="2 2"
                                    />
                                    <text
                                        x={padding.left - 8}
                                        y={y + 3}
                                        textAnchor="end"
                                        className="fill-gov-muted font-mono text-[9px] tabular-nums"
                                    >
                                        {tick.toFixed(0)} PD
                                    </text>
                                </g>
                            );
                        })}

                        {/* Re-Order Horizon Shaded Zone */}
                        {reorderStartX !== null && (
                            <g>
                                <rect
                                    x={reorderStartX}
                                    y={padding.top}
                                    width={width - padding.right - reorderStartX}
                                    height={chartHeight}
                                    fill={`url(#reorderGradient-${chartId})`}
                                />
                                <line
                                    x1={reorderStartX}
                                    y1={padding.top}
                                    x2={reorderStartX}
                                    y2={padding.top + chartHeight}
                                    stroke="var(--gov-warning-text)"
                                    strokeWidth="1.5"
                                    strokeDasharray="3 3"
                                />
                                <text
                                    x={reorderStartX + 4}
                                    y={padding.top + 10}
                                    className="fill-gov-warning-text font-mono text-[8px] uppercase font-semibold"
                                >
                                    {t("burndown.reorderNotice")}
                                </text>
                            </g>
                        )}

                        {/* Today Marker Line & Top Badge */}
                        {todayX !== null && (
                            <g>
                                <line
                                    x1={todayX}
                                    y1={padding.top}
                                    x2={todayX}
                                    y2={padding.top + chartHeight}
                                    stroke="var(--gov-text)"
                                    strokeWidth="1.5"
                                    strokeDasharray="2 2"
                                    opacity="0.35"
                                />
                                <rect
                                    x={todayX - 22}
                                    y={padding.top - 18}
                                    width={44}
                                    height={15}
                                    rx={3}
                                    fill="var(--gov-surface)"
                                    stroke="var(--gov-border)"
                                    strokeWidth="1"
                                />
                                <text
                                    x={todayX}
                                    y={padding.top - 7}
                                    textAnchor="middle"
                                    className="fill-gov-text font-mono text-[8.5px] font-bold tracking-wider"
                                >
                                    {isGerman ? 'HEUTE' : 'TODAY'}
                                </text>
                            </g>
                        )}

                        {/* Actual Area Under Curve */}
                        {actualAreaPath && (
                            <path
                                d={actualAreaPath}
                                fill={`url(#actualGradient-${chartId})`}
                            />
                        )}

                        {/* Ideal Planned Trajectory (Dashed Gray) */}
                        <path
                            d={idealPath}
                            fill="none"
                            stroke="var(--gov-muted)"
                            strokeWidth="1.5"
                            strokeDasharray="4 4"
                            opacity="0.7"
                        />

                        {/* Projected Runway Trajectory (Dashed Warning/Accent) */}
                        {projectedPath && (
                            <path
                                d={projectedPath}
                                fill="none"
                                stroke="var(--gov-warning-text)"
                                strokeWidth="2"
                                strokeDasharray="4 3"
                            />
                        )}

                        {/* Actual Verified Trajectory (Solid Blue) */}
                        {actualPath && (
                            <path
                                d={actualPath}
                                fill="none"
                                stroke="var(--gov-interactive)"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        )}

                        {/* Data Point Markers & Interactive Touch Targets */}
                        {dataPoints.map((p, i) => {
                            const x = getX(i);
                            const y = getY(p.actual_pd ?? p.projected_pd ?? p.ideal_pd);
                            const isHovered = hoveredIndex === i;

                            return (
                                <g
                                    key={i}
                                    className="cursor-pointer"
                                    onMouseEnter={() => setHoveredIndex(i)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                >
                                    {/* Invisible expanded hit target */}
                                    <rect
                                        x={x - 12}
                                        y={padding.top}
                                        width={24}
                                        height={chartHeight}
                                        fill="transparent"
                                    />

                                    {/* Circle dot on actual point */}
                                    {p.actual_pd !== null && (
                                        <circle
                                            cx={x}
                                            cy={getY(p.actual_pd)}
                                            r={isHovered ? 5 : 3.5}
                                            fill="var(--gov-surface)"
                                            stroke="var(--gov-interactive)"
                                            strokeWidth={isHovered ? 2.5 : 2}
                                            className="transition-all"
                                        />
                                    )}

                                    {/* Circle dot on projected point */}
                                    {p.projected_pd !== null && p.actual_pd === null && (
                                        <circle
                                            cx={x}
                                            cy={getY(p.projected_pd)}
                                            r={isHovered ? 4.5 : 3}
                                            fill="var(--gov-surface)"
                                            stroke="var(--gov-warning-text)"
                                            strokeWidth="2"
                                            className="transition-all"
                                        />
                                    )}

                                    {/* X-Axis Milestone Label with Intelligent Clearance */}
                                    {shouldShowLabel(i) && (
                                        p.is_today ? (
                                            <g>
                                                <rect
                                                    x={x - 20}
                                                    y={padding.top + chartHeight + 6}
                                                    width={40}
                                                    height={16}
                                                    rx={3}
                                                    fill="var(--gov-interactive)"
                                                    opacity="0.12"
                                                />
                                                <rect
                                                    x={x - 20}
                                                    y={padding.top + chartHeight + 6}
                                                    width={40}
                                                    height={16}
                                                    rx={3}
                                                    fill="none"
                                                    stroke="var(--gov-interactive)"
                                                    strokeWidth="1"
                                                    opacity="0.4"
                                                />
                                                <text
                                                    x={x}
                                                    y={padding.top + chartHeight + 17}
                                                    textAnchor="middle"
                                                    className="fill-gov-interactive font-mono text-[9px] font-bold tracking-wider uppercase"
                                                >
                                                    {isGerman ? 'Heute' : 'Today'}
                                                </text>
                                            </g>
                                        ) : (
                                            <text
                                                x={x}
                                                y={padding.top + chartHeight + 17}
                                                textAnchor="middle"
                                                className={`font-mono text-[9px] tabular-nums ${
                                                    isHovered ? 'fill-gov-text font-semibold' : 'fill-gov-muted'
                                                }`}
                                            >
                                                {p.label}
                                            </text>
                                        )
                                    )}
                                </g>
                            );
                        })}
                    </svg>

                    {/* Interactive Floating Tooltip */}
                    {activePoint && hoveredIndex !== null && (
                        <div
                            className="absolute pointer-events-none rounded-md border border-gov-border bg-gov-surface p-2.5 shadow-md text-xs font-mono z-10 space-y-1 transition-all"
                            style={{
                                left: `${Math.min(80, Math.max(10, (hoveredIndex / (dataPoints.length - 1)) * 100))}%`,
                                top: '8px',
                                transform: 'translateX(-50%)',
                            }}
                        >
                            <div className="font-semibold text-gov-text border-b border-gov-border pb-1 flex items-center justify-between gap-3 text-[11px]">
                                <span>{activePoint.label} ({activePoint.date})</span>
                                {activePoint.is_today && (
                                    <span className="rounded-xs bg-gov-interactive/10 text-gov-interactive px-1.5 py-0.2 text-[9px] uppercase font-bold">
                                        Current
                                    </span>
                                )}
                            </div>

                            <div className="space-y-0.5 text-[11px] pt-0.5">
                                {activePoint.actual_pd !== null && (
                                    <div className="flex justify-between gap-4 text-gov-text">
                                        <span className="text-gov-muted">Actual Remaining:</span>
                                        <span className="font-bold tabular-nums">{activePoint.actual_pd.toFixed(1)} PD</span>
                                    </div>
                                )}
                                {activePoint.projected_pd !== null && activePoint.actual_pd === null && (
                                    <div className="flex justify-between gap-4 text-gov-warning-text">
                                        <span>Projected Runway:</span>
                                        <span className="font-bold tabular-nums">{activePoint.projected_pd.toFixed(1)} PD</span>
                                    </div>
                                )}
                                <div className="flex justify-between gap-4 text-gov-muted">
                                    <span>Planned Target:</span>
                                    <span className="tabular-nums">{activePoint.ideal_pd.toFixed(1)} PD</span>
                                </div>
                                {activePoint.actual_pd !== null && (
                                    <div className="flex justify-between gap-4 text-[10px] pt-1 border-t border-gov-border">
                                        <span className="text-gov-muted">Variance:</span>
                                        <span className={`font-semibold tabular-nums ${
                                            activePoint.actual_pd >= activePoint.ideal_pd ? 'text-gov-success-text' : 'text-gov-warning-text'
                                        }`}>
                                            {(activePoint.actual_pd - activePoint.ideal_pd) >= 0 ? '+' : ''}
                                            {(activePoint.actual_pd - activePoint.ideal_pd).toFixed(1)} PD
                                            {(activePoint.actual_pd >= activePoint.ideal_pd) ? ' (Under Burn)' : ' (Accelerated)'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Schedule Alignment Diagnosis */}
            <div className={`rounded-lg border p-3 text-xs flex items-start gap-2.5 ${
                needsReorderAlert
                    ? 'border-gov-warning-border bg-gov-warning-bg text-gov-warning-text'
                    : 'border-gov-success-border bg-gov-success-bg text-gov-success-text'
            }`}>
                {needsReorderAlert ? (
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                ) : (
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                )}
                <div>
                    <strong className="font-semibold block uppercase tracking-wider text-[11px]">
                        {needsReorderAlert
                            ? (isGerman ? 'Beschaffungs-Vorlaufzeit erreicht' : 'Procurement Lead-Time Radar Active')
                            : (isGerman ? 'Budgetreichweite: Nominaler Zielpfad' : 'Runway Health: Nominal Trajectory')}
                    </strong>
                    <p className="mt-0.5 leading-relaxed text-[11px]">
                        {needsReorderAlert
                            ? (isGerman
                                ? `Die Budgeterschöpfung wird für den ${forecastedEndDate} prognostiziert. Das 28-Tage-Vorlaufenfenster für die Nachbestellung ist erreicht (${daysUntilReorder} Tage bis zur Frist). Bitte Nachbestellung einleiten.`
                                : `Exhaustion is forecasted for ${forecastedEndDate}. The 28-day advance call-off horizon is reached (${daysUntilReorder} days to procurement deadline). Initiate follow-up framework PO.`)
                            : (isGerman
                                ? `Beim aktuellen Abbrand von ${weeklyBurnRate.toFixed(1)} PT/Woche deckt das Restbudget die Erbringung bis zum ${forecastedEndDate} ab und erfüllt das Zielvertragsdatum (${targetEndDate}).`
                                : `At the rolling pace of ${weeklyBurnRate.toFixed(1)} PD/week, remaining capital covers delivery through ${forecastedEndDate}, satisfying the target contract date (${targetEndDate}).`)}
                    </p>
                </div>
            </div>
        </div>
    );
}
