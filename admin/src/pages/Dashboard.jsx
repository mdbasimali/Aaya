import { useState, useEffect } from 'react';
import {
  Users,
  CalendarCheck,
  MessageSquare,
  Images,
  TrendingUp,
  UserPlus,
  Upload,
  ArrowRight,
  Star,
  CheckCircle2,
  Phone,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalStaff: 0,
    femaleStaff: 0,
    maleStaff: 0,
    totalFeedback: 0,
    approvedFeedback: 0,
    pendingFeedback: 0,
    totalGallery: 0,
    totalBookings: 0,
    todayBookings: 0,
    monthlyBookings: 0,
  });

  const [recentStaff, setRecentStaff] = useState([]);
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const [staffRes, feedbackRes, galleryRes, bookingStatsRes] = await Promise.allSettled([
          api.get('/admin/staff?limit=5'),
          api.get('/admin/feedback?limit=5'),
          api.get('/admin/gallery?limit=1'),
          api.get('/bookings/stats'),
        ]);

        // Staff
        if (staffRes.status === 'fulfilled' && staffRes.value.data?.success) {
          const sData = staffRes.value.data;
          setRecentStaff(sData.data || []);
          if (sData.stats) {
            setStats((prev) => ({
              ...prev,
              totalStaff: sData.stats.totalStaff || 0,
              femaleStaff: sData.stats.femaleStaff || 0,
              maleStaff: sData.stats.maleStaff || 0,
            }));
          }
        }

        // Bookings
        if (bookingStatsRes.status === 'fulfilled' && bookingStatsRes.value.data?.success) {
          const bStats = bookingStatsRes.value.data.stats || {};
          setStats((prev) => ({
            ...prev,
            totalBookings: bStats.totalOrders || 0,
            todayBookings: bStats.todayOrders || 0,
            monthlyBookings: bStats.monthlyOrders || 0,
          }));
        }

        // Feedback
        if (feedbackRes.status === 'fulfilled' && feedbackRes.value.data?.success) {
          const fData = feedbackRes.value.data;
          setRecentFeedback(fData.data || []);
          const items = fData.data || [];
          const approved = items.filter((f) => f.isApproved).length;
          setStats((prev) => ({
            ...prev,
            totalFeedback: items.length,
            approvedFeedback: approved,
            pendingFeedback: items.length - approved,
          }));
        }

        // Gallery
        if (galleryRes.status === 'fulfilled' && galleryRes.value.data?.success) {
          const gData = galleryRes.value.data;
          setStats((prev) => ({
            ...prev,
            totalGallery: gData.total || (gData.data ? gData.data.length : 0),
          }));
        }
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* ── WELCOME BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B132B] via-[#101F42] to-[#1C2541] p-6 sm:p-8 text-white shadow-lg border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-pink-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-[#E90075] animate-pulse" />
              Reeyansh Aya Care • Admin Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Reeyansh Aya Care Dashboard
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Overview of caregivers, bookings, gallery media, and client reviews.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/staff')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#E90075] hover:bg-[#d00068] text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <UserPlus size={16} />
              <span>Add Staff</span>
            </button>
            <button
              onClick={() => navigate('/bookings')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/15 backdrop-blur-md transition-all cursor-pointer"
            >
              <CalendarCheck size={16} />
              <span>Bookings Hub</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative circles */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-[#E90075]/10 blur-3xl pointer-events-none" />
      </div>

      {/* ── KPI METRIC CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Staff */}
        <Link
          to="/staff"
          className="group bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-pink-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Staff</span>
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#E90075] flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-extrabold text-slate-800">{stats.totalStaff}</p>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-pink-600">{stats.femaleStaff} Aya</span>
              <span>•</span>
              <span className="font-semibold text-slate-700">{stats.maleStaff} Male</span>
            </div>
          </div>
        </Link>

        {/* Card 2: Bookings */}
        <Link
          to="/bookings"
          className="group bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-purple-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bookings</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <CalendarCheck size={20} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-extrabold text-slate-800">{stats.totalBookings}</p>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-purple-600">{stats.todayBookings} Today</span>
              <span>•</span>
              <span className="font-semibold text-slate-700">{stats.monthlyBookings} This Month</span>
            </div>
          </div>
        </Link>

        {/* Card 3: Feedback */}
        <Link
          to="/feedback"
          className="group bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Client Feedback</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <MessageSquare size={20} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-extrabold text-slate-800">{stats.totalFeedback}</p>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <CheckCircle2 size={13} />
              <span>{stats.approvedFeedback} Public Testimonials</span>
            </div>
          </div>
        </Link>

      </div>

      {/* ── TWO-COLUMN PREVIEW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Staff Members */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-[#E90075]" />
              <h2 className="font-bold text-slate-800 text-sm">Recent Staff Registrations</h2>
            </div>
            <Link
              to="/staff"
              className="text-xs font-semibold text-pink-600 hover:text-pink-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="p-5 flex-1">
            {recentStaff.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                No staff members registered yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentStaff.map((staff) => (
                  <div key={staff.id || staff._id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-700 text-xs font-bold flex items-center justify-center shrink-0">
                        {staff.name ? staff.name.charAt(0) : 'S'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 leading-tight">{staff.name}</p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          {staff.staffId} • {staff.gender}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">
                        {staff.aadhaarMasked || `XXXX-XXXX-${staff.aadhaarLast4}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Latest Client Testimonials */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-amber-500" />
              <h2 className="font-bold text-slate-800 text-sm">Latest Family Feedback</h2>
            </div>
            <Link
              to="/feedback"
              className="text-xs font-semibold text-pink-600 hover:text-pink-700 flex items-center gap-1"
            >
              <span>Manage Feedback</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="p-5 flex-1">
            {recentFeedback.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                No feedback received yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recentFeedback.slice(0, 3).map((f) => (
                  <div key={f.id || f._id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-800">{f.name}</p>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[...Array(f.rating || 5)].map((_, i) => (
                          <Star key={i} size={11} fill="currentColor" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                      "{f.message}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

