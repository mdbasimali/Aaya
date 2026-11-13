import { useState, useEffect, useRef, useCallback } from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  Images,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  Bell,
  ExternalLink,
  CheckCheck,
  CheckCircle2,
  X,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import logo from '../assets/logo.png';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/bookings', label: 'Bookings', icon: CalendarCheck },
  { to: '/staff', label: 'Staff Management', icon: Users },
  { to: '/gallery', label: 'Gallery', icon: Images },
  { to: '/feedback', label: 'Feedback', icon: MessageSquare },
  { to: '/settings', label: 'Settings', icon: Settings },
];

// Helper to compute clean human-friendly relative time
function formatRelativeTime(dateString) {
  if (!dateString) return 'Just now';
  const now = Date.now();
  const diffMs = now - new Date(dateString).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 45) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateString).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
  });
}

// Icon helper per notification category
function getNotificationIcon(type) {
  switch (type) {
    case 'booking':
      return {
        icon: CalendarCheck,
        bg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      };
    case 'feedback':
      return {
        icon: MessageSquare,
        bg: 'bg-amber-50 text-amber-600 border border-amber-100',
      };
    case 'staff':
      return {
        icon: Users,
        bg: 'bg-pink-50 text-[#E90075] border border-pink-100',
      };
    case 'gallery':
      return {
        icon: Images,
        bg: 'bg-blue-50 text-blue-600 border border-blue-100',
      };
    default:
      return {
        icon: Bell,
        bg: 'bg-slate-50 text-slate-600 border border-slate-200',
      };
  }
}

