import { Slot } from '@radix-ui/react-slot';
import { VariantProps, cva } from 'class-variance-authority';
import { PanelLeft, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const SIDEBAR_STORAGE_KEY = 'sidebar:collapsed';

type SidebarMode = 'expanded' | 'collapsed' | 'hidden';

type SidebarContext = {
    state: 'expanded' | 'collapsed';
    sidebarMode: SidebarMode;
    open: boolean;
    setOpen: (open: boolean) => void;
    setSidebarMode: (mode: SidebarMode) => void;
    openMobile: boolean;
    setOpenMobile: (open: boolean) => void;
    isMobile: boolean;
    toggleSidebar: () => void;
    hideSidebar: () => void;
    showSidebar: () => void;
    customWidth: number | null;
    setCustomWidth: (width: number | null) => void;
    isResizing: boolean;
    setIsResizing: (resizing: boolean) => void;
};

const SidebarContext = React.createContext<SidebarContext | null>(null);

function useSidebar() {
    const context = React.useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider.');
    }

    return context;
}

const SidebarProvider = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<'div'> & {
        defaultOpen?: boolean;
        open?: boolean;
        onOpenChange?: (open: boolean) => void;
    }
>(({ defaultOpen = true, open: _openProp, onOpenChange: _setOpenProp, className, style, children, ...props }, ref) => {
    const isMobile = useIsMobile();
    const [openMobile, setOpenMobile] = React.useState(false);

    // Initial state loaded from localStorage
    const [isCollapsed, setIsCollapsed] = React.useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
            return saved === 'true';
        }
        return !defaultOpen;
    });

    const toggleSidebar = React.useCallback(() => {
        if (isMobile) {
            setOpenMobile((open) => !open);
        } else {
            setIsCollapsed((prev) => {
                const next = !prev;
                if (typeof window !== 'undefined') {
                    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
                }
                return next;
            });
        }
    }, [isMobile]);

    const hideSidebar = React.useCallback(() => {
        if (isMobile) {
            setOpenMobile(false);
        } else {
            setIsCollapsed(true);
            if (typeof window !== 'undefined') {
                localStorage.setItem(SIDEBAR_STORAGE_KEY, 'true');
            }
        }
    }, [isMobile]);

    const showSidebar = React.useCallback(() => {
        if (isMobile) {
            setOpenMobile(true);
        } else {
            setIsCollapsed(false);
            if (typeof window !== 'undefined') {
                localStorage.setItem(SIDEBAR_STORAGE_KEY, 'false');
            }
        }
    }, [isMobile]);

    // Listen for mobile navigation events
    React.useEffect(() => {
        const handleMobileNavigation = () => {
            if (isMobile) {
                setOpenMobile(false);
            }
        };

        window.addEventListener('mobile-navigation', handleMobileNavigation);
        return () => window.removeEventListener('mobile-navigation', handleMobileNavigation);
    }, [isMobile]);

    const state = isCollapsed ? 'collapsed' : 'expanded';

    const contextValue = React.useMemo<SidebarContext>(
        () => ({
            state,
            sidebarMode: state,
            open: !isCollapsed,
            setOpen: (open) => {
                setIsCollapsed(!open);
                if (typeof window !== 'undefined') {
                    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(!open));
                }
            },
            setSidebarMode: (mode) => {
                const collapsed = mode === 'collapsed';
                setIsCollapsed(collapsed);
                if (typeof window !== 'undefined') {
                    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
                }
            },
            isMobile,
            openMobile,
            setOpenMobile,
            toggleSidebar,
            hideSidebar,
            showSidebar,
            customWidth: null,
            setCustomWidth: () => {},
            isResizing: false,
            setIsResizing: () => {},
        }),
        [state, isCollapsed, isMobile, openMobile, toggleSidebar, hideSidebar, showSidebar],
    );

    return (
        <SidebarContext.Provider value={contextValue}>
            <TooltipProvider delayDuration={0}>
                <div
                    style={
                        {
                            '--sidebar-width': isCollapsed ? '4rem' : '16rem',
                            ...style,
                        } as React.CSSProperties
                    }
                    className={cn('flex min-h-screen w-full bg-background', className)}
                    ref={ref}
                    {...props}
                >
                    {children}
                </div>
            </TooltipProvider>
        </SidebarContext.Provider>
    );
});
SidebarProvider.displayName = 'SidebarProvider';

const Sidebar = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<'div'> & {
        side?: 'left' | 'right';
        variant?: 'sidebar' | 'floating' | 'inset';
        collapsible?: 'offcanvas' | 'icon' | 'none';
    }
