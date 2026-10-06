import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';

export function NavMain({ title, items }: { title: string; items: NavItem[] }) {
    const { url } = usePage();
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';

    return (
        <SidebarGroup className="py-1">
            <SidebarGroupLabel className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {title}
            </SidebarGroupLabel>
            <SidebarMenu className="gap-0.5">
                {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = url === item.url || (item.url !== '/dashboard' && url.startsWith(item.url + '/'));

                    if (isCollapsed) {
                        return (
                            <SidebarMenuItem key={item.title} className="flex justify-center">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            className={cn(
                                                'h-9 w-9 mx-auto justify-center rounded-lg p-0 transition-colors',
                                                isActive
                                                    ? 'bg-primary/10 text-primary font-medium dark:bg-primary/20'
                                                    : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground'
                                            )}
                                        >
                                            <Link href={item.url} prefetch>
                                                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                                                <span className="sr-only">{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" align="center">
                                        {item.title}
                                    </TooltipContent>
                                </Tooltip>
                            </SidebarMenuItem>
                        );
                    }

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={isActive}
                                className={cn(
                                    'h-9 rounded-lg px-3 text-sm transition-colors',
                                    isActive
                                        ? 'bg-primary/10 text-primary font-medium dark:bg-primary/20'
                                        : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground'
                                )}
                            >
                                <Link href={item.url} prefetch>
                                    {Icon && <Icon className="h-4 w-4 shrink-0" />}
                                    <span className="truncate">{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
