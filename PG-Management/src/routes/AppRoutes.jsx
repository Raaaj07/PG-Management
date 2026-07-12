import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicLayout } from '../layouts/PublicLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage';
import { FeaturesPage } from '../pages/public/FeaturesPage';
import { AboutPage } from '../pages/public/AboutPage';
import { ContactPage } from '../pages/public/ContactPage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';
import { AccessDeniedPage } from '../pages/public/AccessDeniedPage';

// Hostel Admin (PG Admin) Pages
import { HostelAdminDashboard } from '../pages/hostel-admin/HostelAdminDashboard';
import { UserManagement } from '../pages/hostel-admin/UserManagement';
import { RoomManagement } from '../pages/hostel-admin/RoomManagement';
import { RoomAllocation } from '../pages/hostel-admin/RoomAllocation';
import { FeeManagement } from '../pages/hostel-admin/FeeManagement';
import { ComplaintManagement } from '../pages/hostel-admin/ComplaintManagement';
import { LeaveManagement } from '../pages/hostel-admin/LeaveManagement';
import VisitorManagement from '../pages/hostel-admin/VisitorManagement';
import NoticeBoard from '../pages/hostel-admin/NoticeBoard';
import Reports from '../pages/hostel-admin/Reports';
import ProfileSettings from '../pages/hostel-admin/ProfileSettings';

// Warden Pages
import WardenDashboard from '../pages/warden/WardenDashboard';
import TenantMonitoring from '../pages/warden/TenantMonitoring';
import WardenComplaintManagement from '../pages/warden/WardenComplaintManagement';
import LeaveApprovals from '../pages/warden/LeaveApprovals';
import VisitorTracking from '../pages/warden/VisitorTracking';
import Notifications from '../pages/warden/Notifications';
import WardenProfile from '../pages/warden/WardenProfile';

// Tenant Pages
import TenantDashboard from '../pages/tenant/TenantDashboard';
import RoomDetails from '../pages/tenant/RoomDetails';
import TenantFeeStatus from '../pages/tenant/TenantFeeStatus';
import ComplaintSubmission from '../pages/tenant/ComplaintSubmission';
import LeaveApplication from '../pages/tenant/LeaveApplication';
import TenantNoticeBoard from '../pages/tenant/TenantNoticeBoard';
import VisitorRequests from '../pages/tenant/VisitorRequests';
import TenantProfile from '../pages/tenant/TenantProfile';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages Layout */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Access Denied Route */}
      <Route path="/access-denied" element={<AccessDeniedPage />} />

      {/* Hostel Admin / PG Admin Protected Pages */}
      <Route
        path="/hostel-admin"
        element={
          <ProtectedRoute allowedRoles={['hostel-admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HostelAdminDashboard />} />
        <Route path="tenants" element={<UserManagement />} />
        <Route path="rooms" element={<RoomManagement />} />
        <Route path="allocations" element={<RoomAllocation />} />
        <Route path="fees" element={<FeeManagement />} />
        <Route path="complaints" element={<ComplaintManagement />} />
        <Route path="leaves" element={<LeaveManagement />} />
        <Route path="visitors" element={<VisitorManagement />} />
        <Route path="notices" element={<NoticeBoard />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<ProfileSettings />} />
      </Route>

      {/* Warden Protected Pages */}
      <Route
        path="/warden"
        element={
          <ProtectedRoute allowedRoles={['warden']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<WardenDashboard />} />
        <Route path="tenants" element={<TenantMonitoring />} />
        <Route path="complaints" element={<WardenComplaintManagement />} />
        <Route path="leaves" element={<LeaveApprovals />} />
        <Route path="visitors" element={<VisitorTracking />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<WardenProfile />} />
      </Route>

      {/* Tenant / Resident Protected Pages */}
      <Route
        path="/tenant"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<TenantDashboard />} />
        <Route path="room" element={<RoomDetails />} />
        <Route path="fees" element={<TenantFeeStatus />} />
        <Route path="complaints" element={<ComplaintSubmission />} />
        <Route path="leaves" element={<LeaveApplication />} />
        <Route path="notices" element={<TenantNoticeBoard />} />
        <Route path="visitors" element={<VisitorRequests />} />
        <Route path="profile" element={<TenantProfile />} />
      </Route>

      {/* Fallback to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
