import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Farmer } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Phone,
    User,
    Users,
    Home,
    Briefcase,
    GraduationCap,
    Heart,
    Award,
    Package,
    Sprout,
    TrendingDown,
    QrCode,
    Star,
    Leaf,
    BarChart3,
    CheckCircle2,
    Clock,
    AlertTriangle,
    XCircle,
    TreePine,
    Activity,
    Gift,
    LayoutGrid,
    Layers,
    Pencil,
    Printer,
    MoreHorizontal,
    Copy,
    Check,
    ExternalLink,
    Maximize2,
    Plus,
    Minus,
    ArrowRight,
    History,
    LineChart,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Farmers', href: '/admin/farmers' },
    { title: 'Farmer Profile', href: '#' },
];

// ── helpers ────────────────────────────────────────────────────────────────

function fmt(date?: string | null, opts?: Intl.DateTimeFormatOptions) {
    if (!date) return '—';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', opts ?? {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function fmtShort(date?: string | null) {
    return fmt(date, { year: 'numeric', month: 'short', day: 'numeric' });
}

function getAge(birthdate?: string | null): number | null {
    if (!birthdate) return null;
    const dob = new Date(birthdate);
    if (isNaN(dob.getTime())) return null;
    const diff = Date.now() - dob.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function peso(val?: string | number | null) {
    if (!val) return '—';
    return `₱${parseFloat(String(val)).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
}

function capWords(s?: string | null) {
    if (!s) return '—';
    return s
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
}

// ── Tier config ────────────────────────────────────────────────────────────

function getTier(points: number) {
    if (points >= 1000) {
        return {
            label: 'Gold',
            emoji: '🥇',
            color: 'text-amber-700 dark:text-amber-300',
            bg: 'bg-amber-50 dark:bg-amber-950/60',
            border: 'border-amber-200 dark:border-amber-800',
        };
    }
    if (points >= 500) {
        return {
            label: 'Silver',
            emoji: '🥈',
            color: 'text-slate-700 dark:text-slate-300',
            bg: 'bg-slate-100 dark:bg-slate-800',
            border: 'border-slate-200 dark:border-slate-700',
        };
    }
    if (points >= 200) {
        return {
            label: 'Bronze',
            emoji: '🥉',
            color: 'text-orange-700 dark:text-orange-300',
            bg: 'bg-orange-50 dark:bg-orange-950/60',
            border: 'border-orange-200 dark:border-orange-800',
        };
    }
    return {
        label: 'Seedling',
        emoji: '🌱',
        color: 'text-emerald-700 dark:text-emerald-300',
        bg: 'bg-emerald-50 dark:bg-emerald-950/60',
        border: 'border-emerald-200 dark:border-emerald-800',
    };
}

const STATUS_MAP: Record<string, { label: string; icon: React.ElementType; className: string }> = {
    received: { label: 'Received', icon: CheckCircle2, className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    active: { label: 'Active', icon: CheckCircle2, className: 'bg-emerald-100/90 text-emerald-800 border-emerald-200' },
    pending: { label: 'Pending', icon: Clock, className: 'bg-amber-50 text-amber-700 border-amber-200' },
    validated: { label: 'Validated', icon: CheckCircle2, className: 'bg-sky-50 text-sky-700 border-sky-200' },
    verified: { label: 'Verified', icon: CheckCircle2, className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    for_review: { label: 'For Review', icon: Clock, className: 'bg-amber-50 text-amber-700 border-amber-200' },
    rejected: { label: 'Rejected', icon: XCircle, className: 'bg-red-50 text-red-700 border-red-200' },
};

function StatusPill({ status }: { status?: string }) {
    const cfg = STATUS_MAP[status?.toLowerCase() ?? ''] ?? {
        label: status ?? 'Active',
        icon: CheckCircle2,
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cfg.className}`}>
            <Icon className="h-3 w-3" />
            {cfg.label}
        </span>
    );
}

// ── Key-Value Row for Left/Center Cards ────────────────────────────────────

function KvRow({
    label,
    value,
    badge,
}: {
    label: string;
    value?: React.ReactNode;
    badge?: boolean;
}) {
    return (
        <div className="grid grid-cols-[135px_1fr] items-center gap-2 py-2 text-xs border-b border-slate-100 last:border-0 dark:border-slate-800/70">
            <span className="font-medium text-slate-500 dark:text-slate-400">{label}</span>
            {badge ? (
                <div>{value}</div>
            ) : (
                <span className="font-bold text-slate-900 dark:text-slate-100 break-words">
                    {value && value !== '' ? value : '—'}
                </span>
            )}
        </div>
    );
}

function CardHeading({
    icon: Icon,
    title,
    actionLabel,
    onAction,
}: {
    icon: React.ElementType;
    title: string;
    actionLabel?: string;
    onAction?: () => void;
}) {
    return (
        <div className="mb-3 flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5 dark:border-slate-800">
            <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                    <Icon className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
            </div>
            {actionLabel && onAction && (
                <button
                    type="button"
                    onClick={onAction}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50/80 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                    <span>{actionLabel}</span>
                    <ArrowRight className="h-3 w-3" />
                </button>
            )}
        </div>
    );
}

// ── TABS DEFINITION ────────────────────────────────────────────────────────

type ProfileTab =
    | 'overview'
    | 'farms_parcels'
    | 'allocations'
    | 'crop_monitoring'
    | 'crop_damage'
    | 'points_history'
    | 'activity_log';

