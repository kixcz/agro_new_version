import { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KpiCard } from '@/components/agro-profiler/kpi-card';
import { NarrativeCard } from '@/components/agro-profiler/narrative-card';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import LineChart from '@/components/charts/LineChart';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    FileText,
    Clock,
    User,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Sprout,
    UserCheck,
    Package,
    UserPlus,
    AlertTriangle,
    BarChart3,
} from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Activity Calendar',
        href: '/admin/calendar',
    },
];

interface CalendarEvent {
    id: number;
    title: string;
    type: 'task' | 'report';
    task_type?: string;
    report_type?: string;
    status: string;
    priority?: string;
    date: string;
    start_time?: string | null;
    end_time?: string | null;
    assigned_to: string;
    url: string;
}

interface Stats {
    total_tasks: number;
    completed_tasks: number;
    pending_tasks: number;
    overdue_tasks: number;
    total_reports: number;
    verified_reports: number;
}

interface Productivity {
    task_status_dist: { name: string; count: number }[];
    report_status_dist: { name: string; count: number }[];
    weekly_data: { name: string; tasks: number; completed: number; reports: number }[];
    task_type_dist: { name: string; count: number }[];
    daily_activity: { name: string; count: number }[];
    completion_rate: number;
    narrative: string;
}

interface Props {
    events: CalendarEvent[];
    stats: Stats;
    currentMonth: string;
    filters: any;
    productivity: Productivity;
}

