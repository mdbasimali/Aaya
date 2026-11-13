import { useState, useEffect } from 'react';
import {
  X,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Phone,
  Calendar,
  Loader2,
  ShieldCheck,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import api from '../services/api';

export default function StaffAssignmentModal({
  isOpen,
  booking,
  mode = 'approve', // 'approve' | 'reassign'
  onClose,
  onSuccess,
}) {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [reason, setReason] = useState('Staff assignment requested by Admin');

  // Load staff availability for this specific booking
  useEffect(() => {
    if (!isOpen || !booking) return;

    setSelectedStaffId(null);
    setError('');
    setSearch('');
    setLoading(true);

    const bookingDbId = booking._id || booking.id;
    api
      .get(`/bookings/${bookingDbId}/staff-availability`)
      .then((res) => {
        if (res.data?.success) {
          setStaffList(res.data.staff || []);
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to check staff availability.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen, booking]);

  if (!isOpen || !booking) return null;

  const filteredStaff = staffList.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.staffId?.toLowerCase().includes(q) ||
      s.mobileNumber?.includes(q)
    );
  });

  const selectedStaff = staffList.find((s) => (s._id || s.id) === selectedStaffId);

  const handleConfirm = async () => {
    if (!selectedStaffId || submitting) return;

    setSubmitting(true);
    setError('');

    const bookingDbId = booking._id || booking.id;

    try {
      if (mode === 'approve') {
        const res = await api.put(`/bookings/${bookingDbId}/approve`, {
          staffId: selectedStaffId,
        });
        if (res.data?.success) {
          onSuccess(res.data.message || 'Booking approved and staff assigned successfully.');
          onClose();
        }
      } else {
        const res = await api.put(`/bookings/${bookingDbId}/reassign`, {
          staffId: selectedStaffId,
          reason,
        });
        if (res.data?.success) {
          onSuccess(res.data.message || 'Staff reassigned successfully.');
          onClose();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete staff assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/75">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-50 text-[#E90075] flex items-center justify-center font-bold">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {mode === 'approve' ? 'Select & Assign Caregiver' : 'Reassign Caregiver'}
              </h2>
              <p className="text-xs text-slate-500">
                {mode === 'approve'
                  ? 'Assign an available aya/caregiver to approve booking'
                  : 'Select a replacement staff member for this active booking'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Booking Context Banner */}
        <div className="px-6 py-3.5 bg-blue-50/60 border-b border-blue-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div>
            <span className="text-slate-500">Order:</span>{' '}
            <strong className="text-slate-800 font-mono">#{booking.bookingId}</strong>{' '}
            <span className="text-slate-300">•</span>{' '}
            <span className="text-slate-500">Client:</span>{' '}
            <strong className="text-slate-800">{booking.clientName}</strong>
          </div>
          <div className="flex items-center gap-1.5 text-blue-800 font-medium">
            <Calendar size={13} />
            <span>
              {booking.startDate} to {booking.endDate} ({booking.durationDays} days)
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Search bar */}
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search staff by Name, ID, or Mobile..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
            />
          </div>

          {/* Reassignment reason field */}
          {mode === 'reassign' && (
            <div>
              <label className="text-xs font-semibold text-slate-700">Reason for Reassignment</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Schedule adjustment, client request"
                className="mt-1 w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              />
            </div>
          )}

          {/* Staff List */}
          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {loading ? (
              <div className="py-12 text-center text-slate-400">
                <Loader2 size={24} className="animate-spin mx-auto text-[#E90075] mb-2" />
                <p className="text-xs">Checking real-time staff schedule...</p>
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No matching staff found in directory.
              </div>
            ) : (
              filteredStaff.map((staff) => {
                const isSelected = selectedStaffId === staff.id;
                const available = staff.isAvailable;

                return (
                  <div
                    key={staff.id}
                    onClick={() => {
                      if (available) setSelectedStaffId(staff.id);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      !available
                        ? 'bg-slate-50 border-slate-200/60 opacity-60 cursor-not-allowed'
                        : isSelected
                        ? 'bg-pink-50/50 border-[#E90075] ring-2 ring-pink-100 cursor-pointer shadow-xs'
                        : 'bg-white border-slate-200 hover:border-pink-300 hover:bg-slate-50/50 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          isSelected
                            ? 'bg-[#E90075] text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {staff.name ? staff.name.charAt(0) : 'S'}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900 leading-tight">
                            {staff.name}
                          </p>
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-sm ${
                              staff.gender === 'Female'
                                ? 'bg-purple-50 text-purple-700'
                                : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            {staff.gender}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="font-mono text-[11px] font-medium text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded">
                            {staff.staffId}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Phone size={11} className="text-slate-400" />
                            +91 {staff.mobileNumber}
                          </span>
                        </div>

                        {!available && staff.conflicts?.length > 0 && (
                          <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                            <AlertTriangle size={12} className="shrink-0" />
                            Assigned to #{staff.conflicts[0].bookingId} ({staff.conflicts[0].startDate} to {staff.conflicts[0].endDate})
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0 text-right">
                      {available ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={12} />
                          Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          Already Assigned
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Selected Staff Confirmation Card */}
          {selectedStaff && (
            <div className="p-3.5 rounded-xl bg-pink-50 border border-pink-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-pink-600 font-semibold block">Selected for Assignment:</span>
                <span className="text-slate-800 font-bold text-sm">
                  {selectedStaff.name} ({selectedStaff.staffId})
                </span>
                <span className="text-slate-500 block">+91 {selectedStaff.mobileNumber}</span>
              </div>
              <UserCheck size={24} className="text-[#E90075]" />
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedStaffId || submitting}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#E90075] hover:bg-[#d00068] rounded-xl shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            <span>
              {mode === 'approve' ? 'Confirm Approval & Assign Staff' : 'Confirm Staff Reassignment'}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}

