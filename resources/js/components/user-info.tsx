// user-info.tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { type User, getFullName } from '@/types';

const ROLE_RING: Record<string, string> = {
    'super admin': 'ring-primary/50',
    admin: 'ring-sidebar-foreground/20',
};

const ROLE_LABEL: Record<string, string> = {
    'super admin': 'Super Admin',
    admin: 'Admin',
};

export function UserInfo({ user, showEmail = false }: { user: User; showEmail?: boolean }) {
    const getInitials = useInitials();
    const fullName = getFullName(user);
    const roleKey = user.role?.name?.toLowerCase();
    const roleLabel = roleKey ? ROLE_LABEL[roleKey] : undefined;

    return (
        <>
            <Avatar
                className={cn(
                    'h-8 w-8 shrink-0 overflow-hidden rounded-full ring-2 transition-[box-shadow]',
                    (roleKey && ROLE_RING[roleKey]) || 'ring-transparent',
                )}
            >
                <AvatarImage src={user.avatar} alt={fullName} />
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {getInitials(fullName)}
                </AvatarFallback>
            </Avatar>
            {/* Collapsing is handled by the sidebar's data attribute, so the same component keeps
                showing the name and email when rendered inside a portalled dropdown.
                `flex-1` (basis 0) makes this width a pure function of the button's animating width,
                so it shrinks smoothly. Forcing `w-0 flex-none` instead switched flex-basis from 0%
                to auto, which cannot interpolate, so the text snapped shut on the first frame. */}
            <div className="grid min-w-0 flex-1 overflow-hidden text-left text-sm leading-tight transition-opacity duration-[250ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-data-[collapsible=icon]:opacity-0 motion-reduce:transition-none">
                <span className="truncate font-medium">{fullName}</span>
                {showEmail && <span className="text-muted-foreground truncate text-xs">{user.email}</span>}
                {showEmail && roleLabel && (
                    <span className="mt-1 inline-flex w-fit items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-primary uppercase">
                        {roleLabel}
                    </span>
                )}
            </div>
        </>
    );
}