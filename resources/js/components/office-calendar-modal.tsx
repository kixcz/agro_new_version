import { useState, useEffect, useMemo } from 'react';
import { Link } from '@inertiajs/react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
    Dialog,
    DialogPortal,
    DialogOverlay,
} from '@/components/ui/dialog';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    FileText,
    Package,
    Sprout,
    AlertTriangle,
    Megaphone,
    Search,
    ExternalLink,
    RefreshCw,
    LayoutGrid,
    Users,
    Info,
    X,
    Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface OfficeCalendarEvent {
    uid: string;
    id: number;
    title: string;
    subtitle: string;
    category: 'task' | 'report' | 'distribution' | 'monitoring' | 'damage' | 'announcement';
    category_label: string;
    status: string;
    priority: string;
    date: string;
    time: string | null;
    actor: string;
    url: string;
}

interface OfficeCalendarCounts {
    all: number;
    task: number;
    report: number;
    distribution: number;
    monitoring: number;
    damage: number;
    announcement: number;
}

interface OfficeCalendarModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const CATEGORY_CONFIG: Record<
    string,
    {
        label: string;
        shortLabel: string;
        icon: typeof ClipboardList;
        iconColor: string;
        dotColor: string;
        pillActiveBg: string;
        pillActiveText: string;
        pillActiveBorder: string;
        cellPillBg: string;
        cellPillText: string;
        cardBg: string;
        cardBorder: string;
        cardIconBg: string;
        cardIconText: string;
    }
> = {
    task: {
        label: 'Field Tasks',
        shortLabel: 'Field Task',
        icon: Sprout,
        iconColor: 'text-blue-600 dark:text-blue-400',
        dotColor: 'bg-blue-500',
        pillActiveBg: 'bg-blue-50 dark:bg-blue-950/60',
        pillActiveText: 'text-blue-700 dark:text-blue-300',
        pillActiveBorder: 'border-blue-300 dark:border-blue-800',
        cellPillBg: 'bg-blue-50 dark:bg-blue-950/70',
        cellPillText: 'text-blue-700 dark:text-blue-300',
        cardBg: 'bg-blue-50/40 dark:bg-blue-950/20',
        cardBorder: 'border-blue-100 dark:border-blue-900/50',
        cardIconBg: 'bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/60',
        cardIconText: 'text-blue-600 dark:text-blue-400',
    },
    report: {
        label: 'Reports',
        shortLabel: 'Report',
        icon: FileText,
        iconColor: 'text-purple-600 dark:text-purple-400',
        dotColor: 'bg-purple-500',
        pillActiveBg: 'bg-purple-50 dark:bg-purple-950/60',
        pillActiveText: 'text-purple-700 dark:text-purple-300',
        pillActiveBorder: 'border-purple-300 dark:border-purple-800',
        cellPillBg: 'bg-purple-50 dark:bg-purple-950/70',
        cellPillText: 'text-purple-700 dark:text-purple-300',
        cardBg: 'bg-purple-50/40 dark:bg-purple-950/20',
        cardBorder: 'border-purple-100 dark:border-purple-900/50',
        cardIconBg: 'bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/60',
        cardIconText: 'text-purple-600 dark:text-purple-400',
    },
    distribution: {
        label: 'Distributions',
        shortLabel: 'Distribution',
        icon: Package,
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        dotColor: 'bg-emerald-500',
        pillActiveBg: 'bg-emerald-50 dark:bg-emerald-950/60',
        pillActiveText: 'text-emerald-700 dark:text-emerald-300',
        pillActiveBorder: 'border-emerald-300 dark:border-emerald-800',
        cellPillBg: 'bg-emerald-50 dark:bg-emerald-950/70',
        cellPillText: 'text-emerald-700 dark:text-emerald-300',
        cardBg: 'bg-emerald-50/40 dark:bg-emerald-950/20',
        cardBorder: 'border-emerald-100 dark:border-emerald-900/50',
        cardIconBg: 'bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/60',
        cardIconText: 'text-emerald-600 dark:text-emerald-400',
    },
    monitoring: {
        label: 'Crop Monitoring',
        shortLabel: 'Monitoring',
        icon: Sprout,
        iconColor: 'text-teal-600 dark:text-teal-400',
        dotColor: 'bg-teal-500',
        pillActiveBg: 'bg-teal-50 dark:bg-teal-950/60',
        pillActiveText: 'text-teal-700 dark:text-teal-300',
        pillActiveBorder: 'border-teal-300 dark:border-teal-800',
        cellPillBg: 'bg-teal-50 dark:bg-teal-950/70',
        cellPillText: 'text-teal-700 dark:text-teal-300',
        cardBg: 'bg-teal-50/40 dark:bg-teal-950/20',
        cardBorder: 'border-teal-100 dark:border-teal-900/50',
        cardIconBg: 'bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-900/60',
        cardIconText: 'text-teal-600 dark:text-teal-400',
    },
    damage: {
        label: 'Crop Damage',
        shortLabel: 'Crop Damage',
        icon: AlertTriangle,
        iconColor: 'text-rose-600 dark:text-rose-400',
        dotColor: 'bg-rose-500',
        pillActiveBg: 'bg-rose-50 dark:bg-rose-950/60',
        pillActiveText: 'text-rose-700 dark:text-rose-300',
        pillActiveBorder: 'border-rose-300 dark:border-rose-800',
        cellPillBg: 'bg-rose-50 dark:bg-rose-950/70',
        cellPillText: 'text-rose-600 dark:text-rose-300',
        cardBg: 'bg-[#fff5f5] dark:bg-rose-950/25',
        cardBorder: 'border-rose-200/80 dark:border-rose-900/50',
        cardIconBg: 'bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/60',
        cardIconText: 'text-rose-500 dark:text-rose-400',
    },
    announcement: {
        label: 'Announcements',
        shortLabel: 'Announcement',
        icon: Megaphone,
        iconColor: 'text-amber-500 dark:text-amber-400',
        dotColor: 'bg-amber-400',
        pillActiveBg: 'bg-amber-50 dark:bg-amber-950/60',
        pillActiveText: 'text-amber-700 dark:text-amber-300',
        pillActiveBorder: 'border-amber-300 dark:border-amber-800',
        cellPillBg: 'bg-amber-50 dark:bg-amber-950/70',
        cellPillText: 'text-amber-700 dark:text-amber-300',
        cardBg: 'bg-amber-50/40 dark:bg-amber-950/20',
        cardBorder: 'border-amber-100 dark:border-amber-900/50',
        cardIconBg: 'bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-900/60',
        cardIconText: 'text-amber-500 dark:text-amber-400',
    },
};

