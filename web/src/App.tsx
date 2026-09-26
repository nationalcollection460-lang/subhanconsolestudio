import { Navigate, Outlet, Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import { Logo, Spinner } from './components/ui';
import { AdminProvider } from './lib/admin';
import { SiteProvider, useSite } from './lib/site';
import About from './pages/About';
import Apply from './pages/Apply';
import Contact from './pages/Contact';
import Courses from './pages/Courses';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import NotFound from './pages/NotFound';
import Services from './pages/Services';
import Students from './pages/Students';
import AdminAccount from './admin/AdminAccount';
import AdminApplications from './admin/AdminApplications';
import AdminContent from './admin/AdminContent';
import AdminDashboard from './admin/AdminDashboard';
import AdminLayout from './admin/AdminLayout';
import AdminLogin from './admin/AdminLogin';
import AdminMessages from './admin/AdminMessages';
import AdminSettings from './admin/AdminSettings';

function Splash() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5">
      <Logo size={56} />
      <div className="flex items-center gap-3 text-sm text-slate-400">
        <Spinner />
        Loading Subhan Console Studio…
      </div>
    </div>
  );
}

function PublicShell() {
  const { loading, site } = useSite();
  if (loading && !site) return <Splash />;
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export default function App() {
  return (
    <SiteProvider>
      <AdminProvider>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="applications" element={<AdminApplications />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="courses" element={<AdminContent resource="courses" />} />
            <Route path="jobs" element={<AdminContent resource="jobs" />} />
            <Route path="services" element={<AdminContent resource="services" />} />
            <Route path="ads" element={<AdminContent resource="ads" />} />
            <Route path="students" element={<AdminContent resource="students" />} />
            <Route path="categories" element={<AdminContent resource="categories" />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="account" element={<AdminAccount />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>

          <Route element={<PublicShell />}>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/services" element={<Services />} />
            <Route path="/students" element={<Students />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/apply" element={<Apply />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AdminProvider>
    </SiteProvider>
  );
}
