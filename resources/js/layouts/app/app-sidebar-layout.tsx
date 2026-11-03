import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { ThemeProvider } from '@/context/theme-context';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { type BreadcrumbItem } from '@/types';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: { children: React.ReactNode; breadcrumbs?: BreadcrumbItem[] }) {
    return (
        <ThemeProvider>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <AppSidebarHeader breadcrumbs={breadcrumbs} />
                    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">{children}</div>
                </SidebarInset>
            </SidebarProvider>
        </ThemeProvider>
    );
}
