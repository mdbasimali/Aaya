import { useState, useEffect, useCallback } from 'react';
import {
  CalendarCheck,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Eye,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Phone,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  UserPlus,
  ArrowRight,
  TrendingUp,
  MapPin,
  MessageCircle,
} from 'lucide-react';
import api from '../services/api';
import BookingDetailsModal from '../components/BookingDetailsModal';
import StaffAssignmentModal from '../components/StaffAssignmentModal';

const SERVICES = [
  'All Services',
  'Old Woman Care',
  'Old Man Care',
  'Pregnancy Woman Care',
  'Newborn Baby Care',
  'Child Care (2 to 7 Years)',
];

const STATUSES = ['All Statuses', 'Pending', 'Approved', 'In Progress', 'Completed', 'Cancelled'];

const STATUS_BADGES = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Approved: 'bg-blue-50 text-blue-700 border-blue-200',
  'In Progress': 'bg-purple-50 text-purple-700 border-purple-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function BookingsAdmin() {
  // Tab state: 'today' | 'monthly' | 'pending' | 'all'
  const [activeTab, setActiveTab] = useState('all');

  // Month & Year filter for Monthly tab
  const now = new Date();
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1);
  const [filterYear, setFilterYear] = useState(now.getFullYear());

  // Search & secondary filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedService, setSelectedService] = useState('All Services');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedDate, setSelectedDate] = useState('');

  // Pagination & data
  const [bookings, setBookings] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Overview stats from backend (Asia/Kolkata timezone)
  const [stats, setStats] = useState({
    totalOrders: 0,
    todayOrders: 0,
    monthlyOrders: 0,
    pendingOrders: 0,
    approvedOrders: 0,
    inProgressOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
  });

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignMode, setAssignMode] = useState('approve'); // 'approve' | 'reassign'

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Debounce search without triggering redundant re-renders
  useEffect(() => {
    const handler = setTimeout(() => {
      const trimmed = search.trim();
      setDebouncedSearch((prev) => {
        if (prev !== trimmed) {
          setPage(1);
          return trimmed;
        }
        return prev;
      });
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch KPI overview stats
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await api.get(`/bookings/stats?month=${filterMonth}&year=${filterYear}`);
      if (res.data?.success && res.data.stats) {
        setStats(res.data.stats);
      }
    } catch {
      // Silently ignore stats fetch failure
    } finally {
      setStatsLoading(false);
    }
  }, [filterMonth, filterYear]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Fetch bookings list
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError('');

    const params = new URLSearchParams({
      page: String(page),
      limit: '10',
      tab: activeTab,
    });

    if (activeTab === 'monthly') {
      params.set('month', String(filterMonth));
      params.set('year', String(filterYear));
    }

    if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
    if (selectedService !== 'All Services') params.set('service', selectedService);
    if (selectedStatus !== 'All Statuses' && activeTab !== 'pending') params.set('status', selectedStatus);
    if (selectedDate) params.set('date', selectedDate);

    try {
      const res = await api.get(`/bookings?${params.toString()}`);
      if (res.data?.success) {
        setBookings(res.data.data || []);
        if (res.data.pagination) setPagination(res.data.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bookings.');
    } finally {
      setLoading(false);
    }
  }, [page, activeTab, filterMonth, filterYear, debouncedSearch, selectedService, selectedStatus, selectedDate]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Modal open handlers
  const handleOpenDetails = (booking) => {
    setSelectedBooking(booking);
    setDetailsModalOpen(true);
  };

  const handleOpenAssign = (booking, mode = 'approve') => {
    setSelectedBooking(booking);
    setAssignMode(mode);
    setAssignModalOpen(true);
  };

  const handleAssignSuccess = (message) => {
    showToast(message, 'success');
    fetchBookings();
    fetchStats();
  };

  const handleStatusUpdated = (message) => {
    showToast(message, 'success');
    fetchBookings();
    fetchStats();
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedService('All Services');
    setSelectedStatus('All Statuses');
    setSelectedDate('');
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl text-sm animate-in slide-in-from-bottom-5 duration-200">
          {toast.type === 'success' ? (
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-rose-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <CalendarCheck className="text-[#E90075]" size={26} />
            Order Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Oversee customer booking requests, assign verified caregivers, and manage care schedules
          </p>
        </div>

        <button
          onClick={() => {
            fetchBookings();
            fetchStats();
          }}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ── OVERVIEW KPI CARDS (Real MongoDB Records) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        
        {/* Today */}
        <div
          onClick={() => {
            setActiveTab('today');
            setPage(1);
          }}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'today'
              ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-100 shadow-xs'
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Today</span>
          <p className="text-xl font-extrabold text-blue-700 mt-1">{stats.todayOrders}</p>
          <span className="text-[10px] text-slate-400">Created today</span>
        </div>

        {/* Monthly */}
        <div
          onClick={() => {
            setActiveTab('monthly');
            setPage(1);
          }}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'monthly'
              ? 'bg-purple-50/70 border-purple-400 ring-2 ring-purple-100 shadow-xs'
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Monthly</span>
          <p className="text-xl font-extrabold text-purple-700 mt-1">{stats.monthlyOrders}</p>
          <span className="text-[10px] text-slate-400">{MONTH_NAMES[filterMonth - 1]?.slice(0, 3)} {filterYear}</span>
        </div>

        {/* Pending */}
        <div
          onClick={() => {
            setActiveTab('pending');
            setPage(1);
          }}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-100 shadow-xs'
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Pending</span>
          <p className="text-xl font-extrabold text-amber-600 mt-1">{stats.pendingOrders}</p>
          <span className="text-[10px] text-amber-600/80 font-medium">Needs Approval</span>
        </div>

        {/* Approved */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Approved</span>
          <p className="text-xl font-extrabold text-slate-800 mt-1">{stats.approvedOrders}</p>
          <span className="text-[10px] text-slate-400">Staff assigned</span>
        </div>

        {/* In Progress */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">In Progress</span>
          <p className="text-xl font-extrabold text-purple-600 mt-1">{stats.inProgressOrders}</p>
          <span className="text-[10px] text-slate-400">Active care</span>
        </div>

        {/* Completed */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed</span>
          <p className="text-xl font-extrabold text-emerald-600 mt-1">{stats.completedOrders}</p>
          <span className="text-[10px] text-slate-400">Finished</span>
        </div>

        {/* Cancelled */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cancelled</span>
          <p className="text-xl font-extrabold text-rose-500 mt-1">{stats.cancelledOrders}</p>
          <span className="text-[10px] text-slate-400">Rejected / void</span>
        </div>

      </div>

      {/* ── TAB NAVIGATION & FILTERS CONTAINER ── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Tabs Bar */}
        <div className="px-5 pt-4 pb-2 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'all', label: 'All Orders', count: stats.totalOrders },
              { id: 'pending', label: 'Pending Approval', count: stats.pendingOrders, alert: true },
              { id: 'today', label: "Today's Orders", count: stats.todayOrders },
              { id: 'monthly', label: 'Monthly Orders', count: stats.monthlyOrders },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setPage(1);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#E90075] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                      active
                        ? 'bg-white/20 text-white'
                        : tab.alert && tab.count > 0
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Month & Year Selectors for Monthly Tab */}
          {activeTab === 'monthly' && (
            <div className="flex items-center gap-2 text-xs">
              <select
                value={filterMonth}
                onChange={(e) => {
                  setFilterMonth(parseInt(e.target.value, 10));
                  setPage(1);
                }}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold focus:outline-hidden"
              >
                {MONTH_NAMES.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>

              <select
                value={filterYear}
                onChange={(e) => {
                  setFilterYear(parseInt(e.target.value, 10));
                  setPage(1);
                }}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold focus:outline-hidden"
              >
                {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Secondary Filter & Search Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/40 flex flex-wrap items-center justify-between gap-3">
          
          {/* Search */}
          <div className="relative flex-1 min-w-[240px] max-w-sm">
            <Search size={15} className="absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, Name, or Mobile..."
              className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-hidden focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Service Filter */}
            <select
              value={selectedService}
              onChange={(e) => {
                setSelectedService(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-hidden"
            >
              {SERVICES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Status Filter (hidden on pending tab) */}
            {activeTab !== 'pending' && (
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-hidden"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            )}

            {/* Date filter */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-hidden text-xs"
            />

            {(search || selectedService !== 'All Services' || selectedStatus !== 'All Statuses' || selectedDate) && (
              <button
                onClick={handleClearFilters}
                className="px-3 py-2 text-xs font-semibold text-pink-600 hover:text-pink-700 hover:bg-pink-50 rounded-xl transition-colors"
              >
                Clear
              </button>
            )}
          </div>

        </div>

        {/* Error alert */}
        {error && (
          <div className="m-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchBookings}
              className="font-semibold underline text-xs ml-2 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── ORDERS DATA TABLE ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-semibold tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Booking ID</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Service</th>
                <th className="px-5 py-3.5">Dates / Shift</th>
                <th className="px-5 py-3.5">Assigned Caregiver</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading && bookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center text-slate-400">
                    <Loader2 size={24} className="animate-spin mx-auto text-[#E90075] mb-2" />
                    <p className="text-xs">Loading orders from database...</p>
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-14 text-center">
                    <div className="max-w-sm mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <CalendarCheck size={24} />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800">
                        {activeTab === 'pending'
                          ? 'No pending orders awaiting approval'
                          : activeTab === 'today'
                          ? 'No new orders received today'
                          : 'No booking orders found'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {search || selectedService !== 'All Services' || selectedStatus !== 'All Statuses'
                          ? 'Try adjusting your search keywords or clearing active filters.'
                          : 'Customer booking submissions from the website will automatically populate here.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                bookings.map((b) => {
                  const id = b._id || b.id;
                  const staff = b.assignedStaff || b.assignedStaffSnapshot;
                  const hasStaff = Boolean(staff && staff.name);

                  return (
                    <tr key={id} className="hover:bg-slate-50/70 transition-colors group">
                      
                      {/* Booking ID */}
                      <td className="px-5 py-3.5 font-mono text-xs">
                        <button
                          onClick={() => handleOpenDetails(b)}
                          className="font-bold text-pink-600 hover:text-pink-700 hover:underline cursor-pointer"
                        >
                          #{b.bookingId}
                        </button>
                        <span className="block text-[10px] text-slate-400 font-sans mt-0.5">
                          {new Date(b.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </td>

                      {/* Customer Info */}
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-slate-900">{b.clientName}</p>
                        <div className="flex items-center gap-1.5 mt-0.5 text-slate-500">
                          <a
                            href={`tel:+91${b.clientPhone}`}
                            className="hover:text-pink-600 font-mono text-[11px]"
                            title="Call customer"
                          >
                            +91 {b.clientPhone}
                          </a>
                        </div>
                      </td>

                      {/* Service */}
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-slate-800 block">{b.service}</span>
                        <span className="text-[11px] text-slate-400 block truncate max-w-xs" title={b.address}>
                          {b.address}
                        </span>
                      </td>

                      {/* Dates */}
                      <td className="px-5 py-3.5 text-slate-600">
                        <span className="font-medium text-slate-800 block">
                          {b.startDate}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          {b.durationDays} day(s) • {b.timeSlot?.split('(')[0] || 'Full Day'}
                        </span>
                      </td>

                      {/* Assigned Staff */}
                      <td className="px-5 py-3.5">
                        {hasStaff ? (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-pink-100 text-[#E90075] font-bold text-xs flex items-center justify-center shrink-0">
                              {staff.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 leading-tight">{staff.name}</p>
                              <span className="text-[10px] font-mono text-slate-500">
                                {staff.staffId}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            Not Assigned
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            STATUS_BADGES[b.status] || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Details Button */}
                          <button
                            onClick={() => handleOpenDetails(b)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="View Full Booking Details"
                          >
                            <Eye size={16} />
                          </button>

                          {/* Pending -> Approve via Staff Assignment */}
                          {b.status === 'Pending' && (
                            <button
                              onClick={() => handleOpenAssign(b, 'approve')}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-2xs transition-all cursor-pointer"
                            >
                              <UserCheck size={13} />
                              <span>Approve</span>
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION FOOTER ── */}
        {pagination.total > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing <strong className="text-slate-800">{(pagination.page - 1) * pagination.limit + 1}</strong> to{' '}
              <strong className="text-slate-800">{Math.min(pagination.page * pagination.limit, pagination.total)}</strong> of{' '}
              <strong className="text-slate-800">{pagination.total}</strong> bookings
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrevPage || loading}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
                <span>Previous</span>
              </button>

              <span className="px-2 font-semibold text-slate-800">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.hasNextPage || loading}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Booking Details Modal */}
      <BookingDetailsModal
        isOpen={detailsModalOpen}
        booking={selectedBooking}
        onClose={() => setDetailsModalOpen(false)}
        onOpenAssignModal={(booking, mode) => {
          setDetailsModalOpen(false);
          handleOpenAssign(booking, mode);
        }}
        onStatusUpdated={handleStatusUpdated}
      />

      {/* Staff Selection & Assignment Modal */}
      <StaffAssignmentModal
        isOpen={assignModalOpen}
        booking={selectedBooking}
        mode={assignMode}
        onClose={() => setAssignModalOpen(false)}
        onSuccess={handleAssignSuccess}
      />

    </div>
  );
}
