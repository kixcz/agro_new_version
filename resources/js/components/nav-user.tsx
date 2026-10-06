import { MoreVertical, LogOut, Settings, User as UserIcon, Palette, Key } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useSidebar } from '@/components/ui/sidebar';
import { useInitials } from '@/hooks/use-initials';
import { type SharedData, getFullName } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { cn } from '@/lib/utils';

export function NavUser() {
    const { auth } = usePage<SharedData>().props;
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';
    const user = auth.user;
    const fullName = getFullName(user);
    const getInitials = useInitials();
    const cleanup = useMobileNavigation();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {isCollapsed ? (
                    <button
                        type="button"
                        className="flex h-10 w-10 mx-auto items-center justify-center rounded-lg transition-colors hover:bg-sidebar-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                    >
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Avatar className="h-8 w-8 shrink-0 rounded-full border border-sidebar-border">
                                    <AvatarImage src={user.avatar} alt={fullName} />
                                    <AvatarFallback className="rounded-full bg-primary/10 text-primary text-xs font-semibold">
                                        {getInitials(fullName)}
                                    </AvatarFallback>
                                </Avatar>
                            </TooltipTrigger>
                            <TooltipContent side="right">{fullName}</TooltipContent>
                        </Tooltip>
                    </button>
                ) : (
                    <button
                        type="button"
                        className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-sidebar-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                    >
                        <Avatar className="h-8 w-8 shrink-0 rounded-full border border-sidebar-border">
                            <AvatarImage src={user.avatar} alt={fullName} />
                            <AvatarFallback className="rounded-full bg-primary/10 text-primary text-xs font-semibold">
                                {getInitials(fullName)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium text-foreground">{fullName}</span>
                            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                        </div>
                        <MoreVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </button>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-lg" side={isCollapsed ? "right" : "bottom"} align={isCollapsed ? "end" : "end"} sideOffset={4}>
                <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar className="h-8 w-8 rounded-full border border-sidebar-border">
                            <AvatarImage src={user.avatar} alt={fullName} />
                            <AvatarFallback className="rounded-full bg-primary/10 text-primary text-xs font-semibold">
                                {getInitials(fullName)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold">{fullName}</span>
                            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <Link
                            className="flex w-full items-center"
                            href="/settings/profile"
                            as="button"
                            prefetch
                            onClick={cleanup}
                        >
                            <UserIcon className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link
                            className="flex w-full items-center"
                            href="/settings/appearance"
                            as="button"
                            prefetch
                            onClick={cleanup}
                        >
                            <Palette className="mr-2 h-4 w-4" />
                            <span>Appearance</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link
                            className="flex w-full items-center"
                            href="/settings/password"
                            as="button"
                            prefetch
                            onClick={cleanup}
                        >
                            <Key className="mr-2 h-4 w-4" />
                            <span>Password</span>
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link
                        className="flex w-full items-center text-destructive focus:text-destructive"
                        method="post"
                        href={route('logout')}
                        as="button"
                        onClick={cleanup}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
