import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Phone,
  ShieldCheck,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  X,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import api from '../services/api';
import StaffModal from '../components/StaffModal';
import StaffDeleteModal from '../components/StaffDeleteModal';

export default function StaffAdmin() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [stats, setStats] = useState({
    totalStaff: 0,
    femaleStaff: 0,
    maleStaff: 0,
    otherStaff: 0,
  });

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null); // null = Add, obj = Edit
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset to page 1 on new search
    }, 350);

    return () => clearTimeout(handler);
  }, [search]);

  // Fetch staff data
  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: '10',
      });
      if (debouncedSearch.trim()) {
        queryParams.set('search', debouncedSearch.trim());
      }

      const res = await api.get(`/admin/staff?${queryParams.toString()}`);
      if (res.data?.success) {
        setStaffList(res.data.data || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      if (!err?.response) {
        setError('Network error. Unable to reach backend server.');
      } else {
        setError(err.response?.data?.message || 'Failed to load staff list.');
      }
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleOpenAdd = () => {
    setSelectedStaff(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (staff) => {
    setSelectedStaff(staff);
    setModalOpen(true);
  };

  const handleOpenDelete = (staff) => {
    setStaffToDelete(staff);
    setDeleteModalOpen(true);
  };

  const handleModalSuccess = (message) => {
    showToast(message, 'success');
    fetchStaff();
  };

  const handleDeleteSuccess = (message) => {
    showToast(message, 'success');
    fetchStaff();
  };

  return (
    <div className="space-y-6">
      
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
            <Users className="text-pink-600" size={26} />
            Staff Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Directory of registered ayas, caregivers, and domestic personnel
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold rounded-xl shadow-xs hover:shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <UserPlus size={18} />
          <span>Add Staff</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Staff</p>
            <p className="text-2xl font-bold text-slate-800">{stats.totalStaff}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <UserCheck size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Female / Aya</p>
            <p className="text-2xl font-bold text-slate-800">{stats.femaleStaff}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Male Staff</p>
            <p className="text-2xl font-bold text-slate-800">{stats.maleStaff}</p>
          </div>
        </div>
      </div>

      {/* Search and Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Search Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Name, Staff ID, or Mobile..."
              className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all placeholder:text-slate-400"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                title="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={fetchStaff}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors disabled:opacity-50"
              title="Refresh list"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="m-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchStaff}
              className="text-xs font-semibold underline hover:no-underline ml-2"
            >
              Retry
            </button>
          </div>
        )}

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Staff ID</th>
                <th className="px-5 py-3.5">Caregiver / Staff</th>
                <th className="px-5 py-3.5">Mobile</th>
                <th className="px-5 py-3.5">Aadhaar (Masked)</th>
                <th className="px-5 py-3.5">Age</th>
                <th className="px-5 py-3.5">Address</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading && staffList.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center text-slate-400">
                    <Loader2 size={28} className="animate-spin mx-auto mb-2 text-pink-600" />
                    <p className="text-xs">Loading staff records...</p>
                  </td>
                </tr>
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-14 text-center">
                    <div className="max-w-sm mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <Users size={24} />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800">
                        {debouncedSearch ? 'No matching staff found' : 'No staff members registered'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {debouncedSearch
                          ? `We couldn't find any staff member matching "${debouncedSearch}".`
                          : 'Get started by clicking the "Add Staff" button to register your first caregiver.'}
                      </p>
                      {debouncedSearch ? (
                        <button
                          onClick={() => setSearch('')}
                          className="mt-2 text-xs font-semibold text-pink-600 hover:text-pink-700 underline"
                        >
                          Clear search
                        </button>
                      ) : (
                        <button
                          onClick={handleOpenAdd}
                          className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          <UserPlus size={14} />
                          <span>Add First Staff</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                staffList.map((staff) => {
                  const id = staff._id || staff.id;
                  const initials = staff.name
                    ? staff.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()
                    : 'ST';

                  return (
                    <tr key={id} className="hover:bg-slate-50/60 transition-colors group">
                      
                      {/* Staff ID */}
                      <td className="px-5 py-3.5 font-mono text-xs font-semibold">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                          {staff.staffId}
                        </span>
                      </td>

                      {/* Caregiver Name & Gender */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-700 text-xs font-bold flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 leading-snug">{staff.name}</p>
                            <span
                              className={`inline-block text-[11px] font-medium px-1.5 py-0.2 rounded-sm ${
                                staff.gender === 'Female'
                                  ? 'bg-purple-50 text-purple-700'
                                  : staff.gender === 'Male'
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {staff.gender}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Mobile */}
                      <td className="px-5 py-3.5 text-slate-600">
                        <a
                          href={`tel:+91${staff.mobileNumber}`}
                          className="inline-flex items-center gap-1.5 hover:text-pink-600 font-mono text-xs transition-colors"
                          title="Click to call"
                        >
                          <Phone size={13} className="text-slate-400" />
                          <span>+91 {staff.mobileNumber}</span>
                        </a>
                      </td>

                      {/* Masked Aadhaar */}
                      <td className="px-5 py-3.5">
                        <div className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/60">
                          <ShieldCheck size={13} className="text-emerald-500 shrink-0" />
                          <span>{staff.aadhaarMasked || `XXXX-XXXX-${staff.aadhaarLast4}`}</span>
                        </div>
                      </td>

                      {/* Age */}
                      <td className="px-5 py-3.5 text-slate-600 text-xs">
                        {staff.age} yrs
                      </td>

                      {/* Address */}
                      <td className="px-5 py-3.5 text-slate-600 text-xs max-w-xs truncate" title={staff.address}>
                        <div className="flex items-center gap-1 truncate">
                          <MapPin size={13} className="text-slate-400 shrink-0" />
                          <span className="truncate">{staff.address}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(staff)}
                            className="p-1.5 text-slate-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit staff details"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(staff)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete staff record"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination.total > 0 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing{' '}
              <strong className="text-slate-800">
                {(pagination.page - 1) * pagination.limit + 1}
              </strong>{' '}
              to{' '}
              <strong className="text-slate-800">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </strong>{' '}
              of <strong className="text-slate-800">{pagination.total}</strong> staff members
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrevPage || loading}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
                <span>Previous</span>
              </button>

              <span className="px-2 font-medium text-slate-700">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.hasNextPage || loading}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Add / Edit Modal */}
      <StaffModal
        isOpen={modalOpen}
        initialStaff={selectedStaff}
        onClose={() => setModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      {/* Delete Confirmation Modal */}
      <StaffDeleteModal
        isOpen={deleteModalOpen}
        staff={staffToDelete}
        onClose={() => setDeleteModalOpen(false)}
        onSuccess={handleDeleteSuccess}
      />

    </div>
  );
}

