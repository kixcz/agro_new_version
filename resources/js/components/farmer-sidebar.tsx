import {
    LayoutGrid,
    Sprout,
    FileText,
    HandCoinsIcon,
    Megaphone,
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
import { Link, router } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

export function FarmerSidebar() {
    const { state, toggleSidebar } = useSidebar();
    const isCollapsed = state === 'collapsed';
    const scrollAreaContainerRef = useRef<HTMLDivElement>(null);
    const SCROLL_STORAGE_KEY = 'farmer_sidebar_scroll_position';

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

    const navGroups = [
        {
            title: 'Overview',
            items: [
                {
                    title: 'Dashboard',
                    url: '/dashboard',
                    icon: LayoutGrid,
                },
            ],
        },
        {
            title: 'My Farm',
            items: [
                {
                    title: 'My Farms',
                    url: '/farmer/farms',
                    icon: Sprout,
                },
                {
                    title: 'Crop Damage Reports',
                    url: '/farmer/crop-damage',
                    icon: FileText,
                },
            ],
        },
        {
            title: 'Assistance',
            items: [
                {
                    title: 'Allocations',
                    url: '/farmer/allocations',
                    icon: HandCoinsIcon,
                },
            ],
        },
        {
            title: 'Communication',
            items: [
                {
                    title: 'Announcements',
                    url: '/farmer/announcements',
                    icon: Megaphone,
                },
            ],
        },
    ];

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
                                    Farmer Portal
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
