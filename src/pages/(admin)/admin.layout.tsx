import { AdminBreadcrumb, BreadcrumbProvider } from '@components/admin-breadcrumb/AdminBreadcrumb';
import AdminSidebar from '@components/AdminSidebar';
import { SidebarProvider, SidebarTrigger } from '@components/tailus-ui/Sidebar';
import { useUser } from '@lib/auth';
import { ROLE } from '@lib/types';
import { Navigate, Outlet } from 'react-router-dom';

function AdminLayout() {
  const user = useUser();
  if (!user) return null;
  if (user?.role && typeof user.role === 'object' && 'name' in user.role && user.role.name === ROLE.USER) {
    return <Navigate to="/" />;
  }
  return (
    <BreadcrumbProvider>
      <SidebarProvider>
        <AdminSidebar />
        <main className="w-full h-screen">
          <header className="flex items-center divide-x-2 space-x-4 py-4 border-b w-full px-4">
            <SidebarTrigger intent="gray" />
            <AdminBreadcrumb className="pl-4" />
          </header>
          <Outlet />
        </main>
      </SidebarProvider>
    </BreadcrumbProvider>
  );
}

export default AdminLayout;
