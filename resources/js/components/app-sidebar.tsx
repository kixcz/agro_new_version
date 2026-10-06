import {
    LayoutGrid,
    Users,
    Tags,
    Sprout,
    Leaf,
    UserRound,
    UsersRound,
    Activity,
    Award,
    WormIcon,
    Bug,
    Ruler,
    ClipboardList,
    FileCheck,
    HandCoinsIcon,
    Wallet,
    Layers,
    CheckSquare,
    Truck,
    Scale,
    FileText,
    FolderOpen,
    FlaskConical,
    Shield,
    ClipboardCheck,
    Key,
    Calendar,
    Star,
    Trophy,
    PanelLeftClose,
    PanelLeftOpen,
} from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import OfflineStatusIndicator from '@/components/offline-status-indicator';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage, router } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const { state, toggleSidebar } = useSidebar();
    const isCollapsed = state === 'collapsed';
    const isSuperAdmin = auth.user.role?.name === 'super admin';
    const isAdmin = auth.user.role?.name === 'admin';
    const scrollAreaContainerRef = useRef<HTMLDivElement>(null);
    const SCROLL_STORAGE_KEY = 'sidebar_scroll_position';

    // Helper to get the viewport element
    const getViewport = () => {
        if (!scrollAreaContainerRef.current) return null;
        return scrollAreaContainerRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
    };

    // Restore scroll position on mount
    useEffect(() => {
        const savedPosition = sessionStorage.getItem(SCROLL_STORAGE_KEY);
        if (savedPosition) {
            const scrollTop = parseInt(savedPosition, 10);
            if (!isNaN(scrollTop)) {
                setTimeout(() => {
                    const viewport = getViewport();
                    if (viewport) {
                        viewport.scrollTop = scrollTop;
                    }
                }, 0);
            }
        }
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const viewport = getViewport();
            if (viewport) {
                sessionStorage.setItem(SCROLL_STORAGE_KEY, viewport.scrollTop.toString());
            }
        };

        const timeoutId = setTimeout(() => {
            const viewport = getViewport();
            if (viewport) {
                viewport.addEventListener('scroll', handleScroll);
            }
        }, 0);

        const unsubscribe = router.on('start', () => {
            const viewport = getViewport();
            if (viewport) {
                sessionStorage.setItem(SCROLL_STORAGE_KEY, viewport.scrollTop.toString());
            }
        });

        return () => {
            clearTimeout(timeoutId);
            const viewport = getViewport();
            if (viewport) {
                viewport.removeEventListener('scroll', handleScroll);
            }
            unsubscribe();
        };
    }, []);

    const navGroups: NavGroup[] = [
        {
            title: 'Main',
            items: [
                {
                    title: 'Dashboard',
                    url: '/dashboard',
                    icon: LayoutGrid,
                },
            ],
        },
    ];

    if (isAdmin) {
        navGroups.push({
            title: 'Farmer Records',
            items: [
                {
                    title: 'Farmers',
                    url: '/admin/farmers',
                    icon: UserRound,
                },
                {
                    title: 'Farms',
                    url: '/admin/farms',
                    icon: Award,
                },
            ],
        });

        navGroups.push({
            title: 'Programs & Assistance',
            items: [
                {
                    title: 'Distribution Records',
                    url: '/admin/distribution-records',
                    icon: Truck,
                },
            ],
        });

        navGroups.push({
            title: 'Damage Logs',
            items: [
                {
                    title: 'Crop Damage Records',
                    url: '/admin/crop-damage-records',
                    icon: FileText,
                },
            ],
        });

        // Crop Monitoring Section
        navGroups.push({
            title: 'Crop Monitoring',
            items: [
                {
                    title: 'Monitoring Folders',
                    url: '/admin/monitoring-folders',
                    icon: FolderOpen,
                },
            ],
        });

        // Task & Report Management
        navGroups.push({
            title: 'Task & Report Management',
            items: [
                {
                    title: 'Task Management',
                    url: '/admin/tasks',
                    icon: ClipboardCheck,
                },
                {
                    title: 'Technician Reports',
                    url: '/admin/technician-reports',
                    icon: FileText,
                },
                {
                    title: 'Activity Calendar',
                    url: '/admin/calendar',
                    icon: Calendar,
                },
            ],
        });

        // Points Management
        navGroups.push({
            title: 'Points Management',
            items: [
                {
                    title: 'Points Dashboard',
                    url: '/admin/points-management',
                    icon: Trophy,
                },
                {
                    title: 'Point Rules',
                    url: '/admin/point-rules',
                    icon: Star,
                },
                {
                    title: 'Reward Redemptions',
                    url: '/admin/reward-redemptions',
                    icon: Award,
                },
                {
                    title: 'Activity Log',
                    url: '/admin/activity-log',
                    icon: Activity,
                },
            ],
        });
    }

    if (isSuperAdmin) {
        navGroups.push({
            title: 'Crop Library',
            items: [
                {
                    title: 'Categories',
                    url: '/super-admin/categories',
                    icon: Tags,
                },
                {
                    title: 'Commodities',
                    url: '/super-admin/commodities',
                    icon: Sprout,
                },
                {
                    title: 'Varieties',
                    url: '/super-admin/varieties',
                    icon: Leaf,
                },
            ],
        });

        navGroups.push({
            title: 'Programs & Assistance',
            items: [
                {
                    title: 'Programs',
                    url: '/super-admin/programs',
                    icon: HandCoinsIcon,
                },
                {
                    title: 'Funding Sources',
                    url: '/super-admin/funding-sources',
                    icon: Wallet,
                },
                {
                    title: 'Assistance Categories',
                    url: '/super-admin/assistance-categories',
                    icon: Layers,
                },
                {
                    title: 'Allocation Types',
                    url: '/super-admin/allocation-types',
                    icon: ClipboardList,
                },
                {
                    title: 'Eligibility Rules',
                    url: '/super-admin/eligibility-rules',
                    icon: CheckSquare,
                },
                {
                    title: 'Allocation Policies',
                    url: '/super-admin/allocation-policies',
                    icon: Scale,
                },
                {
                    title: 'Formula Types',
                    url: '/super-admin/formula-types',
                    icon: FlaskConical,
                },
            ],
        });

        navGroups.push({
            title: 'Damage Logs',
            items: [
                {
                    title: 'Damage Categories',
                    url: '/super-admin/damage-categories',
                    icon: WormIcon,
                },
                {
                    title: 'Damage Types',
                    url: '/super-admin/damage-types',
                    icon: Bug,
                },
            ],
        });

        navGroups.push({
            title: 'Crop Monitoring',
            items: [
                {
                    title: 'Monitoring Categories',
                    url: '/super-admin/monitoring-categories',
                    icon: Tags,
                },
            ],
        });

        navGroups.push({
            title: 'Supporting Infrastructure',
            items: [
                {
                    title: 'Organizations',
                    url: '/super-admin/organizations',
                    icon: UsersRound,
                },
                {
                    title: 'Unit of Measures',
                    url: '/super-admin/unit-of-measures',
                    icon: Ruler,
                },
                {
                    title: 'Farmer Eligibilities',
                    url: '/super-admin/farmer-eligibilities',
                    icon: FileCheck,
                },
            ],
        });

        navGroups.push({
            title: 'Privilege Management',
            items: [
                {
                    title: 'Role Management',
                    url: '/super-admin/roles',
                    icon: Shield,
                },
                {
                    title: 'User Privileges',
                    url: '/super-admin/privileges',
                    icon: Key,
                },
                {
                    title: 'User Monitoring',
                    url: '/super-admin/users',
                    icon: Users,
                },
            ],
        });

        navGroups.push({
            title: 'Monitoring',
            items: [
                {
                    title: 'Session Monitoring',
                    url: '/super-admin/sessions',
                    icon: Activity,
                },
                {
                    title: 'Audit Logs',
                    url: '/super-admin/audit-logs',
                    icon: FileText,
                },
            ],
        });
    }

    return (
        <Sidebar className="border-r border-sidebar-border bg-sidebar">
            <SidebarHeader className="h-16 border-b border-sidebar-border px-3 flex justify-center">
                {isCollapsed ? (
                    <div className="flex w-full items-center justify-center">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleSidebar}
                                    className="relative group h-10 w-10 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground mx-auto flex items-center justify-center rounded-lg"
                                    aria-label="Expand sidebar"
                                >
                                    <img
                                        src="/agroprofiler_logo.png"
                                        alt="AgroProfiler"
                                        className="h-7 w-7 rounded-md object-contain transition-opacity group-hover:opacity-0"
                                    />
                                    <PanelLeftOpen className="h-5 w-5 absolute opacity-0 transition-opacity group-hover:opacity-100 text-primary" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">Expand sidebar</TooltipContent>
                        </Tooltip>
                    </div>
                ) : (
                    <div className="flex w-full items-center justify-between gap-2 min-w-0 px-1">
                        <Link href="/dashboard" prefetch className="flex items-center gap-3 min-w-0">
                            <img
                                src="/agroprofiler_logo.png"
                                alt="AgroProfiler"
                                className="h-8 w-8 shrink-0 rounded-lg object-contain shadow-xs"
                            />
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-bold tracking-tight text-foreground truncate">
                                    AgroProfiler
                                </span>
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                                    {isSuperAdmin ? 'Super Admin' : isAdmin ? 'Admin Panel' : 'Dashboard'}
                                </span>
                            </div>
                        </Link>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleSidebar}
                                    className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                                    aria-label="Collapse sidebar"
                                >
                                    <PanelLeftClose className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">Collapse sidebar</TooltipContent>
                        </Tooltip>
                    </div>
                )}
            </SidebarHeader>

            <SidebarContent className={isCollapsed ? 'px-1 py-2' : 'px-2 py-3'}>
                <ScrollArea className="h-full" ref={scrollAreaContainerRef}>
                    <div className="flex flex-col gap-1 pb-4">
                        {navGroups.map((group) => (
                            <NavMain key={group.title} title={group.title} items={group.items} />
                        ))}
                    </div>
                </ScrollArea>
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border p-2">
                {!isCollapsed && (
                    <div className="mb-2 px-1 [&:has(>div:empty)]:hidden">
                        <OfflineStatusIndicator />
                    </div>
                )}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
