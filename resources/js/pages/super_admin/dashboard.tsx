import AdminDashboard from '@/pages/admin/dashboard';
import { AnalyticsData } from '@/types/dashboard';

interface SuperAdminDashboardProps {
    analytics: AnalyticsData;
}

export default function SuperAdminDashboard({ analytics }: SuperAdminDashboardProps) {
    return <AdminDashboard analytics={analytics} />;
}