>(({ side = 'left', className, children, ...props }, ref) => {
    const { isMobile, openMobile, setOpenMobile, state } = useSidebar();
    const isCollapsed = state === 'collapsed';

    if (isMobile) {
        return (
            <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
                <SheetContent
                    data-sidebar="sidebar"
                    data-mobile="true"
                    className="w-72 bg-sidebar p-0 text-sidebar-foreground border-r border-sidebar-border [&>button]:hidden"
                    side={side}
                >
                    <SheetTitle className="sr-only">Sidebar Navigation</SheetTitle>
                    <div className="flex h-full w-full flex-col">{children}</div>
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <aside
            ref={ref}
            data-sidebar="sidebar"
            data-state={state}
            className={cn(
                'sticky top-0 z-30 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-in-out md:flex',
                isCollapsed ? 'w-16' : 'w-64',
                className,
            )}
            {...props}
        >
            {children}
        </aside>
    );
});
Sidebar.displayName = 'Sidebar';

const SidebarTrigger = React.forwardRef<React.ElementRef<typeof Button>, React.ComponentProps<typeof Button>>(
    ({ className, onClick, ...props }, ref) => {
        const { toggleSidebar, state } = useSidebar();
        const isCollapsed = state === 'collapsed';

        return (
            <Button
                ref={ref}
                data-sidebar="trigger"
                variant="ghost"
                size="icon"
                className={cn('h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground', className)}
                onClick={(event) => {
                    onClick?.(event);
                    toggleSidebar();
                }}
                {...props}
            >
                {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                <span className="sr-only">{isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}</span>
            </Button>
        );
    },
);
SidebarTrigger.displayName = 'SidebarTrigger';

// Resizing handle is disabled — renders nothing to maintain clean structure
const SidebarResizeHandle = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>((_props, _ref) => {
    return null;
});
SidebarResizeHandle.displayName = 'SidebarResizeHandle';

const SidebarRail = SidebarResizeHandle;

const SidebarInset = React.forwardRef<HTMLDivElement, React.ComponentProps<'main'>>(({ className, ...props }, ref) => {
    return (
        <main
            ref={ref}
            className={cn(
                'relative flex min-h-screen flex-1 flex-col min-w-0 bg-background',
                className,
            )}
            {...props}
        />
    );
});
SidebarInset.displayName = 'SidebarInset';

const SidebarInput = React.forwardRef<React.ElementRef<typeof Input>, React.ComponentProps<typeof Input>>(({ className, ...props }, ref) => {
    return (
        <Input
            ref={ref}
            data-sidebar="input"
            className={cn('h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring', className)}
            {...props}
        />
    );
});
SidebarInput.displayName = 'SidebarInput';

const SidebarHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(({ className, ...props }, ref) => {
    return <div ref={ref} data-sidebar="header" className={cn('flex flex-col shrink-0', className)} {...props} />;
});
SidebarHeader.displayName = 'SidebarHeader';

const SidebarFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(({ className, ...props }, ref) => {
    return <div ref={ref} data-sidebar="footer" className={cn('flex flex-col shrink-0 mt-auto', className)} {...props} />;
});
SidebarFooter.displayName = 'SidebarFooter';

const SidebarSeparator = React.forwardRef<React.ElementRef<typeof Separator>, React.ComponentProps<typeof Separator>>(
    ({ className, ...props }, ref) => {
        return <Separator ref={ref} data-sidebar="separator" className={cn('mx-2 w-auto bg-sidebar-border', className)} {...props} />;
    },
);
SidebarSeparator.displayName = 'SidebarSeparator';

const SidebarContent = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(({ className, ...props }, ref) => {
    return (
        <div
            ref={ref}
            data-sidebar="content"
            className={cn('flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden', className)}
            {...props}
        />
    );
});
SidebarContent.displayName = 'SidebarContent';

const SidebarGroup = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(({ className, ...props }, ref) => {
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';

    return (
        <div
            ref={ref}
            data-sidebar="group"
            className={cn('relative flex w-full min-w-0 flex-col', isCollapsed ? 'px-1 py-1' : 'px-3 py-2', className)}
            {...props}
        />
    );
});
SidebarGroup.displayName = 'SidebarGroup';

const SidebarGroupLabel = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'> & { asChild?: boolean }>(
    ({ className, asChild = false, ...props }, ref) => {
        const { state } = useSidebar();
        const isCollapsed = state === 'collapsed';
        const Comp = asChild ? Slot : 'div';

        if (isCollapsed) {
            return <div className="my-1 h-px w-full bg-sidebar-border/40" />;
        }

        return (
            <Comp
                ref={ref}
                data-sidebar="group-label"
                className={cn(
                    'flex h-7 shrink-0 items-center px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 outline-hidden',
                    className,
                )}
                {...props}
            />
        );
    },
);
SidebarGroupLabel.displayName = 'SidebarGroupLabel';

const SidebarGroupAction = React.forwardRef<HTMLButtonElement, React.ComponentProps<'button'> & { asChild?: boolean }>(
    ({ className, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button';

        return (
            <Comp
                ref={ref}
                data-sidebar="group-action"
                className={cn(
                    'absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-hidden ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
                    className,
                )}
                {...props}
            />
        );
    },
);
SidebarGroupAction.displayName = 'SidebarGroupAction';

const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(({ className, ...props }, ref) => (
    <div ref={ref} data-sidebar="group-content" className={cn('w-full text-sm', className)} {...props} />
));
SidebarGroupContent.displayName = 'SidebarGroupContent';

const SidebarMenu = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(({ className, ...props }, ref) => (
    <ul ref={ref} data-sidebar="menu" className={cn('flex w-full min-w-0 flex-col gap-1', className)} {...props} />
));
SidebarMenu.displayName = 'SidebarMenu';

const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(({ className, ...props }, ref) => (
    <li
        ref={ref}
        data-sidebar="menu-item"
        className={cn('group/menu-item relative list-none', className)}
        {...props}
    />
));
SidebarMenuItem.displayName = 'SidebarMenuItem';

const sidebarMenuButtonVariants = cva(
    'peer/menu-button flex w-full items-center gap-3 overflow-hidden rounded-lg px-3 py-2 text-left text-sm text-sidebar-foreground/80 outline-none ring-sidebar-ring transition-colors focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0 ' +
        'hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground ' +
        'data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-medium dark:data-[active=true]:bg-primary/20 ' +
        '[&>span:last-child]:min-w-0 [&>span:last-child]:flex-1 [&>span:last-child]:truncate',
    {
        variants: {
            variant: {
                default: '',
                outline:
                    'bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]',
            },
            size: {
                default: 'h-9 text-sm',
                sm: 'h-8 text-xs',
                lg: 'h-11 text-sm',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

const SidebarMenuButton = React.forwardRef<
    HTMLButtonElement,
    React.ComponentProps<'button'> & {
        asChild?: boolean;
        isActive?: boolean;
        tooltip?: string | React.ComponentProps<typeof TooltipContent>;
    } & VariantProps<typeof sidebarMenuButtonVariants>
>(({ asChild = false, isActive = false, variant = 'default', size = 'default', tooltip: _tooltip, className, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
        <Comp
            ref={ref}
            data-sidebar="menu-button"
            data-size={size}
            data-active={isActive}
            className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
            {...props}
        />
    );
});
SidebarMenuButton.displayName = 'SidebarMenuButton';

const SidebarMenuAction = React.forwardRef<
    HTMLButtonElement,
    React.ComponentProps<'button'> & {
        asChild?: boolean;
        showOnHover?: boolean;
    }
>(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
        <Comp
            ref={ref}
            data-sidebar="menu-action"
            className={cn(
                'absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0',
                showOnHover &&
                    'group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0',
                className,
            )}
            {...props}
        />
    );
});
SidebarMenuAction.displayName = 'SidebarMenuAction';

const SidebarMenuBadge = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        data-sidebar="menu-badge"
        className={cn(
            'pointer-events-none absolute right-1 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground',
            className,
        )}
        {...props}
    />
));
SidebarMenuBadge.displayName = 'SidebarMenuBadge';

const SidebarMenuSkeleton = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<'div'> & {
        showIcon?: boolean;
    }
>(({ className, showIcon = false, ...props }, ref) => {
    const width = React.useMemo(() => {
        return `${Math.floor(Math.random() * 40) + 50}%`;
    }, []);

    return (
        <div ref={ref} data-sidebar="menu-skeleton" className={cn('flex h-8 items-center gap-2 rounded-md px-2', className)} {...props}>
            {showIcon && <Skeleton className="size-4 rounded-md" data-sidebar="menu-skeleton-icon" />}
            <Skeleton
                className="h-4 max-w-(--skeleton-width) flex-1"
                data-sidebar="menu-skeleton-text"
                style={
                    {
                        '--skeleton-width': width,
                    } as React.CSSProperties
                }
            />
        </div>
    );
});
SidebarMenuSkeleton.displayName = 'SidebarMenuSkeleton';

const SidebarMenuSub = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(({ className, ...props }, ref) => (
    <ul
        ref={ref}
        data-sidebar="menu-sub"
        className={cn(
            'mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5',
            className,
        )}
        {...props}
    />
));
SidebarMenuSub.displayName = 'SidebarMenuSub';

const SidebarMenuSubItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(({ ...props }, ref) => <li ref={ref} {...props} />);
SidebarMenuSubItem.displayName = 'SidebarMenuSubItem';

const SidebarMenuSubButton = React.forwardRef<
    HTMLAnchorElement,
    React.ComponentProps<'a'> & {
        asChild?: boolean;
        size?: 'sm' | 'md';
        isActive?: boolean;
    }
>(({ asChild = false, size = 'md', isActive, className, ...props }, ref) => {
    const Comp = asChild ? Slot : 'a';

    return (
        <Comp
            ref={ref}
            data-sidebar="menu-sub-button"
            data-size={size}
            data-active={isActive}
            className={cn(
                'flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground/80 outline-hidden ring-sidebar-ring transition-colors hover:text-sidebar-foreground focus-visible:ring-2 active:text-primary disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
                'data-[active=true]:font-medium data-[active=true]:text-primary',
                size === 'sm' && 'text-xs',
                size === 'md' && 'text-sm',
                className,
            )}
            {...props}
        />
    );
});
SidebarMenuSubButton.displayName = 'SidebarMenuSubButton';

export {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInput,
    SidebarInset,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSkeleton,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarProvider,
    SidebarRail,
    SidebarResizeHandle,
    SidebarSeparator,
    SidebarTrigger,
    useSidebar,
};
