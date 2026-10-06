import { FarmerSidebar } from '@/components/farmer-sidebar';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { ThemeProvider } from '@/context/theme-context';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem } from '@/types';

export default function FarmerSidebarLayout({ children, breadcrumbs = [] }: { children: React.ReactNode; breadcrumbs?: BreadcrumbItem[] }) {
    return (
        <ThemeProvider>
            <SidebarProvider>
                <FarmerSidebar />
                <SidebarInset>
                    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center border-b border-border/60 bg-background/95 px-4 backdrop-blur md:px-6">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger className="-ml-1" />
                            <Breadcrumbs breadcrumbs={breadcrumbs} />
                        </div>
                    </header>
                    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                        {children}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </ThemeProvider>
    );
}
