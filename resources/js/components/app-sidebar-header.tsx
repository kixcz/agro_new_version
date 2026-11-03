import { Breadcrumbs } from '@/components/breadcrumbs';
import { ThemePicker } from '@/components/theme-picker';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RealTimeNotifications } from '@/components/real-time-notifications';
import { OfficeCalendarModal } from '@/components/office-calendar-modal';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { type SharedData, getFullName } from '@/types';
import { usePage } from '@inertiajs/react';
import { Search, MessageSquare, ChevronDown, Calendar } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();
    const fullName = getFullName(auth.user);
    const canViewOfficeCalendar = ['admin', 'super admin', 'technician'].includes(auth.user.role?.name ?? '');
    const [searchOpen, setSearchOpen] = useState(false);
    const [calendarModalOpen, setCalendarModalOpen] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (searchOpen && searchRef.current) {
            searchRef.current.focus();
        }
    }, [searchOpen]);

    return (
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-border/60 bg-background/95 px-4 backdrop-blur md:px-6">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1 md:hidden" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            
            <div className="ml-auto flex items-center gap-3">
                {/* Search Bar */}
                <div className={cn(
                    'relative transition-all duration-300',
                    searchOpen ? 'w-72' : 'w-9 md:w-64'
                )}>
                    <div className="hidden md:flex items-center rounded-full border border-border/80 bg-muted/30 px-3 shadow-2xs transition-colors focus-within:border-emerald-600 focus-within:bg-background">
                        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <input
                            ref={searchRef}
                            type="text"
                            placeholder="Search farmers, parcels, or reports..."
                            className="h-9 w-full bg-transparent px-2.5 text-xs outline-none placeholder:text-muted-foreground"
                        />
                    </div>
                    <div className="md:hidden">
                        {searchOpen ? (
                            <div className="flex items-center rounded-full border bg-background px-3 shadow-xs">
                                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search farmers, parcels, or reports..."
                                    className="h-9 w-full bg-transparent px-2 text-xs outline-none placeholder:text-muted-foreground"
                                    onBlur={() => setSearchOpen(false)}
                                />
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setSearchOpen(true)}
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-transparent transition-colors hover:bg-muted"
                            >
                                <Search className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Action Icons Container */}
                <div className="flex items-center gap-1 rounded-xl border px-1.5 py-1">
                    {/* Quick-Access Office Activity Calendar Modal */}
                    {canViewOfficeCalendar && (
                        <>
                            <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            type="button"
                                            onClick={() => setCalendarModalOpen(true)}
                                            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted"
                                            aria-label="Open Office Activity Calendar"
                                        >
                                            <Calendar className="h-4 w-4" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Office Activity Calendar</p></TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <OfficeCalendarModal
                                open={calendarModalOpen}
                                onOpenChange={setCalendarModalOpen}
                            />
                        </>
                    )}

                    {/* Messages */}
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted"
                                >
                                    <MessageSquare className="h-4 w-4" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent><p>Messages</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {/* Notifications */}
                    <RealTimeNotifications compact />
                </div>

                {/* Theme Picker */}
                <ThemePicker />

                {/* User Profile Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className="flex items-center gap-2.5 rounded-xl border px-2.5 py-1.5 transition-colors hover:bg-muted"
                        >
                            <Avatar className="h-7 w-7 overflow-hidden rounded-full">
                                <AvatarImage src={auth.user.avatar} alt={fullName} />
                                <AvatarFallback className="rounded-full bg-primary/10 text-primary text-xs font-semibold">
                                    {getInitials(fullName)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden flex-col items-start md:flex">
                                <span className="text-xs font-semibold leading-tight">{fullName}</span>
                                <span className="text-[10px] leading-tight text-muted-foreground">{auth.user.email}</span>
                            </div>
                            <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground md:block" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-60" align="end">
                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