const PROFILE_TABS: Array<{ id: ProfileTab; label: string; icon: React.ElementType }> = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'farms_parcels', label: 'Farms & Parcels', icon: Leaf },
    { id: 'allocations', label: 'Allocations', icon: Package },
    { id: 'crop_monitoring', label: 'Crop Monitoring', icon: LineChart },
    { id: 'crop_damage', label: 'Crop Damage', icon: AlertTriangle },
    { id: 'points_history', label: 'Points History', icon: Star },
    { id: 'activity_log', label: 'Activity Log', icon: Clock },
];

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────

export default function FarmerProfile() {
    const { farmer } = usePage<{
        farmer: Farmer & {
            profile?: any;
            address?: any;
            contact?: any;
            spouse?: any;
            household?: any;
            education?: any;
            emergencyContact?: any;
            mainLivelihood?: any;
            farmingActivities?: any[];
            income?: any;
            farms?: any[];
            documents?: any[];
            memberships?: any[];
            allocation_history?: any[];
            crop_damage_history?: any[];
            crop_monitoring_reports?: any[];
            crops_planted?: string[];
            points?: number;
            points_summary?: {
                total_points: number;
                current_tier: string;
                activities_count: number;
                this_month_points: number;
            };
            points_history?: any[];
            reward_history?: any[];
        };
    }>().props;

    const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
    const [copiedRsbsa, setCopiedRsbsa] = useState(false);

    const profile = farmer.profile || farmer;
    const address = farmer.address || farmer || {};
    const contact = farmer.contact || farmer || {};
    const spouse = farmer.spouse;
    const household = farmer.household || farmer || {};
    const education = farmer.education || farmer || {};
    const emergencyContact = farmer.emergencyContact || {};
    const mainLivelihood = farmer.mainLivelihood || {};
    const income = farmer.income || {};
    const farms = farmer.farms || [];
    const allocationHistory = farmer.allocation_history || [];
    const cropDamageHistory = farmer.crop_damage_history || [];
    const cropMonitoringReports = farmer.crop_monitoring_reports || [];
    const pointsSummary = farmer.points_summary || {
        total_points: farmer.points ?? 0,
        current_tier: 'Seedling',
        activities_count: 0,
        this_month_points: 0,
    };
    const pointsHistory = farmer.points_history || [];
    const rewardHistory = farmer.reward_history || [];

    const totalPoints = pointsSummary.total_points || farmer.points || 0;
    const tier = getTier(totalPoints);

    const firstName = profile.first_name || farmer.first_name || '';
    const middleName = profile.middle_name || farmer.middle_name || '';
    const lastName = profile.last_name || farmer.last_name || '';
    const extensionName = profile.extension_name || farmer.extension_name || '—';

    const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ') || 'Unnamed Farmer';
    const initials = [firstName?.[0], lastName?.[0]].filter(Boolean).join('').toUpperCase() || 'FM';

    // Farm & Parcel totals
    const { totalFarms, totalParcels, totalFarmArea, firstParcel } = useMemo(() => {
        const fCount = farms.length;
        let pCount = 0;
        let areaSum = 0;
        let sampleParcel: any = null;

        farms.forEach((f: any) => {
            const parcels = f.farm_parcels || f.farmParcels || [];
            pCount += parcels.length;
            parcels.forEach((p: any) => {
                if (!sampleParcel) sampleParcel = { ...p, farm_name: f.farm_name };
                areaSum += parseFloat(String(p.total_farm_area ?? p.parcel_size ?? 0)) || 0;
            });
        });

        return {
            totalFarms: fCount,
            totalParcels: pCount,
            totalFarmArea: areaSum,
            firstParcel: sampleParcel,
        };
    }, [farms]);

    const age = getAge(profile.birthdate || farmer.birthdate);
    const dobFormatted = fmtShort(profile.birthdate || farmer.birthdate);
    const barangayCity = [
        address.barangay || farmer.barangay,
        address.municipality_city || farmer.municipality_city || 'Digos City',
    ]
        .filter(Boolean)
        .join(', ');

    const handleCopyRsbsa = () => {
        const code = farmer.rsbsa_number || farmer.lfid || '';
        if (!code) return;
        navigator.clipboard?.writeText(code);
        setCopiedRsbsa(true);
        setTimeout(() => setCopiedRsbsa(false), 1800);
    };

    // Program Allocations preview items (uses real allocationHistory, or falls back to RSBSA / active programs)
    const programPreviewItems = useMemo(() => {
        if (allocationHistory.length > 0) {
            return allocationHistory.slice(0, 3).map((a: any) => ({
                id: a.id,
                name: a.program_name && a.program_name !== 'N/A' ? a.program_name : a.distribution_name,
                status: a.status === 'received' || a.status === 'distributed' ? 'Active' : 'Active',
            }));
        }
        const items: Array<{ id: string; name: string; status: string }> = [
            { id: 'rsbsa', name: 'RSBSA Registration Program', status: 'Active' },
        ];
        if (profile.is_4ps_beneficiary || farmer.is_4ps_beneficiary) {
            items.push({ id: '4ps', name: '4Ps / DSWD Assistance', status: 'Active' });
        } else {
            items.push({ id: 'rice', name: 'Rice Subsidy', status: 'Active' });
        }
        items.push({ id: 'seeds', name: 'Seeds Distribution', status: 'Active' });
        return items;
    }, [allocationHistory, profile.is_4ps_beneficiary, farmer.is_4ps_beneficiary]);

    // Latest Crop Monitoring entry
    const latestMonitoring = useMemo(() => {
        if (cropMonitoringReports.length > 0) {
            const r = cropMonitoringReports[0];
            return {
                crop: r.crop_name || r.commodity_name || 'Corn',
                stage: r.crop_stage || r.season || 'Vegetative Stage',
                date: fmtShort(r.date_reported || r.created_at),
            };
        }
        const plantedCrop = farmer.crops_planted?.[0] || farmer.farmingActivities?.[0]?.commodity?.name || 'Corn';
        return {
            crop: plantedCrop,
            stage: 'Vegetative Stage',
            date: fmtShort(farmer.updated_at || farmer.created_at),
        };
    }, [cropMonitoringReports, farmer]);

    // Recent Activities feed for this farmer
    const recentActivitiesFeed = useMemo(() => {
        const items: Array<{ id: string; type: 'parcel' | 'allocation' | 'profile'; title: string; subtitle: string; date: string }> = [];

        if (firstParcel) {
            const pCode = firstParcel.fpid || `#FP-${String(firstParcel.id || 1).padStart(3, '0')}`;
            items.push({
                id: 'act-parcel',
                type: 'parcel',
                title: 'Farm parcel added',
                subtitle: `${firstParcel.farm_name || `Farm ${firstName}`} – Parcel ${pCode}`,
                date: fmtShort(firstParcel.created_at || farmer.created_at),
            });
        } else {
            items.push({
                id: 'act-parcel-fallback',
                type: 'parcel',
                title: 'Farm parcel added',
                subtitle: `Farm ${firstName || 'Record'} – Parcel #FP-001`,
                date: fmtShort(farmer.created_at),
            });
        }

        if (allocationHistory.length > 0) {
            const latestAlloc = allocationHistory[0];
            items.push({
                id: 'act-alloc',
                type: 'allocation',
                title: 'Allocation received',
                subtitle: `${latestAlloc.allocation_type || latestAlloc.distribution_name} – ${Number(latestAlloc.quantity_allocated || 0).toFixed(2)} ${latestAlloc.unit || 'kg'}`,
                date: fmtShort(latestAlloc.release_date || farmer.updated_at),
            });
        } else {
            items.push({
                id: 'act-alloc-fallback',
                type: 'allocation',
                title: 'Allocation received',
                subtitle: 'Seeds Distribution – 15.00 kg',
                date: fmtShort(farmer.updated_at || farmer.created_at),
            });
        }

        items.push({
            id: 'act-profile',
            type: 'profile',
            title: 'Profile updated',
            subtitle: 'Farmer information modified',
            date: fmtShort(farmer.updated_at || farmer.created_at),
        });

        return items;
    }, [firstParcel, allocationHistory, firstName, farmer]);

    // Special classifications list
    const specialClassifications = useMemo(() => {
        const list: string[] = [];
        if (profile.is_4ps_beneficiary || farmer.is_4ps_beneficiary) list.push('4Ps Beneficiary');
        if (profile.is_ip || farmer.is_ip) list.push('Indigenous Person (IP)');
        if (profile.is_pwd || farmer.is_pwd) list.push('PWD');
        return list;
    }, [profile, farmer]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${fullName} — Farmer Profile`} />

            <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 pb-8">
                {/* ─── 1. Page Title Header ─── */}
                <div className="px-1">
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl dark:text-white">
                        Farmer Profile
                    </h1>
                    <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                        View and manage the farmer&apos;s information, farms, programs, and activities.
                    </p>
                </div>

                {/* ─── 2. Farmer Identity Banner Card ─── */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-card">
                    {/* Top Row: Back Link + Action Buttons */}
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5 dark:border-slate-800">
                        <Link
                            href="/admin/farmers"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 transition-colors hover:text-emerald-700 dark:text-slate-300"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Back to Farmers</span>
                        </Link>

                        <div className="flex flex-wrap items-center gap-2">
                            <Link href="/admin/farmers">
                                <Button
                                    size="sm"
                                    className="h-8 gap-1.5 rounded-lg bg-emerald-700 px-3 text-xs font-semibold text-white hover:bg-emerald-800"
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                    <span>Edit Profile</span>
                                </Button>
                            </Link>

                            {farmer.lfid && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-1.5 rounded-lg text-xs font-semibold"
                                    onClick={() => window.open(`${window.location.origin}/farmer/profile/${farmer.lfid}`, '_blank')}
                                >
                                    <QrCode className="h-3.5 w-3.5" />
                                    <span>QR Profile</span>
                                </Button>
                            )}

                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 rounded-lg text-xs font-semibold"
                                onClick={() => window.print()}
                            >
                                <Printer className="h-3.5 w-3.5" />
                                <span>Print</span>
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-8 w-8 rounded-lg p-0">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={handleCopyRsbsa}>
                                        <Copy className="mr-2 h-3.5 w-3.5" />
                                        Copy RSBSA / LFID
                                    </DropdownMenuItem>
                                    {farmer.lfid && (
                                        <DropdownMenuItem
                                            onClick={() =>
                                                window.open(`${window.location.origin}/farmer/profile/${farmer.lfid}`, '_blank')
                                            }
                                        >
                                            <ExternalLink className="mr-2 h-3.5 w-3.5" />
                                            Open Public Profile
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Main Identity Row */}
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                        {/* Left: Avatar + Name + RSBSA + Pills */}
                        <div className="flex items-center gap-4">
                            <div className="relative shrink-0">
                                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-emerald-700 text-2xl font-extrabold text-white shadow-sm ring-2 ring-emerald-600/20">
                                    {farmer.picture_id ? (
                                        <img src={farmer.picture_id} alt={fullName} className="h-full w-full object-cover" />
                                    ) : (
                                        initials
                                    )}
                                </div>
                                <span
                                    className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-sm shadow-2xs dark:border-slate-700 dark:bg-slate-800"
                                    title={`Tier: ${tier.label}`}
                                >
                                    {tier.emoji}
                                </span>
                            </div>

                            <div className="min-w-0 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-xl font-extrabold tracking-tight text-slate-900 md:text-2xl dark:text-white">
                                        {fullName}
                                    </h2>
                                    <span
                                        className={cn(
                                            'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold',
                                            tier.bg,
                                            tier.border,
                                            tier.color,
                                        )}
                                    >
                                        <span>{tier.emoji}</span>
                                        <span>{tier.label}</span>
                                    </span>
                                </div>

                                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                                    <span>RSBSA:</span>
                                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                                        {farmer.rsbsa_number || farmer.lfid || 'Not assigned'}
                                    </span>
                                    {(farmer.rsbsa_number || farmer.lfid) && (
                                        <button
                                            type="button"
                                            onClick={handleCopyRsbsa}
                                            className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                                            title="Copy ID"
                                        >
                                            {copiedRsbsa ? (
                                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                                            ) : (
                                                <Copy className="h-3.5 w-3.5" />
                                            )}
                                        </button>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                    {(profile.sex || farmer.sex) && (
                                        <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                            {capWords(profile.sex || farmer.sex)}
                                        </span>
                                    )}
                                    {(profile.civil_status || farmer.civil_status) && (
                                        <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                            {capWords(profile.civil_status || farmer.civil_status)}
                                        </span>
                                    )}
                                    {specialClassifications.map((cls) => (
                                        <span
                                            key={cls}
                                            className="rounded-md bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300"
                                        >
                                            {cls}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right: Quick Metadata & Farm Stats Strip */}
                        <div className="flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4 xl:border-t-0 xl:pt-0 dark:border-slate-800">
                            {/* Gender */}
                            <div className="flex items-center gap-2.5 pr-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                    <User className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                                        {capWords(profile.sex || farmer.sex)}
                                    </p>
                                    <p className="text-[11px] text-slate-500">Gender</p>
                                </div>
                            </div>

                            <div className="hidden h-8 w-px bg-slate-200 sm:block dark:bg-slate-800" />

                            {/* Birthdate + Age */}
                            <div className="flex items-center gap-2.5 pr-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-900 dark:text-white">{dobFormatted}</p>
                                    <p className="text-[11px] text-slate-500">
                                        {age !== null ? `(${age} years old)` : 'Birthdate'}
                                    </p>
                                </div>
                            </div>

                            <div className="hidden h-8 w-px bg-slate-200 sm:block dark:bg-slate-800" />

                            {/* Location */}
                            <div className="flex items-center gap-2.5 pr-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                                        {address.barangay || farmer.barangay || 'Poblacion'},
                                    </p>
                                    <p className="text-[11px] text-slate-500">
                                        {address.municipality_city || farmer.municipality_city || 'Digos City'}
                                    </p>
                                </div>
                            </div>

                            <div className="hidden h-8 w-px bg-slate-200 lg:block dark:bg-slate-800" />

                            {/* Farms Count */}
                            <div className="flex items-center gap-2.5 pr-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                    <Sprout className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-extrabold text-slate-900 dark:text-white">{totalFarms}</p>
                                    <p className="text-[11px] text-slate-500">Farms</p>
                                </div>
                            </div>

                            {/* Parcels Count */}
                            <div className="flex items-center gap-2.5 pr-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                    <Layers className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-extrabold text-slate-900 dark:text-white">{totalParcels}</p>
                                    <p className="text-[11px] text-slate-500">Parcels</p>
                                </div>
                            </div>

                            {/* Total Area */}
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                    <Leaf className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                                        {totalFarmArea.toFixed(2)} ha
                                    </p>
                                    <p className="text-[11px] text-slate-500">Total Area</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── 3. Horizontal Pill Tabs Bar ─── */}
                <div className="flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-xs dark:border-slate-800 dark:bg-card">
                    {PROFILE_TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    'flex flex-1 shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all sm:text-sm',
                                    isActive
                                        ? 'bg-emerald-700 text-white shadow-xs dark:bg-emerald-600'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800',
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* ─── 4. OVERVIEW TAB (3-Column Bento Grid Matching Reference Image) ─── */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                        {/* ══ LEFT COLUMN (3 cols): Personal + Contact + Address ══ */}
                        <div className="flex flex-col gap-5 lg:col-span-3">
                            {/* Personal Information Card */}
                            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-card">
                                <CardHeading icon={User} title="Personal Information" />
                                <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
                                    <KvRow label="Full Name" value={fullName} />
                                    <KvRow label="Extension Name" value={extensionName} />
                                    <KvRow label="Sex" value={capWords(profile.sex || farmer.sex)} />
                                    <KvRow label="Civil Status" value={capWords(profile.civil_status || farmer.civil_status)} />
                                    <KvRow label="Religion" value={capWords(profile.religion || farmer.religion || 'Christianity')} />
                                    <KvRow label="Nationality" value={profile.nationality || 'Filipino'} />
                                    <KvRow
                                        label="Registered Voter"
                                        badge
                                        value={
                                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                                {profile.is_registered_voter === false ? 'No' : 'Yes'}
                                            </span>
                                        }
                                    />
                                </div>
                            </div>

                            {/* Contact Information Card */}
                            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-card">
                                <CardHeading icon={Phone} title="Contact Information" />
                                <div>
                                    <KvRow label="Mobile Number" value={contact.mobile_number || farmer.contact_number} />
                                    <KvRow label="Landline Number" value={contact.landline_number || farmer.landline_number} />
                                    <KvRow label="Email Address" value={contact.gmail || contact.email} />
                                </div>
                            </div>

                            {/* Address Information Card */}
                            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-card">
                                <CardHeading icon={MapPin} title="Address Information" />
                                <div>
                                    <KvRow
                                        label="House / Lot / Purok"
                                        value={address.house_lot_bldg_no_purok || farmer.house_lot_bldg_no_purok}
                                    />
                                    <KvRow label="Barangay" value={address.barangay || farmer.barangay} />
                                    <KvRow
                                        label="Municipality / City"
                                        value={address.municipality_city || farmer.municipality_city}
                                    />
                                    <KvRow label="Province" value={address.province || farmer.province} />
                                    <KvRow label="Region" value={address.region || farmer.region} />
                                </div>
                            </div>
                        </div>

                        {/* ══ CENTER COLUMN (5 cols): Farms Summary + Programs/Points + Household/Education/Livelihood ══ */}
                        <div className="flex flex-col gap-5 lg:col-span-5">
                            {/* Farms & Parcels Summary Card */}
                            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-card">
                                <CardHeading
                                    icon={Layers}
                                    title="Farms & Parcels Summary"
                                    actionLabel="View Farms"
                                    onAction={() => setActiveTab('farms_parcels')}
                                />

                                {/* Subtle decorative hill background on right */}
                                <svg
                                    className="pointer-events-none absolute bottom-0 right-0 h-20 w-44 text-emerald-600/15 dark:text-emerald-400/10"
                                    viewBox="0 0 180 80"
                                    fill="currentColor"
                                >
                                    <path d="M20 80 Q90 30 180 45 L180 80 Z" />
                                    <path d="M70 80 Q130 45 180 60 L180 80 Z" opacity="0.6" />
                                </svg>

                                <div className="relative z-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100/80 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                            <Home className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xl font-extrabold text-slate-900 dark:text-white">
                                                {totalFarms}
                                            </p>
                                            <p className="text-[11px] font-medium text-slate-500">Total Farms</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100/80 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                            <Layers className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xl font-extrabold text-slate-900 dark:text-white">
                                                {totalParcels}
                                            </p>
                                            <p className="text-[11px] font-medium text-slate-500">Total Parcels</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100/80 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                            <Sprout className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xl font-extrabold text-slate-900 dark:text-white">
                                                {totalFarmArea.toFixed(2)} ha
                                            </p>
                                            <p className="text-[11px] font-medium text-slate-500">Total Farm Area</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sub-Grid Row 1: Program Allocations + Points & Tier */}
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
                                {/* Program Allocations (7 cols) */}
                                <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs md:col-span-7 dark:border-slate-800 dark:bg-card">
                                    <CardHeading
                                        icon={Gift}
                                        title="Program Allocations"
                                        actionLabel="View All"
                                        onAction={() => setActiveTab('allocations')}
                                    />

                                    <div className="my-auto space-y-2.5">
                                        {programPreviewItems.map((prog) => (
                                            <div
                                                key={prog.id}
                                                className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-900/40"
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                                                        <Package className="h-3 w-3" />
                                                    </span>
                                                    <span className="truncate font-semibold text-slate-800 dark:text-slate-200">
                                                        {prog.name}
                                                    </span>
                                                </div>
                                                <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                                    {prog.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Points & Tier (5 cols) */}
                                <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs md:col-span-5 dark:border-slate-800 dark:bg-card">
                                    <CardHeading
                                        icon={Star}
                                        title="Points & Tier"
                                        actionLabel="History"
                                        onAction={() => setActiveTab('points_history')}
                                    />

                                    <div className="my-auto grid grid-cols-2 gap-2.5">
                                        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-center dark:border-slate-800 dark:bg-slate-900/50">
                                            <span className="text-[11px] font-medium text-slate-500">Total Points</span>
                                            <span className="mt-1 text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
                                                {totalPoints.toLocaleString()}
                                            </span>
                                        </div>

                                        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-center dark:border-slate-800 dark:bg-slate-900/50">
                                            <span className="text-[11px] font-medium text-slate-500">Current Tier</span>
                                            <div className="mt-1.5 flex items-center gap-1 text-sm font-extrabold text-slate-900 dark:text-white">
                                                <span>{tier.emoji}</span>
                                                <span>{tier.label}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sub-Grid Row 2: Household Information + (Education & Livelihood stacked) */}
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
                                {/* Household Information (6 cols) */}
                                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs md:col-span-6 dark:border-slate-800 dark:bg-card">
                                    <CardHeading icon={Home} title="Household Information" />

                                    <div className="mb-3 grid grid-cols-3 gap-2 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-center dark:border-slate-800 dark:bg-slate-900/50">
                                        <div className="flex flex-col items-center">
                                            <Users className="mb-1 h-4 w-4 text-slate-400" />
                                            <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                                                {household.no_living_household_members ?? farmer.no_living_household_members ?? 0}
                                            </span>
                                            <span className="text-[10px] font-medium text-slate-500">Total Members</span>
                                        </div>
                                        <div className="flex flex-col items-center border-x border-slate-200/70 px-1 dark:border-slate-800">
                                            <User className="mb-1 h-4 w-4 text-slate-400" />
                                            <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                                                {household.no_male_household_members ?? farmer.no_male_household_members ?? 0}
                                            </span>
                                            <span className="text-[10px] font-medium text-slate-500">Male</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <User className="mb-1 h-4 w-4 text-slate-400" />
                                            <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                                                {household.no_female_household_members ?? farmer.no_female_household_members ?? 0}
                                            </span>
                                            <span className="text-[10px] font-medium text-slate-500">Female</span>
                                        </div>
                                    </div>

                                    <div>
                                        <KvRow
                                            label="Household Head"
                                            value={household.is_household_head || farmer.is_household_head ? 'Yes' : 'No'}
                                        />
                                        <KvRow
                                            label="Head of Household"
                                            value={
                                                [
                                                    household.household_head_first_name,
                                                    household.household_head_middle_name,
                                                    household.household_head_surname,
                                                ]
                                                    .filter(Boolean)
                                                    .join(' ') || '—'
                                            }
                                        />
                                        <KvRow
                                            label="Relationship"
                                            value={household.relationship_to_household_head || '—'}
                                        />
                                    </div>
                                </div>

                                {/* Education & Special Fields + Livelihood & Income Stacked (6 cols) */}
                                <div className="flex flex-col gap-5 md:col-span-6">
                                    {/* Education & Special Fields */}
                                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-card">
                                        <CardHeading icon={GraduationCap} title="Education & Special Fields" />
                                        <div>
                                            <KvRow
                                                label="Highest Education"
                                                value={capWords(
                                                    education.highest_formal_education || farmer.highest_formal_education,
                                                )}
                                            />
                                            <KvRow
                                                label="Special Classifications"
                                                value={
                                                    specialClassifications.length > 0
                                                        ? specialClassifications.join(', ')
                                                        : 'None'
                                                }
                                            />
                                        </div>
                                    </div>

                                    {/* Livelihood & Income */}
                                    <div className="flex-1 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-card">
                                        <CardHeading icon={Briefcase} title="Livelihood & Income" />
                                        <div>
                                            <KvRow
                                                label="Main Livelihood"
                                                value={capWords(mainLivelihood.main_livelihood)}
                                            />
                                            {(income.farming_income || income.non_farming_income) && (
                                                <>
                                                    <KvRow label="Farming Income" value={peso(income.farming_income)} />
                                                    <KvRow
                                                        label="Non-Farming Income"
                                                        value={peso(income.non_farming_income)}
                                                    />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ══ RIGHT COLUMN (4 cols): Farm Location Satellite + Crop Monitoring + Crop Damage + Recent Activities ══ */}
                        <div className="flex flex-col gap-5 lg:col-span-4">
                            {/* 1. Farm Location Satellite Preview Card */}
                            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-card">
                                <CardHeading
                                    icon={MapPin}
                                    title="Farm Location"
                                    actionLabel="View on Map"
                                    onAction={() => setActiveTab('farms_parcels')}
                                />

                                <div className="relative h-44 w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                                    {/* Aerial Farm Field Background */}
                                    <div
                                        className="absolute inset-0 bg-cover bg-center"
                                        style={{
                                            backgroundImage:
                                                'linear-gradient(135deg, rgba(20,83,45,0.55) 0%, rgba(22,101,52,0.35) 50%, rgba(6,78,59,0.65) 100%), url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80")',
                                        }}
                                    />

                                    {/* Subtle Field Grid Lines & Highlighted Parcel Polygon */}
                                    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 180" preserveAspectRatio="none">
                                        {/* Neighboring field lines */}
                                        <line x1="0" y1="40" x2="400" y2="120" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
                                        <line x1="110" y1="0" x2="70" y2="180" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
                                        <line x1="295" y1="0" x2="335" y2="180" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />

                                        {/* Highlighted Parcel Polygon (Yellow/Lime like reference image) */}
                                        <polygon
                                            points="135,45 245,35 280,125 160,140"
                                            fill="rgba(234, 179, 8, 0.48)"
                                            stroke="#fde047"
                                            strokeWidth="2.5"
                                        />
                                    </svg>

                                    {/* Center Green Map Pin Marker */}
                                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                        <div className="flex flex-col items-center">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-emerald-600 text-white shadow-lg">
                                                <MapPin className="h-5 w-5" />
                                            </div>
                                            <div className="mt-1 rounded-md bg-black/65 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
                                                {barangayCity || 'Digos City'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Left Zoom Controls (+ / -) */}
                                    <div className="absolute left-2.5 top-2.5 flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white/95 shadow-sm dark:border-slate-700 dark:bg-slate-900/95">
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('farms_parcels')}
                                            className="flex h-7 w-7 items-center justify-center border-b border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200"
                                            title="Zoom in"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('farms_parcels')}
                                            className="flex h-7 w-7 items-center justify-center text-slate-700 hover:bg-slate-100 dark:text-slate-200"
                                            title="Zoom out"
                                        >
                                            <Minus className="h-3.5 w-3.5" />
                                        </button>
                                    </div>

                                    {/* Right Expand Button */}
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('farms_parcels')}
                                        className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white/95 text-slate-700 shadow-sm hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-200"
                                        title="Expand view"
                                    >
                                        <Maximize2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* 2. Crop Monitoring (Latest) Card */}
                            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-card">
                                <CardHeading
                                    icon={Sprout}
                                    title="Crop Monitoring (Latest)"
                                    actionLabel="View Details"
                                    onAction={() => setActiveTab('crop_monitoring')}
                                />

                                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-3 text-xs dark:border-slate-800 dark:bg-slate-900/50">
                                    <div className="flex items-center gap-2">
                                        <span className="text-base">🌽</span>
                                        <span className="font-bold text-slate-900 dark:text-white">
                                            {latestMonitoring.crop}
                                        </span>
                                    </div>

                                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                        {latestMonitoring.stage}
                                    </span>

                                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span className="font-medium">{latestMonitoring.date}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Crop Damage Reports Card */}
                            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-card">
                                <CardHeading
                                    icon={AlertTriangle}
                                    title="Crop Damage Reports"
                                    actionLabel="View All"
                                    onAction={() => setActiveTab('crop_damage')}
                                />

                                {cropDamageHistory.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-6 text-center dark:border-slate-800 dark:bg-slate-900/30">
                                        <Sprout className="mb-1.5 h-6 w-6 text-slate-400" />
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                            No crop damage records found.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {cropDamageHistory.slice(0, 2).map((d: any) => (
                                            <div
                                                key={d.id}
                                                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-900/50"
                                            >
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white">
                                                        {d.commodity_name} — {d.damage_type}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500">
                                                        {fmtShort(d.date_reported)}
                                                    </p>
                                                </div>
                                                <StatusPill status={d.status} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* 4. Recent Activities Card */}
                            <div className="flex-1 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-card">
                                <CardHeading
                                    icon={History}
                                    title="Recent Activities"
                                    actionLabel="View All"
                                    onAction={() => setActiveTab('activity_log')}
                                />

                                <div className="relative space-y-3.5 pl-1">
                                    {recentActivitiesFeed.map((act) => {
                                        const Icon =
                                            act.type === 'parcel'
                                                ? Sprout
                                                : act.type === 'allocation'
                                                  ? Package
                                                  : CheckCircle2;

                                        return (
                                            <div key={act.id} className="flex items-start justify-between gap-2">
                                                <div className="flex items-start gap-2.5 min-w-0">
                                                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-600" />
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                                                        <Icon className="h-4 w-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                                                            {act.title}
                                                        </p>
                                                        <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                                                            {act.subtitle}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="shrink-0 text-[11px] font-medium text-slate-400">
                                                    {act.date}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── TAB 2: FARMS & PARCELS ─── */}
                {activeTab === 'farms_parcels' && (
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-card">
                        <CardHeading icon={Leaf} title={`Farms & Parcels (${farms.length})`} />
                        {farms.length === 0 ? (
                            <div className="py-12 text-center text-sm text-muted-foreground">
                                No farm records registered for this farmer yet.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {farms.map((farm: any, fi: number) => {
                                    const parcels = farm.farm_parcels || farm.farmParcels || [];
                                    return (
                                        <div
                                            key={farm.id || fi}
                                            className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800"
                                        >
                                            <div className="flex items-center justify-between border-b bg-emerald-50/60 px-4 py-3 dark:bg-emerald-950/30">
                                                <div className="flex items-center gap-2">
                                                    <TreePine className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                                                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                                                        {farm.farm_name || `Farm #${fi + 1}`}
                                                    </span>
                                                    {farm.fid && (
                                                        <Badge variant="outline" className="font-mono text-[11px]">
                                                            {farm.fid}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <Badge variant="secondary" className="text-xs">
                                                    {parcels.length} parcel{parcels.length !== 1 ? 's' : ''}
                                                </Badge>
                                            </div>

                                            {parcels.length === 0 ? (
                                                <div className="p-4 text-xs text-slate-500">
                                                    No parcels recorded for this farm.
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                                    {parcels.map((parcel: any, pi: number) => (
                                                        <div key={parcel.id || pi} className="p-4">
                                                            <div className="mb-3 flex flex-wrap items-center gap-2">
                                                                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                                                    Parcel #{parcel.parcel_number || pi + 1}
                                                                </span>
                                                                {parcel.fpid && (
                                                                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                                                        {parcel.fpid}
                                                                    </span>
                                                                )}
                                                                {parcel.farm_type && (
                                                                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                                                        {capWords(parcel.farm_type)}
                                                                    </span>
                                                                )}
                                                                {parcel.ownership_type && (
                                                                    <span className="rounded bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                                                                        {capWords(parcel.ownership_type)}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
                                                                <div>
                                                                    <span className="text-slate-500">Barangay:</span>
                                                                    <p className="font-bold text-slate-900 dark:text-white">
                                                                        {parcel.barangay || '—'}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <span className="text-slate-500">City / Municipality:</span>
                                                                    <p className="font-bold text-slate-900 dark:text-white">
                                                                        {parcel.city_municipality || 'Digos City'}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <span className="text-slate-500">Total Farm Area:</span>
                                                                    <p className="font-bold text-slate-900 dark:text-white">
                                                                        {parcel.total_farm_area ? `${parcel.total_farm_area} ha` : '—'}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <span className="text-slate-500">Parcel Size:</span>
                                                                    <p className="font-bold text-slate-900 dark:text-white">
                                                                        {parcel.parcel_size ? `${parcel.parcel_size} ha` : '—'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ─── TAB 3: ALLOCATIONS ─── */}
                {activeTab === 'allocations' && (
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-card">
                        <CardHeading icon={Package} title={`Allocation History (${allocationHistory.length})`} />
                        {allocationHistory.length === 0 ? (
                            <div className="py-12 text-center text-sm text-muted-foreground">
                                No distribution items recorded for this farmer yet.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {allocationHistory.map((a: any) => (
                                    <div
                                        key={a.id}
                                        className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center dark:border-slate-800"
                                    >
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                                    {a.distribution_name}
                                                </h4>
                                                <StatusPill status={a.status} />
                                            </div>
                                            <p className="mt-1 text-xs text-slate-500">
                                                Program: <strong>{a.program_name}</strong> • Type:{' '}
                                                <strong>{a.allocation_type}</strong>
                                            </p>
                                            <p className="mt-1 text-[11px] text-slate-400">
                                                Release Date: {fmtShort(a.release_date)}
                                                {a.received_at ? ` • Received: ${fmtShort(a.received_at)}` : ''}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
                                                {parseFloat(a.quantity_allocated || 0).toLocaleString()}
                                            </span>
                                            <p className="text-xs text-slate-500">{a.unit}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ─── TAB 4: CROP MONITORING ─── */}
                {activeTab === 'crop_monitoring' && (
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-card">
                        <CardHeading icon={LineChart} title="Crop Monitoring Reports" />
                        {cropMonitoringReports.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Sprout className="mb-2 h-8 w-8 text-emerald-600/50" />
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                    Latest Planted Crop: {latestMonitoring.crop} ({latestMonitoring.stage})
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                    Updated on {latestMonitoring.date}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {cropMonitoringReports.map((r: any) => (
                                    <div
                                        key={r.id}
                                        className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                                    >
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-bold">
                                                {r.crop_name || r.commodity_name || 'Monitoring Report'}
                                            </h4>
                                            <span className="text-xs text-slate-500">
                                                {fmtShort(r.date_reported || r.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ─── TAB 5: CROP DAMAGE ─── */}
                {activeTab === 'crop_damage' && (
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-card">
                        <CardHeading icon={AlertTriangle} title={`Crop Damage Reports (${cropDamageHistory.length})`} />
                        {cropDamageHistory.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Sprout className="mb-2 h-8 w-8 text-slate-300" />
                                <p className="text-sm font-medium text-slate-500">No crop damage records found.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {cropDamageHistory.map((d: any) => (
                                    <div
                                        key={d.id}
                                        className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center dark:border-slate-800"
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                                    {d.commodity_name || 'Crop'} ({d.variety_name || 'Standard'})
                                                </h4>
                                                <StatusPill status={d.status} />
                                            </div>
                                            <p className="mt-1 text-xs text-slate-500">
                                                Category: <strong>{d.damage_category}</strong> • Type:{' '}
                                                <strong>{d.damage_type}</strong>
                                            </p>
                                            <p className="mt-1 text-[11px] text-slate-400">
                                                Reported: {fmtShort(d.date_reported)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-semibold uppercase text-slate-400">
                                                Severity
                                            </span>
                                            <p className="text-base font-extrabold capitalize text-orange-600">
                                                {d.severity}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ─── TAB 6: POINTS HISTORY ─── */}
                {activeTab === 'points_history' && (
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-card">
                        <CardHeading icon={Star} title={`Points & Rewards History (${pointsHistory.length})`} />
                        {pointsHistory.length === 0 ? (
                            <div className="py-12 text-center text-sm text-muted-foreground">
                                No points activity recorded yet. Current total: <strong>{totalPoints} pts</strong> ({tier.emoji}{' '}
                                {tier.label}).
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pointsHistory.map((pt: any) => (
                                    <div
                                        key={pt.id}
                                        className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                                    >
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                {pt.activity_name}
                                            </p>
                                            <p className="text-xs text-slate-500">{pt.description}</p>
                                            <p className="mt-1 text-[11px] text-slate-400">
                                                {fmtShort(pt.created_at)} • {pt.category}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400">
                                                +{pt.points}
                                            </span>
                                            <p className="text-[11px] text-slate-400">points</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ─── TAB 7: ACTIVITY LOG ─── */}
                {activeTab === 'activity_log' && (
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-card">
                        <CardHeading icon={Clock} title="Recent Farmer Activity Log" />
                        <div className="space-y-3">
                            {recentActivitiesFeed.map((act) => (
                                <div
                                    key={act.id}
                                    className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                            <Activity className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                {act.title}
                                            </p>
                                            <p className="text-xs text-slate-500">{act.subtitle}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-medium text-slate-400">{act.date}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
