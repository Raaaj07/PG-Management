import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { db } from '../data/mockData';
import {
  Menu, X, Sun, Moon, LogOut, Bell, Search, ChevronDown, User, Settings,
  LayoutDashboard, Building, Users, Settings2, ShieldCheck,
  UserCheck, DoorOpen, Home, Wallet, ShieldAlert, FileSpreadsheet, CalendarRange,
  BellRing, Pin
} from 'lucide-react';

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsList, setNotificationsList] = useState([]);
  const [pgName, setPgName] = useState('Elite Residency PG');
  
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch PG name
  useEffect(() => {
    const hostels = db.getHostels();
    if (hostels && hostels.length > 0) {
      setPgName(hostels[0].name);
    }
  }, []);

  // Load context-aware notifications (e.g. pending items)
  useEffect(() => {
    if (!user) return;
    
    let list = [];
    if (user.role === 'hostel-admin') {
      const openComplaints = db.getComplaints().filter(c => c.status === 'Pending');
      const pendingReviewFees = db.getFees().filter(f => f.status === 'Pending Review');
      openComplaints.forEach(c => {
        list.push({ id: `c-${c.id}`, title: 'New Complaint', desc: `${c.studentName}: ${c.title}`, time: '30m ago' });
      });
      pendingReviewFees.forEach(f => {
        list.push({ id: `f-${f.id}`, title: 'Fee Review Request', desc: `${f.studentName} paid for ${f.month}.`, time: '1h ago' });
      });
    } else if (user.role === 'warden') {
      const pendingLeaves = db.getLeaves().filter(l => l.status === 'Pending');
      const activeVisitors = db.getVisitors().filter(v => v.status === 'Checked In');
      pendingLeaves.forEach(l => {
        list.push({ id: `l-${l.id}`, title: 'Leave Application', desc: `${l.studentName} requested leave.`, time: '15m ago' });
      });
      activeVisitors.forEach(v => {
        list.push({ id: `v-${v.id}`, title: 'Visitor On-Site', desc: `${v.visitorName} is in Room ${v.roomNo}.`, time: 'Now' });
      });
    } else if (user.role === 'student') {
      const notices = db.getNotices().filter(n => n.target === 'All' || n.target === 'Students').slice(0, 2);
      const myFeePending = db.getFees().filter(f => f.studentId === user.id && f.status === 'Unpaid');
      notices.forEach(n => {
        list.push({ id: `n-${n.id}`, title: 'New Notice Board Post', desc: n.title, time: '2h ago' });
      });
      myFeePending.forEach(f => {
        list.push({ id: `sf-${f.id}`, title: 'Pending Fee Alert', desc: `Rent invoice of $${f.amount} for ${f.month} is due.`, time: '1d ago' });
      });
    }
    setNotificationsList(list);
  }, [user, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get Sidebar menu config based on role
  const getSidebarMenu = () => {
    switch (user?.role) {
      case 'hostel-admin':
        return [
          { name: 'Dashboard', path: '/hostel-admin', icon: LayoutDashboard },
          { name: 'Tenant Management', path: '/hostel-admin/tenants', icon: Users },
          { name: 'Room Management', path: '/hostel-admin/rooms', icon: Home },
          { name: 'Room Allocation', path: '/hostel-admin/allocations', icon: UserCheck },
          { name: 'Fee Management', path: '/hostel-admin/fees', icon: Wallet, badge: db.getFees().filter(f => f.status === 'Pending Review').length },
          { name: 'Complaint Management', path: '/hostel-admin/complaints', icon: ShieldAlert, badge: db.getComplaints().filter(c => c.status === 'Pending').length },
          { name: 'Leave Management', path: '/hostel-admin/leaves', icon: CalendarRange },
          { name: 'Visitor Management', path: '/hostel-admin/visitors', icon: DoorOpen },
          { name: 'Notice Board', path: '/hostel-admin/notices', icon: Pin },
          { name: 'Reports', path: '/hostel-admin/reports', icon: FileSpreadsheet },
          { name: 'PG Profile Settings', path: '/hostel-admin/settings', icon: Settings2 },
        ];
      case 'warden':
        return [
          { name: 'Dashboard', path: '/warden', icon: LayoutDashboard },
          { name: 'Tenant Monitoring', path: '/warden/tenants', icon: Users },
          { name: 'Complaint Box', path: '/warden/complaints', icon: ShieldAlert, badge: db.getComplaints().filter(c => c.status === 'Pending').length },
          { name: 'Leave Approvals', path: '/warden/leaves', icon: CalendarRange, badge: db.getLeaves().filter(l => l.status === 'Pending').length },
          { name: 'Visitor Tracking', path: '/warden/visitors', icon: DoorOpen, badge: db.getVisitors().filter(v => v.status === 'Checked In').length },
          { name: 'Notifications', path: '/warden/notifications', icon: BellRing },
        ];
      case 'student':
        return [
          { name: 'Dashboard', path: '/tenant', icon: LayoutDashboard },
          { name: 'Room Details', path: '/tenant/room', icon: Home },
          { name: 'Fee Status', path: '/tenant/fees', icon: Wallet, badge: db.getFees().filter(f => f.studentId === user.id && f.status === 'Unpaid').length },
          { name: 'Complaint Box', path: '/tenant/complaints', icon: ShieldAlert },
          { name: 'Leave Application', path: '/tenant/leaves', icon: CalendarRange },
          { name: 'Notice Board', path: '/tenant/notices', icon: Pin },
          { name: 'Visitor Requests', path: '/tenant/visitors', icon: DoorOpen },
          { name: 'Profile Details', path: '/tenant/profile', icon: User },
        ];
      default:
        return [];
    }
  };

  const menuItems = getSidebarMenu();
  const isActive = (path) => {
    return location.pathname === path;
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'hostel-admin':
        return 'Admin';
      case 'warden':
        return 'Warden';
      case 'student':
        return 'Tenant';
      default:
        return 'User';
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 overflow-hidden transition-colors duration-200">
      
      {/* Sidebar - Desktop */}
      <aside 
        className={`bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-850 flex flex-col transition-all duration-300 z-30 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-850 shrink-0">
          <Link to="/" className="flex items-center gap-2 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0 text-lg shadow-md shadow-indigo-600/10">
              H
            </div>
            {sidebarOpen && (
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent truncate">
                {pgName}
              </span>
            )}
          </Link>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar User Widget */}
        {sidebarOpen && (
          <div className="p-4 border-b border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/20">
            <div className="flex items-center gap-3">
              <img 
                src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60'} 
                alt="Profile" 
                className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20"
              />
              <div className="overflow-hidden">
                <h4 className="font-bold text-sm truncate">{user?.name}</h4>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{getRoleLabel(user?.role)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-grow overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={idx}
                to={item.path}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                  active 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' 
                    : 'text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-white' : 'text-slate-450 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white'}`} />
                  {sidebarOpen && <span className="truncate">{item.name}</span>}
                </div>
                {sidebarOpen && item.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${active ? 'bg-white text-indigo-600' : 'bg-red-500 text-white'}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-850 shrink-0">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-955/20 transition-all ${
              sidebarOpen ? '' : 'justify-center'
            }`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex-grow flex flex-col overflow-hidden">
        
        {/* Topbar Header */}
        <header className="h-16 bg-white dark:bg-slate-955 border-b border-slate-200 dark:border-slate-850 flex items-center justify-between px-6 shrink-0 z-20 transition-colors">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-855"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Search Box */}
            <div className="relative hidden sm:block w-64 md:w-80">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4.5 w-4.5 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Search anything..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileDropdownOpen(false);
                }}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {notificationsList.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-855 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-850 flex justify-between items-center">
                    <h3 className="font-bold text-sm">Notifications</h3>
                    <span className="text-xs bg-indigo-55/10 text-indigo-650 px-2 py-0.5 rounded font-semibold">
                      {notificationsList.length} Pending
                    </span>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850">
                    {notificationsList.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No new notifications.
                      </div>
                    ) : (
                      notificationsList.map((n) => (
                        <div key={n.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors cursor-pointer">
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white">{n.title}</h4>
                          <p className="text-xs text-slate-550 dark:text-slate-400 mt-0.5 leading-relaxed">{n.desc}</p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-505 mt-1 block">{n.time}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors"
              >
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60'}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/10"
                />
                <span className="text-sm font-semibold hidden md:block select-none">{user?.name.split(' ')[0]}</span>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-855 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-900/10">
                    <p className="text-xs text-slate-400 dark:text-slate-550 font-medium">Signed in as</p>
                    <p className="font-bold text-sm truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <div className="p-2 space-y-1">
                    <Link
                      to={user?.role === 'hostel-admin' ? '/hostel-admin/settings' : user?.role === 'student' ? '/tenant/profile' : '#'}
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-750 dark:text-slate-350 hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-450" />
                      My Profile
                    </Link>
                  </div>
                  <div className="p-2 border-t border-slate-100 dark:border-slate-850">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-955/20 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Content Pane */}
        <main className="flex-grow p-6 overflow-y-auto bg-slate-50 dark:bg-slate-900 scrollbar-thin transition-colors">
          <div className="max-w-7xl mx-auto h-full animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
};