export function OfficeCalendarModal({ open, onOpenChange }: OfficeCalendarModalProps) {
    const todayStr = useMemo(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }, []);

    const [currentMonth, setCurrentMonth] = useState<string>(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [events, setEvents] = useState<OfficeCalendarEvent[]>([]);
    const [counts, setCounts] = useState<OfficeCalendarCounts>({
        all: 0,
        task: 0,
        report: 0,
        distribution: 0,
        monitoring: 0,
        damage: 0,
        announcement: 0,
    });
    const [loading, setLoading] = useState<boolean>(false);

    const fetchMonthEvents = async (monthStr: string) => {
        setLoading(true);
        try {
            const response = await fetch(`/admin/calendar/events?month=${encodeURIComponent(monthStr)}`, {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            if (response.ok) {
                const data = await response.json();
                setEvents(data.events || []);
                if (data.counts) {
                    setCounts(data.counts);
                }
            }
        } catch (error) {
            console.error('Failed to load office calendar events:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchMonthEvents(currentMonth);
        }
    }, [open, currentMonth]);

    const [year, month] = useMemo(() => currentMonth.split('-').map(Number), [currentMonth]);

    const monthName = useMemo(() => {
        return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
        });
    }, [year, month]);

    // Build seamless month grid including previous & next month overflow days (like the attached reference)
    const calendarDays = useMemo(() => {
        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        const prevMonthLastDay = new Date(year, month - 1, 0).getDate();

        const cells: Array<{
            day: number;
            dateStr: string | null;
            currentMonth: boolean;
        }> = [];

        // Previous month trailing days
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            cells.push({
                day: prevMonthLastDay - i,
                dateStr: null,
                currentMonth: false,
            });
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            cells.push({
                day,
                dateStr,
                currentMonth: true,
            });
        }

        // Next month leading days to complete the final week row
        let nextMonthDay = 1;
        while (cells.length % 7 !== 0) {
            cells.push({
                day: nextMonthDay++,
                dateStr: null,
                currentMonth: false,
            });
        }

        return cells;
    }, [year, month]);

    const navigateMonth = (direction: 'prev' | 'next' | 'today') => {
        if (direction === 'today') {
            const now = new Date();
            const m = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            setCurrentMonth(m);
            setSelectedDate(todayStr);
            return;
        }
        const date = new Date(year, month - 1, 1);
        if (direction === 'prev') {
            date.setMonth(date.getMonth() - 1);
        } else {
            date.setMonth(date.getMonth() + 1);
        }
        const nextMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        setCurrentMonth(nextMonth);
        setSelectedDate(null);
    };

    // Map dateStr -> events for fast calendar cell rendering
    const eventsByDate = useMemo(() => {
        const map: Record<string, OfficeCalendarEvent[]> = {};
        events.forEach((ev) => {
            if (!map[ev.date]) {
                map[ev.date] = [];
            }
            map[ev.date].push(ev);
        });
        return map;
    }, [events]);

    // Filtered list of activities for the right-hand feed
    const filteredEvents = useMemo(() => {
        return events.filter((ev) => {
            if (selectedDate && ev.date !== selectedDate) {
                return false;
            }
            if (activeCategory !== 'all' && ev.category !== activeCategory) {
                return false;
            }
            if (searchQuery.trim() !== '') {
                const q = searchQuery.toLowerCase();
                return (
                    ev.title.toLowerCase().includes(q) ||
                    ev.subtitle.toLowerCase().includes(q) ||
                    ev.actor.toLowerCase().includes(q) ||
                    ev.category_label.toLowerCase().includes(q)
                );
            }
            return true;
        });
    }, [events, selectedDate, activeCategory, searchQuery]);

    const formatReadableDate = (dateStr: string) => {
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getStatusBadgeStyle = (status: string, category: string) => {
        const s = status.toLowerCase();
        if (category === 'damage' || s === 'recorded' || s === 'rejected' || s === 'cancelled') {
            return 'bg-rose-100/90 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300';
        }
        if (s === 'verified' || s === 'completed' || s === 'released' || s === 'active' || s === 'logged') {
            return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300';
        }
        if (s === 'in_progress' || s === 'submitted' || s === 'assigned') {
            return 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300';
        }
        if (s === 'pending') {
            return 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300';
        }
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogPortal>
                <DialogOverlay className="bg-black/50 backdrop-blur-[1px]" />
                <DialogPrimitive.Content
                    className={cn(
                        'fixed left-[50%] top-[50%] z-50 w-[95vw] max-w-[1060px] translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                    )}
                >
                    {/* Top Banner Header with Sun & Rolling Farm Hills Illustration */}
                    <div className="relative overflow-hidden border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-white via-[#f8fcf8] to-[#eef8ee] dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/30 px-6 pt-5 pb-4">
                        {/* Decorative Scenic Farm Hills SVG on Right */}
                        <svg
                            className="pointer-events-none absolute right-0 bottom-0 h-24 w-[440px] select-none opacity-95 dark:opacity-25"
                            viewBox="0 0 440 96"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            preserveAspectRatio="none"
                        >
                            <circle cx="332" cy="48" r="36" fill="url(#sunGlow)" />
                            <circle cx="332" cy="52" r="16" fill="#FDE047" />
                            <path
                                d="M80 96C145 64 220 54 310 68C365 76 405 70 440 60V96H80Z"
                                fill="#DCFCE7"
                            />
                            <path
                                d="M165 96C225 58 295 48 375 62C402 67 424 62 440 54V96H165Z"
                                fill="#86EFAC"
                            />
                            <path
                                d="M235 96C295 58 365 44 440 56V96H235Z"
                                fill="#22C55E"
                            />
                            <path
                                d="M275 96C325 68 382 56 440 64V96H275Z"
                                fill="#16A34A"
                            />
                            <path
                                d="M265 96C315 68 375 56 440 62"
                                stroke="#BBF7D0"
                                strokeWidth="1.5"
                                strokeOpacity="0.65"
                            />
                            <path
                                d="M300 96C345 73 395 63 440 68"
                                stroke="#BBF7D0"
                                strokeWidth="1.5"
                                strokeOpacity="0.55"
                            />
                            <defs>
                                <radialGradient id="sunGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(332 48) scale(36)">
                                    <stop stopColor="#FEF08A" stopOpacity="0.85" />
                                    <stop offset="1" stopColor="#FEF08A" stopOpacity="0" />
                                </radialGradient>
                            </defs>
                        </svg>

                        <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex items-start gap-3.5">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#15803d] text-white shadow-sm">
                                    <CalendarIcon className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <DialogPrimitive.Title className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                            Office Activity Calendar
                                        </DialogPrimitive.Title>
                                        <span className="inline-flex items-center rounded-full bg-[#dcfce7] dark:bg-emerald-950/90 px-3 py-0.5 text-xs font-bold text-[#15803d] dark:text-emerald-300">
                                            {counts.all} {counts.all === 1 ? 'Activity' : 'Activities'} in {monthName}
                                        </span>
                                    </div>
                                    <DialogPrimitive.Description className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                                        Quick calendar view of scheduled office tasks, field reports, distributions, crop monitoring, and other events.
                                    </DialogPrimitive.Description>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-start">
                                <button
                                    type="button"
                                    onClick={() => fetchMonthEvents(currentMonth)}
                                    disabled={loading}
                                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800 px-3.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    <RefreshCw className={cn('h-3.5 w-3.5 text-slate-500', loading && 'animate-spin')} />
                                    <span>Sync</span>
                                </button>

                                <Link
                                    href={`/admin/calendar?month=${currentMonth}`}
                                    onClick={() => onOpenChange(false)}
                                    className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#15803d] px-4 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#166534]"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    <span>Full Calendar View</span>
                                </Link>

                                <DialogPrimitive.Close
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-2xs transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
                                    aria-label="Close"
                                >
                                    <X className="h-4 w-4" />
                                </DialogPrimitive.Close>
                            </div>
                        </div>
                    </div>

                    {/* Category Filter Pills Row (no scrollbar) */}
                    <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        <button
                            type="button"
                            onClick={() => setActiveCategory('all')}
                            className={cn(
                                'inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all shrink-0',
                                activeCategory === 'all'
                                    ? 'bg-[#15803d] text-white shadow-xs'
                                    : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50',
                            )}
                        >
                            <LayoutGrid className="h-3.5 w-3.5" />
                            <span>All Activities</span>
                            <span
                                className={cn(
                                    'inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1.5 text-[10px] font-bold',
                                    activeCategory === 'all'
                                        ? 'bg-white/25 text-white'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
                                )}
                            >
                                {counts.all}
                            </span>
                        </button>

                        {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
                            const Icon = cfg.icon;
                            const count = counts[key as keyof OfficeCalendarCounts] ?? 0;
                            const isActive = activeCategory === key;
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setActiveCategory(isActive ? 'all' : key)}
                                    className={cn(
                                        'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all shrink-0',
                                        isActive
                                            ? `${cfg.pillActiveBg} ${cfg.pillActiveText} ${cfg.pillActiveBorder} shadow-2xs`
                                            : 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60',
                                    )}
                                >
                                    <Icon className={cn('h-3.5 w-3.5', cfg.iconColor)} />
                                    <span>{cfg.label}</span>
                                    <span className="text-slate-400 dark:text-slate-500 font-medium">({count})</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Main Two-Card Body (no scrollbar) */}
                    <div className="grid grid-cols-1 gap-4 bg-[#f8faf8] dark:bg-slate-950/50 p-5 lg:grid-cols-12">
                        {/* Left Card: Seamless Table-Style Month Calendar (7 columns) */}
                        <div className="lg:col-span-7 flex flex-col rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs">
                            {/* Calendar Card Header */}
                            <div className="mb-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="h-5 w-5 text-[#15803d] dark:text-emerald-400" />
                                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{monthName}</h3>
                                    {selectedDate && (
                                        <button
                                            type="button"
                                            onClick={() => setSelectedDate(null)}
                                            className="ml-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[11px] font-semibold text-[#15803d] dark:text-emerald-300 hover:underline"
                                        >
                                            {formatReadableDate(selectedDate)} ✕
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => navigateMonth('prev')}
                                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50"
                                        title="Previous Month"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigateMonth('today')}
                                        className="h-7 rounded-lg bg-[#dcfce7] dark:bg-emerald-950/80 px-3 text-xs font-bold text-[#15803d] dark:text-emerald-300 transition-colors hover:bg-[#bbf7d0]"
                                    >
                                        Today
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigateMonth('next')}
                                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50"
                                        title="Next Month"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Connected Seamless Calendar Table Grid (matching attached screenshot) */}
                            <div className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800">
                                {/* Day-of-Week Header Row */}
                                <div className="grid grid-cols-7 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
                                    {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d, idx) => (
                                        <div
                                            key={d}
                                            className={cn(
                                                'py-2 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400',
                                                idx < 6 && 'border-r border-slate-200/60 dark:border-slate-800',
                                            )}
                                        >
                                            {d}
                                        </div>
                                    ))}
                                </div>

                                {/* Seamless Connected Calendar Cells */}
                                <div className="grid grid-cols-7">
                                    {calendarDays.map((cell, idx) => {
                                        const isLastCol = (idx + 1) % 7 === 0;
                                        const isLastRow = idx >= calendarDays.length - 7;

                                        if (!cell.currentMonth || !cell.dateStr) {
                                            return (
                                                <div
                                                    key={`overflow-${idx}`}
                                                    className={cn(
                                                        'min-h-[68px] bg-slate-50/35 dark:bg-slate-900/40 p-2 text-left',
                                                        !isLastCol && 'border-r border-slate-200/70 dark:border-slate-800',
                                                        !isLastRow && 'border-b border-slate-200/70 dark:border-slate-800',
                                                    )}
                                                >
                                                    <span className="inline-flex h-6 w-6 items-center justify-center text-xs font-medium text-slate-300 dark:text-slate-600">
                                                        {cell.day}
                                                    </span>
                                                </div>
                                            );
                                        }

                                        const dayEvents = (eventsByDate[cell.dateStr] || []).filter(
                                            (e) => activeCategory === 'all' || e.category === activeCategory,
                                        );
                                        const isToday = cell.dateStr === todayStr;
                                        const isSelected = cell.dateStr === selectedDate;

                                        return (
                                            <button
                                                key={cell.dateStr}
                                                type="button"
                                                onClick={() =>
                                                    setSelectedDate((prev) => (prev === cell.dateStr ? null : cell.dateStr))
                                                }
                                                className={cn(
                                                    'group relative flex min-h-[68px] flex-col justify-between p-2 text-left transition-colors',
                                                    !isLastCol && 'border-r border-slate-200/70 dark:border-slate-800',
                                                    !isLastRow && 'border-b border-slate-200/70 dark:border-slate-800',
                                                    isSelected
                                                        ? 'bg-emerald-50/80 dark:bg-emerald-950/40'
                                                        : isToday
                                                          ? 'bg-emerald-50/50 dark:bg-emerald-950/25 hover:bg-emerald-50/80'
                                                          : 'bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/50',
                                                )}
                                            >
                                                {/* Top-left Date Number (solid circle badge on Today/Selected like attached reference) */}
                                                <div className="flex items-start justify-between w-full">
                                                    <span
                                                        className={cn(
                                                            'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs transition-colors',
                                                            isToday || isSelected
                                                                ? 'bg-[#15803d] font-bold text-white shadow-2xs'
                                                                : 'font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#15803d]',
                                                        )}
                                                    >
                                                        {cell.day}
                                                    </span>

                                                    {dayEvents.length > 1 && (
                                                        <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 text-[9px] font-bold text-slate-600 dark:text-slate-300">
                                                            {dayEvents.length}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Event Pill inside Cell */}
                                                {dayEvents.length > 0 && (
                                                    <div className="w-full overflow-hidden mt-1">
                                                        {dayEvents.slice(0, 1).map((ev) => {
                                                            const cfg = CATEGORY_CONFIG[ev.category] || CATEGORY_CONFIG.task;
                                                            return (
                                                                <div
                                                                    key={ev.uid}
                                                                    className={cn(
                                                                        'flex items-center gap-1 truncate rounded-md px-1.5 py-0.5 text-[10px] font-bold leading-tight',
                                                                        cfg.cellPillBg,
                                                                        cfg.cellPillText,
                                                                    )}
                                                                >
                                                                    <span
                                                                        className={cn('h-1.5 w-1.5 shrink-0 rounded-full', cfg.dotColor)}
                                                                    />
                                                                    <span className="truncate">{cfg.shortLabel}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Right Card: All Office Activities Feed (5 columns, scrollbar hidden) */}
                        <div className="lg:col-span-5 flex flex-col rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs h-[435px]">
                            {/* Right Card Header */}
                            <div className="mb-3 flex items-start justify-between gap-2">
                                <div className="flex items-start gap-2.5">
                                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#15803d] dark:text-emerald-400">
                                        <ClipboardList className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                                            {selectedDate
                                                ? `Activities (${formatReadableDate(selectedDate)})`
                                                : `All Office Activities (${monthName})`}
                                        </h4>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                            Showing {filteredEvents.length} of {events.length} recorded activities
                                        </p>
                                    </div>
                                </div>

                                {selectedDate && (
                                    <button
                                        type="button"
                                        onClick={() => setSelectedDate(null)}
                                        className="shrink-0 rounded-full border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                                    >
                                        All Month
                                    </button>
                                )}
                            </div>

                            {/* Pill Search Input */}
                            <div className="relative mb-3">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Filter by activity title, staff, or type..."
                                    className="h-9 w-full rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50 pl-9 pr-4 text-xs text-slate-800 dark:text-slate-200 outline-none transition-colors placeholder:text-slate-400 focus:border-[#15803d] focus:bg-white dark:focus:bg-slate-900"
                                />
                            </div>

                            {/* Activity Cards List (scrollbars hidden) */}
                            <div className="flex-1 overflow-y-auto space-y-2.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center h-52 text-slate-400 gap-2">
                                        <RefreshCw className="h-6 w-6 animate-spin text-[#15803d]" />
                                        <p className="text-xs font-medium">Loading office activities...</p>
                                    </div>
                                ) : filteredEvents.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-52 text-center px-4">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-2.5">
                                            <CalendarIcon className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No office activities found</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-xs">
                                            {selectedDate
                                                ? `No recorded activities on ${formatReadableDate(selectedDate)}.`
                                                : `No activities match your current filter in ${monthName}.`}
                                        </p>
                                        {(selectedDate || activeCategory !== 'all' || searchQuery) && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedDate(null);
                                                    setActiveCategory('all');
                                                    setSearchQuery('');
                                                }}
                                                className="mt-3 rounded-full bg-[#15803d] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#166534]"
                                            >
                                                Reset Filters
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    filteredEvents.map((ev) => {
                                        const cfg = CATEGORY_CONFIG[ev.category] || CATEGORY_CONFIG.task;
                                        const Icon = cfg.icon;
                                        return (
                                            <Link
                                                key={ev.uid}
                                                href={ev.url}
                                                onClick={() => onOpenChange(false)}
                                                className={cn(
                                                    'group block rounded-2xl border p-3.5 transition-all hover:shadow-md',
                                                    cfg.cardBg,
                                                    cfg.cardBorder,
                                                )}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className={cn(
                                                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-2xs',
                                                            cfg.cardIconBg,
                                                            cfg.cardIconText,
                                                        )}
                                                    >
                                                        <Icon className="h-5 w-5" />
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <p className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-[#15803d] dark:group-hover:text-emerald-400 truncate">
                                                                {ev.title}
                                                            </p>
                                                            <span
                                                                className={cn(
                                                                    'shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize',
                                                                    getStatusBadgeStyle(ev.status, ev.category),
                                                                )}
                                                            >
                                                                {ev.status.replace('_', ' ')}
                                                            </span>
                                                        </div>

                                                        <p className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate mt-0.5">
                                                            {ev.subtitle}
                                                        </p>

                                                        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                                                            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
                                                                <CalendarIcon className="h-3.5 w-3.5 text-[#15803d] dark:text-emerald-400" />
                                                                {formatReadableDate(ev.date)}
                                                            </span>
                                                            <span className="inline-flex items-center gap-1.5 truncate">
                                                                <Users className="h-3.5 w-3.5 text-slate-400" />
                                                                {ev.actor}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Unified Bottom Footer Bar */}
                    <div className="flex flex-col gap-3 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs">
                            <span className="font-bold text-slate-700 dark:text-slate-200">Activity Legend:</span>
                            {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                                <div key={key} className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                                    <span className={cn('h-2.5 w-2.5 rounded-full', cfg.dotColor)} />
                                    <span>{cfg.label}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 pt-2 sm:pt-0 lg:pl-4">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                                <Info className="h-3.5 w-3.5 text-[#15803d] dark:text-emerald-400 shrink-0" />
                                <span>Click any activity card to jump to its record</span>
                            </span>

                            <Link
                                href="/admin/tasks/create"
                                onClick={() => onOpenChange(false)}
                                className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full bg-[#dcfce7] dark:bg-emerald-950/90 px-3.5 text-xs font-bold text-[#15803d] dark:text-emerald-300 transition-colors hover:bg-[#bbf7d0]"
                            >
                                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                                <span>Schedule Task</span>
                            </Link>
                        </div>
                    </div>
                </DialogPrimitive.Content>
            </DialogPortal>
        </Dialog>
    );
}