export default function Calendar({ events, stats, currentMonth, productivity }: Props) {
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [showEventDialog, setShowEventDialog] = useState(false);
    const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);

    const currentDate = new Date(currentMonth + '-01');
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Get calendar days
    const calendarDays = useMemo(() => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        // Previous month days
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            days.push({
                date: prevMonthLastDay - i,
                currentMonth: false,
                fullDate: new Date(year, month - 1, prevMonthLastDay - i)
            });
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = date.toISOString().split('T')[0];
            const dayEvents = events.filter(e => e.date === dateStr);

            days.push({
                date: day,
                currentMonth: true,
                fullDate: date,
                events: dayEvents,
                isToday: date.toDateString() === new Date().toDateString()
            });
        }

        // Next month days
        const remainingDays = 42 - days.length; // 6 rows * 7 days
        for (let day = 1; day <= remainingDays; day++) {
            days.push({
                date: day,
                currentMonth: false,
                fullDate: new Date(year, month + 1, day)
            });
        }

        return days;
    }, [year, month, events]);

    const navigateMonth = (direction: number) => {
        const newDate = new Date(year, month + direction, 1);
        const newMonth = newDate.toISOString().slice(0, 7);
        router.get('/admin/calendar', { month: newMonth }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDateClick = (day: any) => {
        if (!day.currentMonth) return;

        const dateStr = day.fullDate.toISOString().split('T')[0];
        const dayEvents = events.filter(e => e.date === dateStr);

        if (dayEvents.length > 0) {
            setSelectedDate(dateStr);
            setSelectedEvents(dayEvents);
            setShowEventDialog(true);
        }
    };

    const getStatusColor = (event: CalendarEvent) => {
        if (event.type === 'task') {
            switch (event.status) {
                case 'verified': return 'bg-primary';
                case 'submitted': return 'bg-blue-500';
                case 'in_progress': return 'bg-amber-500';
                case 'rejected': return 'bg-red-500';
                default: return 'bg-muted-foreground/40';
            }
        } else {
            switch (event.status) {
                case 'verified': return 'bg-primary';
                case 'submitted': return 'bg-blue-500';
                case 'rejected': return 'bg-red-500';
                default: return 'bg-muted-foreground/40';
            }
        }
    };

    const getTaskTypeIcon = (taskType?: string) => {
        const icons: Record<string, React.ReactNode> = {
            'monitor_crops': <Sprout className="h-3 w-3" />,
            'verify_farmers': <UserCheck className="h-3 w-3" />,
            'distribute_allocation': <Package className="h-3 w-3" />,
            'register_farmers': <UserPlus className="h-3 w-3" />,
            'crop_damage_assessment': <AlertTriangle className="h-3 w-3" />,
        };
        return taskType ? icons[taskType] || <ClipboardList className="h-3 w-3" /> : <ClipboardList className="h-3 w-3" />;
    };

    const getTypeIcon = (type: string) => {
        return type === 'task' ? <ClipboardList className="h-4 w-4" /> : <FileText className="h-4 w-4" />;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Activity Calendar" />
            <div className="flex h-full flex-1 flex-col gap-5 rounded-xl p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2">
                            <CalendarIcon className="h-7 w-7 text-primary" />
                            Activity Calendar
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            View all scheduled tasks and technician activities
                        </p>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <KpiCard label="Total Tasks" value={stats.total_tasks} icon={ClipboardList} />
                    <KpiCard label="Completed" value={stats.completed_tasks} icon={CheckCircle2} />
                    <KpiCard label="Pending" value={stats.pending_tasks} icon={Clock} />
                    <KpiCard label="Reports Filed" value={stats.total_reports} icon={FileText} />
                </div>

                {/* Tabs */}
                <Tabs defaultValue="calendar" className="flex flex-col gap-4">
                    <TabsList className="glass-surface w-fit">
                        <TabsTrigger value="calendar" className="gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            Calendar
                        </TabsTrigger>
                        <TabsTrigger value="productivity" className="gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Productivity
                        </TabsTrigger>
                    </TabsList>

                    {/* ─── Calendar Tab ─────────────────────────────────── */}
                    <TabsContent value="calendar" className="flex flex-col gap-5">
                        <div className="rounded-2xl border border-border/60 bg-card shadow-sm">
                            {/* Calendar Navigation Bar */}
                            <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 rounded-lg px-3 text-sm font-medium"
                                        onClick={() => {
                                            const today = new Date().toISOString().slice(0, 7);
                                            router.get('/admin/calendar', { month: today });
                                        }}
                                    >
                                        Today
                                    </Button>
                                    <div className="flex items-center gap-0.5">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-lg"
                                            onClick={() => navigateMonth(-1)}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-lg"
                                            onClick={() => navigateMonth(1)}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <h2 className="text-lg font-semibold tracking-tight">
                                        {monthNames[month]} {year}
                                    </h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center rounded-lg border border-border/60 bg-muted/30 p-0.5">
                                        <span className="rounded-md bg-background px-3 py-1.5 text-sm font-medium shadow-sm">
                                            Month
                                        </span>
                                    </div>
                                    <Button
                                        size="sm"
                                        className="h-8 rounded-lg px-3 text-sm font-medium"
                                        onClick={() => {
                                            // TODO: Implement new event creation
                                        }}
                                    >
                                        <span className="mr-1.5">+</span>
                                        New event
                                    </Button>
                                </div>
                            </div>

                            {/* Day Names Header */}
                            <div className="grid grid-cols-7 border-b border-border/60">
                                {dayNames.map((day) => (
                                    <div
                                        key={day}
                                        className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7">
                                {calendarDays.map((day, index) => {
                                    const isCompleted = (event: CalendarEvent) =>
                                        event.status === 'verified' || event.status === 'completed';
                                    const isCancelled = (event: CalendarEvent) => event.status === 'rejected';
                                    const maxVisibleEvents = 3;

                                    return (
                                        <div
                                            key={index}
                                            onClick={() => handleDateClick(day)}
                                            className={`group relative min-h-[120px] border-b border-r border-border/60 p-2 transition-colors ${
                                                day.currentMonth
                                                    ? 'bg-card hover:bg-accent/30'
                                                    : 'bg-muted/20'
                                            } ${day.isToday ? 'bg-primary/5' : ''} ${
                                                day.currentMonth ? 'cursor-pointer' : ''
                                            }`}
                                        >
                                            {/* Date Number */}
                                            <div className="mb-1.5 flex items-start justify-between">
                                                <span
                                                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-sm ${
                                                        day.isToday
                                                            ? 'bg-primary font-semibold text-primary-foreground'
                                                            : day.currentMonth
                                                            ? 'font-medium text-foreground'
                                                            : 'text-muted-foreground/50'
                                                    }`}
                                                >
                                                    {day.date}
                                                </span>
                                            </div>

                                            {/* Events */}
                                            {day.currentMonth && day.events && day.events.length > 0 && (
                                                <div className="space-y-1">
                                                    {day.events.slice(0, maxVisibleEvents).map((event, idx) => {
                                                        const strikethrough = isCompleted(event) || isCancelled(event);
                                                        return (
                                                            <div
                                                                key={idx}
                                                                className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs ${getStatusColor(event)} text-primary-foreground`}
                                                                title={event.title}
                                                            >
                                                                {event.start_time && (
                                                                    <span className="shrink-0 font-medium opacity-90">
                                                                        {new Date(`2000-01-01T${event.start_time}`).toLocaleTimeString([], {
                                                                            hour: 'numeric',
                                                                            minute: '2-digit',
                                                                        })}
                                                                    </span>
                                                                )}
                                                                <span
                                                                    className={`truncate ${
                                                                        strikethrough ? 'line-through opacity-70' : ''
                                                                    }`}
                                                                >
                                                                    {event.title}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                    {day.events.length > maxVisibleEvents && (
                                                        <div className="px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                                            +{day.events.length - maxVisibleEvents} more
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </TabsContent>

                    {/* ─── Productivity Tab ─────────────────────────────── */}
                    <TabsContent value="productivity" className="flex flex-col gap-5">
                        <NarrativeCard
                            narrative={productivity.narrative}
                            highlights={[
                                { text: 'tasks', value: stats.total_tasks },
                                { text: 'completion rate', value: `${productivity.completion_rate}%` },
                                { text: 'reports', value: stats.total_reports },
                            ]}
                        />

                        {/* Weekly Activity */}
                        <div className="glass-card rounded-2xl p-6">
                            <h2 className="mb-4 text-lg font-semibold">Weekly Activity Breakdown</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                <BarChart
                                    data={productivity.weekly_data.map(w => ({ name: w.name, count: w.tasks }))}
                                    title="Tasks per Week"
                                />
                                <BarChart
                                    data={productivity.weekly_data.map(w => ({ name: w.name, count: w.completed }))}
                                    title="Completed per Week"
                                />
                            </div>
                        </div>

                        {/* Status Distributions */}
                        <div className="glass-card rounded-2xl p-6">
                            <h2 className="mb-4 text-lg font-semibold">Status Distribution</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                {productivity.task_status_dist.length > 0 && (
                                    <PieChart data={productivity.task_status_dist} title="Task Status" />
                                )}
                                {productivity.report_status_dist.length > 0 ? (
                                    <PieChart data={productivity.report_status_dist} title="Report Status" />
                                ) : (
                                    <div className="glass-surface rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                        <FileText className="h-8 w-8 opacity-20" />
                                        <p className="text-sm font-medium">No reports this month</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Task Types & Daily Trend */}
                        <div className="glass-card rounded-2xl p-6">
                            <h2 className="mb-4 text-lg font-semibold">Task Types & Daily Trend</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                {productivity.task_type_dist.length > 0 && (
                                    <PieChart data={productivity.task_type_dist} title="By Task Type" />
                                )}
                                <LineChart data={productivity.daily_activity.map(d => ({ month: d.name, count: d.count }))} title="Daily Task Volume" />
                            </div>
                        </div>

                        {/* Completion Rate Highlight */}
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="glass-surface rounded-2xl p-6 text-center">
                                <p className="text-4xl font-bold text-primary">{productivity.completion_rate}%</p>
                                <p className="text-sm text-muted-foreground mt-2">Completion Rate</p>
                            </div>
                            <div className="glass-surface rounded-2xl p-6 text-center">
                                <p className="text-4xl font-bold text-primary">{stats.verified_reports}</p>
                                <p className="text-sm text-muted-foreground mt-2">Verified Reports</p>
                            </div>
                            <div className="glass-surface rounded-2xl p-6 text-center">
                                <p className="text-4xl font-bold text-primary">{stats.overdue_tasks}</p>
                                <p className="text-sm text-muted-foreground mt-2">Overdue Tasks</p>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Event Dialog */}
            <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5" />
                            Events for {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                        {selectedEvents.map((event) => (
                            <Link key={event.id} href={event.url}>
                                <div className="glass-surface rounded-xl p-4 hover:bg-accent/50 cursor-pointer transition-all">
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg ${getStatusColor(event)} text-primary-foreground`}>
                                            {getTypeIcon(event.type)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold">{event.title}</h3>
                                                <Badge variant="outline" className="text-xs capitalize">
                                                    {event.type}
                                                </Badge>
                                                {event.priority && (
                                                    <Badge className={`text-xs ${
                                                        event.priority === 'high' ? 'bg-red-500' :
                                                        event.priority === 'medium' ? 'bg-amber-500' :
                                                        'bg-blue-500'
                                                    }`}>
                                                        {event.priority}
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="space-y-1 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-3 w-3" />
                                                    <span>{event.assigned_to}</span>
                                                </div>
                                                {event.start_time && (
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-3 w-3" />
                                                        <span>
                                                            {new Date(`2000-01-01T${event.start_time}`).toLocaleTimeString()} -
                                                            {event.end_time && new Date(`2000-01-01T${event.end_time}`).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    {event.status === 'verified' ? (
                                                        <CheckCircle2 className="h-3 w-3 text-primary" />
                                                    ) : event.status === 'rejected' ? (
                                                        <XCircle className="h-3 w-3 text-red-600" />
                                                    ) : (
                                                        <AlertCircle className="h-3 w-3 text-amber-600" />
                                                    )}
                                                    <span className="capitalize">{event.status.replace('_', ' ')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}