export default function AdminLayout({ children }) {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Desktop sidebar collapse state (persisted in localStorage)
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('admin_sidebar_collapsed') === 'true';
  });

  // Mobile drawer state
  const [mobileOpen, setMobileOpen] = useState(false);

  // Dynamic Notifications state
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const notifRef = useRef(null);

  // Sync collapsed state to localStorage
  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('admin_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Click outside to close notification popover
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notifOpen]);

  // Fetch real activity notifications from backend
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/admin/notifications?limit=25');
      if (res.data?.success) {
        setNotifications(res.data.data || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch {
      // Silently fall through on network interruptions
    }
  }, []);

  // Initial load and efficient 25-second polling
  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      // Only poll when the tab is visible to conserve network and battery
      if (typeof document !== 'undefined' && !document.hidden) {
        fetchNotifications();
      }
    }, 25000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Immediate refresh when opening dropdown
  const handleToggleNotif = () => {
    const nextState = !notifOpen;
    setNotifOpen(nextState);
    if (nextState) {
      fetchNotifications();
    }
  };

  // Mark a single notification as read and navigate to destination
  const handleNotificationClick = async (notif) => {
    const notifId = notif.id || notif._id;
    if (!notif.isRead) {
      try {
        await api.patch(`/admin/notifications/${notifId}/read`);
        setNotifications((prev) =>
          prev.map((n) => ((n.id || n._id) === notifId ? { ...n, isRead: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        // Continue navigation even if network mark fails
      }
    }
    setNotifOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    try {
      await api.patch('/admin/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Silently ignore
    }
  };

  // Determine current page title for breadcrumb
  const currentNavItem = NAV_ITEMS.find((item) =>
    item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
  );
  const pageTitle = currentNavItem ? currentNavItem.label : 'Admin';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* ── MOBILE BACKDROP ── */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* ── SIDEBAR (Fixed Desktop + Slide-over Mobile) ── */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#0B132B] text-slate-300 border-r border-slate-800 transition-all duration-300 ease-in-out ${
          collapsed ? 'lg:w-20' : 'lg:w-64'
        } ${
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80 bg-[#080E20]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-white/95 p-1.5 flex items-center justify-center shrink-0 shadow-sm">
              <img src={logo} alt="Reeyansh Aya Care" className="w-full h-full object-contain" />
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="truncate">
                <h1 className="text-sm font-bold text-white tracking-tight leading-tight truncate">
                  Reeyansh Aya Care
                </h1>
                <p className="text-[11px] text-pink-400 font-semibold tracking-wide uppercase">
                  Admin Panel
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto">
          {(!collapsed || mobileOpen) && (
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Main Menu
            </p>
          )}

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#E90075]/25 to-[#E90075]/10 text-white font-semibold border-l-4 border-[#E90075] shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  } ${collapsed && !mobileOpen ? 'justify-center px-0' : ''}`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={20}
                      className={`shrink-0 transition-colors ${
                        isActive ? 'text-[#E90075]' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    
                    {(!collapsed || mobileOpen) && (
                      <span className="truncate">{item.label}</span>
                    )}

                    {collapsed && !mobileOpen && (
                      <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-slate-700">
                        {item.label}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-[#080E20]/60 space-y-1">
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex w-full items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight size={18} />
            ) : (
              <>
                <ChevronLeft size={18} />
                <span className="truncate">Collapse Sidebar</span>
              </>
            )}
          </button>

          <button
            onClick={logout}
            className={`w-full flex items-center gap-3 py-2.5 px-3 text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer ${
              collapsed && !mobileOpen ? 'justify-center px-0' : ''
            }`}
            title="Log Out"
          >
            <LogOut size={18} className="shrink-0" />
            {(!collapsed || mobileOpen) && <span className="truncate">Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT WRAPPER ── */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          collapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Left: Mobile hamburger & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400 hidden sm:inline">Admin</span>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <h2 className="font-bold text-slate-800 tracking-tight">{pageTitle}</h2>
            </div>
          </div>

          {/* Right: Actions, Live Site, Dynamic Notifications, Profile */}
          <div className="flex items-center gap-3">
            
            {/* View live public site */}
            <a
              href="https://reeyanshayacare.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-pink-600 bg-slate-50 hover:bg-pink-50/50 border border-slate-200 rounded-xl transition-colors"
              title="Open public website in new tab"
            >
              <span>Live Site</span>
              <ExternalLink size={13} />
            </a>

            {/* ── DYNAMIC NOTIFICATIONS DROPDOWN ── */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={handleToggleNotif}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Recent Activity & Notifications"
                aria-expanded={notifOpen}
              >
                <Bell size={19} />
                
                {/* Dynamic Unread Badge */}
                {unreadCount > 0 ? (
                  <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-[#E90075] text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white shadow-xs">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                ) : null}
              </button>

              {/* Notification Popover Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                  
                  {/* Dropdown Header */}
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Recent Activity
                      </h3>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-bold text-white bg-[#E90075] px-2 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>

                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-pink-600 hover:text-pink-700 hover:underline cursor-pointer"
                        title="Mark all notifications as read"
                      >
                        <CheckCheck size={14} />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>

                  {/* Scrollable Notification Activity Feed */}
                  <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center space-y-2">
                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                          <Bell size={20} />
                        </div>
                        <p className="text-xs font-semibold text-slate-700">No recent activities</p>
                        <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                          Staff updates, customer feedback reviews, and booking inquiries will appear here automatically.
                        </p>
                      </div>
                    ) : (
                      notifications.map((notif) => {
                        const id = notif.id || notif._id;
                        const { icon: ActivityIcon, bg: iconBg } = getNotificationIcon(notif.type);
                        const isUnread = !notif.isRead;

                        return (
                          <div
                            key={id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`p-3.5 flex items-start gap-3 hover:bg-slate-50/80 transition-colors cursor-pointer group ${
                              isUnread ? 'bg-pink-50/30' : ''
                            }`}
                          >
                            {/* Category Icon */}
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                              <ActivityIcon size={16} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <p className={`text-xs truncate ${isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                                  {notif.title}
                                </p>
                                <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                                  {formatRelativeTime(notif.createdAt)}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                                {notif.message}
                              </p>
                            </div>

                            {/* Unread Indicator Dot */}
                            {isUnread && (
                              <div className="w-2 h-2 rounded-full bg-[#E90075] shrink-0 mt-1.5" />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Dropdown Footer */}
                  <div className="p-2.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
                    <button
                      onClick={() => {
                        setNotifOpen(false);
                        navigate('/dashboard');
                      }}
                      className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-[#E90075] transition-colors p-1"
                    >
                      <span>View All in Dashboard</span>
                      <ArrowRight size={13} />
                    </button>
                    <button
                      onClick={() => setNotifOpen(false)}
                      className="text-slate-400 hover:text-slate-700 px-2 py-1 rounded-md"
                    >
                      Close
                    </button>
                  </div>

                </div>
              )}
            </div>

            {/* Admin Profile Chip */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#E90075] to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {admin?.name ? admin.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-36">
                  {admin?.name || 'Administrator'}
                </p>
                <p className="text-[11px] text-slate-400 leading-tight truncate max-w-36">
                  {admin?.email}
                </p>
              </div>
            </div>

          </div>

        </header>

        {/* Content Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

      </div>

    </div>
  );
}
